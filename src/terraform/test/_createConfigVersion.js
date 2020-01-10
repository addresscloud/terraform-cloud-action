import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _createConfigVersion test suite', () => {

    it('can import Terraform', () => {
        const terraform = new Terraform('token', 'org')
        expect(terraform instanceof Terraform).to.equal(true)
    })

    it('can succesfully create workspace', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').returns({
                data: {
                        data: {
                            id: '42',
                            attributes: {
                                'upload-url': 'mock-url',
                                'status': 'uploaded'
                        }
                    }
                }
        })
        const res = await terraform._createConfigVersion('1')
        stub.restore()
        expect(res).to.deep.equal({id: '42', uploadUrl: 'mock-url'})
    })

    it('catches no data returned', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').returns({})
        let message = "__PRETEST__"
        try {
            await terraform._createConfigVersion('1')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error creating the config version: No configuration returned from request.')
    })

    it('catches axios error', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').throws(new Error(`Axios error.`))
        let message = "__PRETEST__"
        try {
            await terraform._createConfigVersion('1')
        } catch (err) {
            message = err.message
        }
        expect(message).to.equal('Error creating the config version: Axios error.')
        stub.restore()
    })

})
