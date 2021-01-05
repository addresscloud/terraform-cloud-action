import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _run test suite', () => {

    it('can import Terraform', () => {
        const terraform = new Terraform('token', 'org')
        expect(terraform instanceof Terraform).to.equal(true)
    })

    it('can succesfully initiate a run', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').returns({
            data: {
                data: {
                    id: '1',
                    attributes: {
                        status: 'applied'
                    }
                }
            }

        })
        const res = await terraform._run('1', 'id')
        stub.restore()
        expect({runId: '1', status: 'applied'}).to.deep.equal(res)
    })

    it('catches no data returned', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform.axios, 'post').returns({})
        let message = "__PRETEST__"        
        try {
            await terraform._run('1', 'id')
        } catch (err) {
            message = err.message
        }
        stub.restore()
        expect(message).to.equal('Error requesting the run: No data returned from request.\n{}')
    })

    it('catches no id returned', async() => {
        const terraform = new Terraform('token', 'org')
        sinon.stub(terraform.axios, 'post').returns({data: {data:{}}})
        let message = "__PRETEST__"
        try {
            await terraform._run('1', 'id')
        } catch (err) {
            message = err.message
        }
        expect(message).to.equal('Error requesting the run: Run Id not found.\n{}')
    })

    it('catches axios error', async() => {
        const terraform = new Terraform('token', 'org')
        sinon.stub(terraform.axios, 'post').throws(new Error(`Axios error.`))
        let message = "__PRETEST__"
        try {
            await terraform._run('1', 'id')
        } catch (err) {
            message = err.message
        }
        expect(message).to.equal('Error requesting the run: Axios error.\n{}')
    })

    it('catches error with response', async() => {
        const terraform = new Terraform('token', 'org')
        const error = new Error(`Response error`)
        error.response = {
            data: {
                errors: 500
            }
        }
        sinon.stub(terraform.axios, 'post').throws(error)
        let message = "__PRETEST__"
        try {
            await terraform._run('1', 'id')
        } catch (err) {
            message = err.message
        }
        expect(message).to.equal('Error requesting the run: Response error\n{"response":{"data":{"errors":500}}}\nResponse: 500')
    })
})
