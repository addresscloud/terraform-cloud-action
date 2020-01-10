import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
import Terraform from '../index'

describe('Terraform _uploadConfiguration test suite', () => {

    it('can succesfully wait after upload', async() => {
        const terraform = new Terraform('token', 'org')
        const stubFs = sinon.stub(fs, 'createReadStream').returns({})
        const stubAxiosPut = sinon.stub(terraform.axios, 'put').returns({})
        const stubAxiosGet = sinon.stub(terraform.axios, 'get').onFirstCall().returns({
            data: {
                data: {
                    id: '42',
                    attributes: {
                        'upload-url': 'mock-url',
                        'status': 'pending'
                    }
                }
            }
        })
        stubAxiosGet.onSecondCall().returns({
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
        await terraform._uploadConfiguration('1', 'url', 'files')
        stubFs.restore()
        stubAxiosPut.restore()
        stubAxiosGet.restore()
        expect(stubAxiosGet.calledTwice)
    })
})
