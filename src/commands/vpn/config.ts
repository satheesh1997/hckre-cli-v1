import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'

import * as chalk from 'chalk'
import * as fs from 'fs'
import * as os from 'os'
import * as sudo from 'sudo-prompt'

import { SUDO_PROMPT_OPTIONS, DEFAULT_VPN_CONFIG_PATH } from '../../constants'

export default class Config extends Command {
  static description = 'configure vpn credentials'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    cli.info('Copying the config requires superuser access')
    cli.info(chalk.redBright('You might be prompted for your password by sudo'))
    cli.info('...')
    if (!fs.existsSync(os.homedir() + '/Downloads/wg0.conf')) {
      cli.info(`${chalk.bold(chalk.red('wg0.conf not found under downloads'))}`)
      cli.info('...')
      cli.info('› Follow the steps and download the config file')
      cli.info('    1. Sign to https://subspace.hackerearth.com/ via google.')
      cli.info('    2. Provide your device informations & add your device.')
      cli.info(`    3. Click on ${chalk.blueBright('Download your WireGuard config')} for the config.`)
      cli.info('    4. Save wg0.conf file to downloads folder.')
      cli.info(`› Use ${chalk.bold(chalk.red('vpn:config'))} again to configure after downloading wg0.conf !!`)
      this.exit(1)
    } else {
      cli.action.start('› Copying configuration file')
      const copy = () => {
        return new Promise((resolve, reject) => {
          sudo.exec(
            `cp ${os.homedir() + '/Downloads/wg0.conf'} ${DEFAULT_VPN_CONFIG_PATH}`,
            SUDO_PROMPT_OPTIONS,
            (error, stdout, stderr) => {
              if (error) reject(error)
              if (stderr) reject(stderr)
              resolve(stdout)
            }
          )
        })
      }
      await copy()
      cli.action.stop()
    }
    this.exit(0)
  }
}
