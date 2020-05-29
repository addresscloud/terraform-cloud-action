import * as core from '@actions/core'
import Terraform from './terraform'

export default async function main() {
    try {
        const token = core.getInput('tfToken'),
              org = core.getInput('tfOrg'),
              workspace = core.getInput('tfWorkspace'),
              filePath = core.getInput('filePath'),
              identifier = core.getInput('identifier'),
              awaitApply = core.getInput('awaitApply')

        const tf = new Terraform(token, org)
        const { id, status } = await tf.run(workspace, filePath, identifier.slice(0, 7), awaitApply)
        console.log(`Workspace run submitted succesfully: https://app.terraform.io/app/${org}/workspaces/${workspace}/runs/${id}`)
        console.log(`Run status: ${status}`)
        core.setOutput("runId", id);
        core.setOutput("status", status);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
