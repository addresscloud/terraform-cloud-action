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
     * @param {number} [sleepDuration=5] - Duration to wait before requesting status.
     */
    constructor(token, org, address = `app.terraform.io`, sleepDuration = 5) {
        this.axios = axios.create({
            baseURL: `https://${address}/api/v2`,
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': `application/vnd.api+json`              
            }
        })
        this.sleepDuration = sleepDuration
        this.org = org
    }

    /**
     * Check workspace exists, and return Id.
     * 
     * @param {string} workspace - Workspace name.
     * @returns {string} - Workspace Id.
     */
    async _checkWorkspace(workspace) {

        try {
            if (workspace.indexOf(' ') >= 0) { throw new Error(`Workspace name should not contain spaces.`) }
            const res = await this.axios.get(`/organizations/${this.org}/workspaces/${workspace}`)
            if (!res.data.data) {
                throw new Error('No data returned from request.')
            }
            else if (!res.data.data.id) {
                throw new Error('Workspace not found.')
            }
            return res.data.data.id
        } catch (err) {
            throw new Error(`Error checking the workspace: ${err.message}`)
        }
    }

    /**
     * Create new configuration version, and returns upload URL.
     * 
     * @returns {string} - Configuration upload URL.
     */
    async _createConfigVersion(workspaceId){

        try {
            const configVersion = {
                data: {
                  type: "configuration-versions",
                  attributes: {
                    "auto-queue-runs": false
                    }
                }
            }
            const res = await this.axios.post(`/workspaces/${workspaceId}/configuration-versions`, JSON.stringify(configVersion))
            if (!res.data.data) {
                throw new Error('No data returned from request.')
            }
            else if (!res.data.data.attributes || !res.data.data.attributes['upload-url']) {
                throw new Error('No upload URL was returned.')
            }
            return res.data.data.attributes['upload-url']
        } catch (err) {
            throw new Error(`Error creating the config version: ${err.message}`)
        }
    }

    /**
     * Uploads assets to new configuration version.
     * 
     * @param {string} uploadUrl - Url for configuration upload.
     * @param {string} filePath - tar.gz file for upload.
     */
    async _uploadConfiguration(uploadUrl, filePath) {
        
        try {
            await this.axios.put(uploadUrl, fs.createReadStream(filePath), {headers: {'Content-Type': `application/octet-stream`}})
        } catch (err) {
            throw new Error(`Error uploading the configuration: ${err.message}`)
        }
    }

    /**
     * Requests run of new configuration.
     * 
     * @param {string} workspaceId - Workspace Id.
     * @returns {string} - Run Id.
     */
    async _run(workspaceId){
        
        try {
            const run = {
                data: {
                  attributes: {
                    "is-destroy":false
                  },
                  type:"runs",
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
            console.log(workspaceId)
            console.log(run)
            // send the run
            const res = await this.axios.post('/runs', JSON.stringify(run))
            if (!res.data.data) {
                throw new Error('No data returned from request..')
            }
            else if (!res.data.data.id) {
                throw new Error('Run Id not found.')
            }
                return res.data.data.id
        } catch (err) {
                throw new Error(`Error requesting the run: ${err.message}`)

        }
    }

    /**
     * Watch for updates to run by periodically polling the api.
     */
    /*async _watch(){
        const watch = true {
            
        }
        // watch for updates?
        // this process.timeout
        res = axios.get()
        
    }*/

    /**
     * Create, initialize and start a new workspace run.
     * 
     * @param {string} workspace - Workspace name.
     * @param {*} filePath - Path to tar.gz file with Terraform configuration.
     */
    async run(workspace, filePath){
        try {
            const workspaceId = await this._checkWorkspace(workspace)
            const uploadUrl = await this._createConfigVersion(workspaceId)
            await this._uploadConfiguration(uploadUrl, filePath)
            const runId = await this._run()
            //this._watch()
            //TODO - exit status
            return runId            
        } catch (err) {
            throw err
        }
    }
}


//curl -s --header "Authorization: Bearer $token" --header "Content-Type: application/vnd.api+json" --data @configversion.json "https://${ADDRESS}/api/v2/workspaces/${workspace_id}/configuration-versions")
