import { Hook } from '@oclif/config'

import * as chalk from 'chalk'
import * as fs from 'fs'

import { HckreContext } from '../../api/context'

const hook: Hook<'init'> = async function (opts) {
  const ctx = await HckreContext.initAndGet({}, this)
  if (!fs.existsSync(`${ctx.configDir}/hckre.ini`) && opts.id !== 'init') {
    this.error(`CLI not initialized. Use ${chalk.cyan(chalk.bold('hckre init'))} to initialize.`)
  }
}

export default hook
