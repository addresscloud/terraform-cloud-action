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
            },
            maxContentLength: Infinity
        })
        this.retryDuration = retryDuration
        this.org = org
        this.retryLimit = 3
        this.maxStatusPolls = 5
        this.debug = true
    }

    /**
     * Wait for specified time.
     * 
     * @param {number} ms - Duration.
     * @returns {promise} - Promise.
     */
    async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
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
     * Get configuration version upload status.
     * 
     * @param {string} configVersionId - The ID of the configuration version.
     * @returns {string} - Upload status.
     */
    async _getConfigVersionStatus(configVersionId) {
        try {
            const res = await this.axios.get(`/configuration-versions/${configVersionId}`)

            return res.data.data.attributes.status
        } catch (err) {
            throw new Error(`Error getting configuration version: ${err.message}`)
        }
    }

    /**
     * Create new configuration version, and returns upload URL.
     * 
     * @param {string} workspaceId - Worspace Id.
     * @returns {object} - Configuration object with id and uploadUrl attributes.
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
            const configVersion = res.data ? res.data.data : null
            if (configVersion === null) {
                throw new Error('No configuration returned from request.')
            }

            return { id: configVersion.id, uploadUrl: configVersion.attributes['upload-url']}

        } catch (err) {
            throw new Error(`Error creating the config version: ${err.message}`)
        }
    }

    /**
     * Uploads assets to new configuration version.
     * 
     * @param {string} configId - The configuration Id.
     * @param {string} uploadUrl - Url for configuration upload.
     * @param {string} filePath - The tar.gz file for upload.
     */
    async _uploadConfiguration(configId, uploadUrl, filePath) {
        try {
            await this.axios.put(uploadUrl, fs.createReadStream(filePath), {headers: {'Content-Type': `application/octet-stream`}})
            let status = await this._getConfigVersionStatus(configId),
                counter = 0

            while (status === 'pending') {
                if (counter < this.retryLimit) {
                    await this._sleep(this.retryDuration)
                    status = await this._getConfigVersionStatus(configId)
                    counter += 1
                } else {
                    throw new Error(`Config version status was still pending after ${this.retryLimit} attempts.`)
                }
            }

            if (status !== 'uploaded') {
                throw new Error(`Invalid config version status: ${JSON.stringify(status)}`)
            }

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

    async _poll(runId) {
        try {
            // let status
            let counter = 0
            while (counter < this.maxStatusPolls) {
                const res = await this.axios.get(`/runs/${runId}`)
                this.debug && console.log(JSON.stringify(res.data.data))
                this.debug && console.log(`will now sleep.`)
                counter += 1
                await this._sleep(60000)
                // status  = res.data.data.attributes.status
            }
            // return status
        } catch (err) {
            let message = `Error requesting run status: ${err.message}`
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
     * @param {string} identifier - Unique identifier for the run (e.g. git commit).
     * @returns {string} - The Id of the new run.
     */
    async run(workspace, filePath, identifier) {

        const workspaceId = await this._checkWorkspace(workspace)
        const {id, uploadUrl} = await this._createConfigVersion(workspaceId)
        await this._uploadConfiguration(id, uploadUrl, filePath)
        const runId = await this._run(workspaceId, identifier)
        this._poll(runId)
        return runId
    }
}

