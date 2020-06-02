import * as core from '@actions/core'
import Terraform from './terraform'

export default async function main() {
    try {
        const token = core.getInput('tfToken'),
              org = core.getInput('tfOrg'),
              workspace = core.getInput('tfWorkspace'),
              filePath = core.getInput('filePath'),
              identifier = core.getInput('identifier'),
              awaitApply = core.getInput('awaitApply'),
              awaitInterval = core.getInput('awaitInterval') * 1000,
              retryLimit = core.getInput('retryLimit'),
              debug = core.getInput('debug')

        const tf = new Terraform(token, org, 1000, retryLimit, awaitInterval, debug)
        const { runId, status } = await tf.run(workspace, filePath, identifier.slice(0, 7), awaitApply)
        console.log(`Workspace run submitted succesfully: https://app.terraform.io/app/${org}/workspaces/${workspace}/runs/${runId}`)
        console.log(`Run status: ${status}`)
        core.setOutput("runId", runId);
        core.setOutput("status", status);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()
