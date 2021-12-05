import { Hook } from '@oclif/config'

import chalk from 'chalk'
import fs from 'fs'

const hook: Hook<'init'> = async function (opts) {

  if (opts.id && opts.id.indexOf('mcs:') === -1) {
    return
  }

  if (!fs.existsSync(`${opts.config.configDir}/hckre.ini`) && opts.id !== 'init') {
    this.error(`CLI not initialized. Use ${chalk.cyan(chalk.bold('hckre init'))} to initialize.`)
  }
}

export default hook
