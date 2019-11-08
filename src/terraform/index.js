/**
 * @module Terraform
 */
import axios from 'axios'
import fs from 'fs'
import { ENGINE_METHOD_DIGESTS } from 'constants'

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
        this.sleepDuration = sleepDuration
        this.axios = axios.create({
            baseURL: `https://${address}/api/v2`,
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': `application/vnd.api+json`              
            }
        })
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
            const res = await this.axios.get(`/organizations/${org}/workspaces/${workspace}`)
            if (!res.data) {
                throw new Error('No data returned from request.')
            }
            else if (!res.data.id) {
                throw new Error('Workspace not found.')
            }
            return res.data.id
        } catch (err) {
            throw new Error(`There was an error checking the workspace: ${err.message}`)
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
                "data": {
                  "type": "configuration-versions",
                  "attributes": {
                    "auto-queue-runs": false
                    }
                }
            }
            const res = await this.axios.post(`/organizations/${org}/workspaces/${workspaceId}/configuration-versions`, configVersion)
            if (!res.data) {
                throw new Error('No data returned from request.')
            }
            else if (!res.data.attributes || !res.data.attributes['upload-url']) {
                throw new Error('No upload URL was returned.')
            }
            return res.data.attributes['upload-url']
        } catch (err) {
            throw new Error(`There was an error creating the config version: ${err.message}`)
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
            throw new Error(`There was an error uploading the configuration: ${err.message}`)
        }
    }

    /**
     * Requests run of new configuration.
     */
    async _run(){

        // make run file JSON?
        
        try {
            await this.axios.post('/runs')
        } catch (err) {
            throw new Error(`There was an error requesting the run: ${err.message}`)
        }
    }

    /**
     * Watch for updates to run by periodically polling the api.
     */
    async _watch(){
        const watch = true {
            
        }
        // watch for updates?
        // this process.timeout
        res = axios.get()
        
    }

    /**
     * Create, initialize and start a new workspace run.
     * 
     * @param {string} workspace - Workspace name.
     * @param {*} filePath - Path to tar.gz file with Terraform configuration.
     */
    async run(workspace, filePath){
        const workspaceId = await this._checkWorkspace(workspace)
        const uploadUrl = await this._createConfigVersion(workspaceId)
        await this._uploadConfiguration(uploadUrl, filePath)
        await this._run()
        this._watch()
        //TODO - exit status
    }
}

//curl -s --header "Authorization: Bearer $token" --header "Content-Type: application/vnd.api+json" --data @configversion.json "https://${ADDRESS}/api/v2/workspaces/${workspace_id}/configuration-versions")
