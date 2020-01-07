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
                            attributes: {
                                'upload-url': 'mock-url',
                                'status': 'uploaded'
                        }
                    }
                }
        })
        const res = await terraform._createConfigVersion('1')
        stub.restore()
        expect(res).to.equal('mock-url')
    })

    it('can succesfully wait for workspace upload', async() => {
        const terraform = new Terraform('token', 'org')
        const stub1 = sinon.stub(terraform.axios, 'post').returns({
                data: {
                        data: {
                            attributes: {
                                'upload-url': 'mock-url',
                                'status': 'pending'
                        }
                    }
                }
        })
        const stub2 = sinon.stub(terraform.axios, 'get').returns({
            data: {
                    data: {
                        attributes: {
                            'upload-url': 'mock-url',
                            'status': 'uploaded'
                    }
                }
            }
        })
        const res = await terraform._createConfigVersion('1')
        stub1.restore()
        stub2.restore()
        expect(res).to.equal('mock-url')
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
        expect(message).to.equal('Error creating the config version: No data returned from request.')
    })

    it('catches no upload-url returned', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').returns({data: {data: {}}})
        let message = "__PRETEST__"
        try {
            await terraform._createConfigVersion('1')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error creating the config version: No upload URL was returned.')
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
