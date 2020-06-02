import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform run test suite', () => {

    it('returns runId and status', async() => {
        const terraform = new Terraform('token', 'org')
        const stubCheck = sinon.stub(terraform, '_checkWorkspace').returns('1')
        const stubCreate = sinon.stub(terraform, '_createConfigVersion').returns('1', 'url')
        const stubUpload = sinon.stub(terraform, '_uploadConfiguration').returns()
        const stubRun = sinon.stub(terraform, '_run').returns({runId: '1', status: 'planning'})
        const stubPoll = sinon.stub(terraform, '_poll').returns('applied')

        const res = await terraform.run('workspace', 'files', 'identifier', true)
        expect({runId: '1', status: 'applied'}).to.deep.equal(res)
        stubCheck.restore()
        stubCreate.restore()
        stubUpload.restore()
        stubRun.restore()
        stubPoll.restore()
    })
 })
