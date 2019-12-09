import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _checkWorkspace test suite', () => {

    it('can import Terraform', () => {
        const terraform = new Terraform('token', 'org')
        expect(terraform instanceof Terraform).to.equal(true)
    })

    it('can succesfully check workspace', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').returns({
                data: {
                    data: {
                    id: '1'
                    }
                }
        })
        const res = await terraform._checkWorkspace('workspace')
        stub.restore()
        expect(res).to.equal('1')
    })

    it('catches spaces in workspace name error', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').returns({})
        let message = "__PRETEST__"
        try {
            await terraform._checkWorkspace('work space')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error checking the workspace: Workspace name should not contain spaces.')
    })

    it('catches no data returned', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').returns({})
        let message = "__PRETEST__"
        try {
            await terraform._checkWorkspace('workspace')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error checking the workspace: No data returned from request.')
    })

    it('catches no id returned', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').returns({data: {data: {}}})
        let message = "__PRETEST__"
        try {
            await terraform._checkWorkspace('workspace')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error checking the workspace: Workspace not found.')
    })

    it('catches axios error', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').throws(new Error(`Axios error.`))
        let message = "__PRETEST__"
        try {
            await terraform._checkWorkspace('workspace')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error checking the workspace: Axios error.')
    })

})
