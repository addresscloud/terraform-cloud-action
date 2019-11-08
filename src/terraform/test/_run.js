import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _run test suite', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('can import Terraform', () => {
        const terraform = new Terraform('token', 'org')
        expect(terraform instanceof Terraform).to.equal(true)
    })

    it('can succesfully upload file', async() => {
        const terraform = new Terraform('token', 'org')
        sinon.stub(terraform.axios, 'put').returns('success')
        const res = await terraform._run('1')
        expect(res).to.equal('mock-url')
    })
})
