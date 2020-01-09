/**
 * @module Terraform
 */
import axios from 'axios'
import fs from 'fs'

export default class Terraform {

    /**
     * Terraform Cloud class.
     * 
     * @param {string} token - Terraform Cloud token.
     * @param {string} org - Terraform Cloud organization.
     * @param {string} [address=`app.terraform.com`] - Terraform Cloud address.
     * @param {number} [retryDuration=1000] - Duration (ms) to wait before retrying configuration version request.
     */
    constructor(token, org, address = `app.terraform.io`, retryDuration = 1000) {
        this.axios = axios.create({
            baseURL: `https://${address}/api/v2`,
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': `application/vnd.api+json`              
            }
        })
        this.retryDuration = retryDuration
        this.org = org
        this.retryLimit = 10
    }

    /**
     * Check workspace exists, and returns Id.
     * 
     * @param {string} workspace - Workspace name.
     * @returns {string} - Workspace Id.
     */
    async _checkWorkspace(workspace) {

        try {
            if (workspace.indexOf(' ') >= 0) { throw new Error(`Workspace name should not contain spaces.`) }
            const res = await this.axios.get(`/organizations/${this.org}/workspaces/${workspace}`)
            if (!res.data || !res.data.data) {
                throw new Error('No data returned from request.')
            } else if (!res.data.data.id) {
                throw new Error('Workspace not found.')
            }

            return res.data.data.id
        } catch (err) {
            throw new Error(`Error checking the workspace: ${err.message}`)
        }
    }

    /**
     * Wait for specified time.
     * 
     * @param {number} ms - Duration. 
     */
    async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * Get configuration version upload status.
     * 
     * @param {string} configVersionId - the ID of the configuration version.
     */
    async _getConfigVersionStatus(configVersionId) {
        try {
            const res = await this.axios.get(`/configuration-versions/${configVersionId}`)
            console.log(`Updated configVersion: ${JSON.stringify(res.data.data)}`)

            return res.data.data.attributes.status
        } catch (err) {
            throw new Error(`Error getting configuration version: ${err.message}`)
        }
    }

    /**
     * Create new configuration version, and returns upload URL.
     * 
     * @param {string} workspaceId - Worspace Id.
     * @returns {string} - Configuration upload URL.
     */
    async _createConfigVersion(workspaceId) {

        try {
            const body = {
                data: {
                  type: "configuration-versions",
                  attributes: {
                    "auto-queue-runs": false
                    }
                }
            },
            res = await this.axios.post(`/workspaces/${workspaceId}/configuration-versions`, JSON.stringify(body))
            if (!res.data || !res.data.data) {
                throw new Error('No data returned from request.')
            } else if (!res.data.data.attributes || !res.data.data.attributes['upload-url']) {
                throw new Error('No upload URL was returned.')
            }
            const configVersion = res.data.data
            console.log(`Initial configVersion: ${JSON.stringify(configVersion)}`)
            let { status } = configVersion.attributes
            let counter = 0
            let retryDuration = this.retryDuration
            // needs logging.
            console.log(`Initial status: ${status}`)
            while (status === 'pending') {
                if (counter < this.retryLimit) {
                    console.log(`counter and retryLimit: ${counter}, ${this.retryLimit}`)
                    console.log(`will now sleep`)
                    await this._sleep(retryDuration)
                    console.log(`awake`)
                    status = await this._getConfigVersionStatus(configVersion.id)
                    console.log(`update status: ${status}`)
                    counter += 1
                    retryDuration *= 2
                } else {
                    throw new Error(`Config version status was still pending after ${this.retryLimit} attempts.`)
                }
            }
            if (status === 'uploaded') {
                return configVersion.attributes['upload-url']
            } else {
                throw new Error(`Invalid config version status: ${status}`)
            }

        } catch (err) {
            throw new Error(`Error creating the config version: ${err.message}`)
        }
    }

    /**
     * Uploads assets to new configuration version.
     * 
     * @param {string} uploadUrl - Url for configuration upload.
     * @param {string} filePath - The tar.gz file for upload.
     * @returns {object} - Axios request response.
     */
    async _uploadConfiguration(uploadUrl, filePath) {
        try {
            const res = await this.axios.put(uploadUrl, fs.createReadStream(filePath), {headers: {'Content-Type': `application/octet-stream`}})
            
            return res
        } catch (err) {
            throw new Error(`Error uploading the configuration: ${err.message}`)
        }
    }

    /**
     * Requests run of new configuration.
     * 
     * @param {string} workspaceId - Workspace Id.
     * @param {string} identifier - Unique identifier for the run (e.g. git commit).
     * @returns {string} - Run Id.
     */
    async _run(workspaceId, identifier) {        
        try {
            const run = {
                data: {
                  attributes: {
                    "is-destroy": false,
                    "message": `Queued by TFC GH Action (${identifier})`,
                  },
                  type: "runs",
                  relationships: {
                    workspace: {
                      data: {
                        type: "workspaces",
                        id: workspaceId
                      }
                    }
                  }
                }
              }
            const res = await this.axios.post('/runs', JSON.stringify(run))
            if (!res.data || !res.data.data) {
                throw new Error('No data returned from request.')
            } else if (!res.data.data.id) {
                throw new Error('Run Id not found.')
            }
            
            return res.data.data.id
            
        } catch (err) {
                let message = `Error requesting the run: ${err.message}`
                if (err.response) {
                    message += `\nResponse: ${JSON.stringify(err.response.data ? err.response.data.errors : null)}`
                }
                throw new Error(message)
        }
    }

    /**
     * Create, initialize and start a new workspace run.
     * 
     * @param {string} workspace - Workspace name.
     * @param {string} filePath - Path to tar.gz file with Terraform configuration.
     * @param {string} identifier - Unique identifier for the run (e.g. git commit)
     * @returns {string} - runId. The Id of the new run.
     */
    async run(workspace, filePath, identifier) {

        const workspaceId = await this._checkWorkspace(workspace)
        const uploadUrl = await this._createConfigVersion(workspaceId)
        await this._uploadConfiguration(uploadUrl, filePath)
        const runId = await this._run(workspaceId, identifier)
        
        return runId            

    }
}

