import { expect } from 'chai'
import sinon from 'sinon'

import * as core from '@actions/core'
import Terraform from './terraform'

describe('Action test suite', () => {

    it('can succesfully initiate a run and return workspace', async() => {
        let workspace = "__PRETEST__"
        const stubRun = sinon.stub(Terraform.prototype, 'run').returns('id_1')
        const stubGh = sinon.stub(core, 'setOutput').callsFake((key, prop) => {
            workspace = {}
            workspace[key] = prop
        })
        const run = require('./index')
        await run.default()
        stubRun.restore()
        stubGh.restore()
        expect(workspace).to.deep.equal({runId: 'id_1'})
    })

    it('can succesfully catch an error', async() => {
        let setFailed = "__PRETEST__"

        const stubRun = sinon.stub(Terraform.prototype, 'run').throwsException(new Error(`run error!`))
        const stubGh = sinon.stub(core, 'setFailed').callsFake((message) => {
            setFailed = message
        })
        const run = require('./index')
        await run.default()
        stubRun.restore()
        stubGh.restore()
        expect(setFailed).to.equal('run error!')
    })
})