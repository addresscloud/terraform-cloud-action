import * as core from '@actions/core'
import Terraform from './terraform'

async function main(){
    try {

        const token = core.getInput('tfToken'),
              org = core.getInput('tfOrg'),
              workspace = core.getInput('tfWorkspace'),
              filePath = core.getInput('filePath')

        const tf = new Terraform(token, org)
        const id = await tf.run(workspace, filePath)
        console.log(`Workspace run submitted succesfully: https://app.terraform.io/app/${org}/workspaces/${workspace}/runs/${id}`)
        core.setOutput("runId", id);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()

