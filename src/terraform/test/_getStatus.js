import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _getStatus test suite', () => {

    it('can request status from TFC', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'get').returns({
            data: {
                data: {
                    id: '1',
                    attributes: {
                        status: 'applied'
                    }
                }
            }

        })
        const res = await terraform._getStatus('runid_1')
        expect('applied').to.equal(res)
        stub.restore()
    })
 })
