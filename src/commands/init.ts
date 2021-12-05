import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import {ConfigIniParser} from 'config-ini-parser'

import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'

import {HckreContext} from '../api/context'
import {getCLIConfigurationFilePath, createCLIDefaultConfigFile} from '../utils'

export default class Init extends Command {
  static description = 'initialise CLI'

  static flags = {
    help: flags.help({char: 'h'}),
    update: flags.boolean({char: 'u', description: 'update the existing configurations'}),
  }

  async run() {
    const {flags} = this.parse(Init)
    const ctx = await HckreContext.initAndGet(flags, this)
    const configFile = getCLIConfigurationFilePath(ctx)
    if (fs.existsSync(configFile) && !flags.update) {
      this.error(
        `CLI already initialized. Use ${chalk.cyan(chalk.bold('hckre init --update'))} to update the configurations.`
      )
    }
    if (!fs.existsSync(configFile) && flags.update) {
      this.error(`CLI not initialized. Use ${chalk.cyan(chalk.bold('hckre init'))} to initialize.`)
    }
    if (!flags.update) {
      createCLIDefaultConfigFile(ctx)
    }

    const configParser = new ConfigIniParser('\r\n')
    const config = fs.readFileSync(configFile)
    configParser.parse(config.toString())

    cli.info('[basic]')
    const basicResponses: any = await inquirer.prompt([
      {
        name: 'path',
        message: 'path=',
        type: 'input',
        default: configParser.get('basic', 'path'),
      },
    ])
    configParser.set('basic', 'path', basicResponses.path)

    cli.info('[mcs]')
    const mcsResponses: any = await inquirer.prompt([
      {
        name: 'git',
        message: 'git=',
        type: 'input',
        default: configParser.get('mcs', 'git'),
        validate: url => {
          // eslint-disable-next-line no-useless-escape
          return /^([A-Za-z0-9]+@|http(|s)\:\/\/)([A-Za-z0-9.]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/.test(url)
        },
      },
      {
        name: 'dir',
        message: 'dir=',
        type: 'input',
        default: configParser.get('mcs', 'dir'),
      },
    ])
    configParser.set('mcs', 'git', mcsResponses.git)
    configParser.set('mcs', 'dir', mcsResponses.dir)

    cli.info('[git]')
    const gitResponses: any = await inquirer.prompt([
      {
        name: 'name',
        message: 'user.name=',
        type: 'text',
        default: configParser.get('git', 'name'),
      },
      {
        name: 'email',
        message: 'user.email=',
        type: 'text',
        default: configParser.get('git', 'email'),
        validate: email => {
          // eslint-disable-next-line no-useless-escape
          return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
            email
          )
        },
      },
    ])
    configParser.set('git', 'name', gitResponses.name)
    configParser.set('git', 'email', gitResponses.email)

    cli.info('[oncall-tools]')
    cli.info(chalk.bold(`${chalk.green('› ')}Oncall tools should be configured manually !!`))
    cli.info(
      chalk.bold(
        `${chalk.green('› ')}Add tools to ${chalk.cyanBright('[oncall-tools]')} section in ${chalk.green(
          configFile
        )} file.`
      )
    )

    fs.writeFileSync(configFile, configParser.stringify('\r\n'))
    this.exit(0)
  }
}
