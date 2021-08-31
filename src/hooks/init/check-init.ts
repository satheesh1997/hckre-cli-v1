import { Hook } from '@oclif/config'

import * as chalk from 'chalk'
import * as fs from 'fs'

const hook: Hook<'init'> = async function (opts) {
  if (opts.id == "readme") {
    return
  }
  if (!fs.existsSync(`${opts.config.configDir}/hckre.ini`) && opts.id !== 'init') {
    this.error(`CLI not initialized. Use ${chalk.cyan(chalk.bold('hckre init'))} to initialize.`)
  }
}

export default hook
