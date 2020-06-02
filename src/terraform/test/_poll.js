import { expect } from 'chai'
import sinon from 'sinon'
import Terraform from '../index'

describe('Terraform _poll test suite', () => {

    it('returns on planned_and_finished status', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform, '_getStatus').returns('planned_and_finished')
        const res = await terraform._poll('1')
        expect('planned_and_finished').to.equal(res)
        stub.restore()
    })

    it('returns on applied status', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform, '_getStatus').returns('applied')

        const res = await terraform._poll('1')
        expect('applied').to.equal(res)
        stub.restore()
    })

    it('returns on applied status', async() => {
        const terraform = new Terraform('token', 'org')
        const stub = sinon.stub(terraform, '_getStatus').returns('applied')

        const res = await terraform._poll('1')
        expect('applied').to.equal(res)
        stub.restore()
    })

    it('waits for applied status', async() => {
        const terraform = new Terraform('token', 'org', 'app.terrafor.io', 1000, 3, 1000)
        const stub = sinon.stub(terraform, '_getStatus').onFirstCall().returns('not_applied').onSecondCall().returns('applied')
        const res = await terraform._poll('1')
        expect('applied').to.equal(res)
        stub.restore()
    })

    it('skips waiting on the last run', async() => {
        const terraform = new Terraform('token', 'org', 'app.terrafor.io', 1000, 3, 1000)
        let sleepCounter = 0
        let getStatusCounter = 0
        const stubGetStatus = sinon.stub(terraform, '_getStatus').callsFake((runId) => {
            getStatusCounter += 1
            return 'not_applied'
        })
        const stubSleep = sinon.stub(terraform, '_sleep').callsFake((interval) => {
            sleepCounter += 1
        })
        let message = "__PRETEST__"
        try {
            await terraform._poll('1')
        } catch (err) {
            message = err.message
        }
        expect(3).to.equal(getStatusCounter)
        expect(2).to.equal(sleepCounter)
        expect('Error requesting run status. Run status was "not_applied"').to.equal(message)
        stubGetStatus.restore()
        stubSleep.restore()
    })
 })
