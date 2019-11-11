import { expect } from 'chai'
import sinon from 'sinon'

import * as core from '@actions/core'
import Terraform from './terraform'

describe('Action test suite', () => {

    afterEach(() => {
        sinon.restore()
    })

    it('can succesfully initiate a run and return workspace', async() => {
        let workspace = "__PRETEST__"
        sinon.stub(Terraform.prototype, 'run').returns('id_1')
        sinon.stub(core, 'setOutput').callsFake((key, prop) => {
            workspace = {}
            workspace[key] = prop
        })
        const run = require('./index')
        await run.default()
        expect(workspace).to.deep.equal({runId: 'id_1'})
    })

    it('can succesfully catch an error', async() => {
        let setFailed = "__PRETEST__"

        sinon.stub(Terraform.prototype, 'run').throwsException(new Error(`run error!`))

        sinon.stub(core, 'setFailed').callsFake((message) => {
            setFailed = message
        })
        const run = require('./index')
        await run.default()
        expect(setFailed).to.equal('run error!')
    })
})