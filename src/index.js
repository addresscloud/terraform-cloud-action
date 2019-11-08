import * as core from '@actions/core'
import Terraform from './terraform'

async function main(){
    try {
        const token = core.getInput('tfToken')
        const org = core.getInput('tfOrg')
        const workspace = core.getInput('tfWorkspace')
        const filePath = core.getInput('filePath')
        const tf = new Terraform(token, org)
        const id = await tf.run(workspace, filePath)
        console.log(id)
    } catch (error) {
        core.setFailed(error.message);
    }
}

main()

