import core from '@actions/core'
import Terraform from './terraform'

try {
    const token = core.getInput(tfToken)
    const org = core.getInput(tfOrg)
    const workspace = core.getInput(tfWorkspace)
    const filePath = core.getInput(filePath)

    const tf = new Terraform(token, org)
    tf.run(workspace, filePath)
} catch (error) {
    core.setFailed(error.message);
}