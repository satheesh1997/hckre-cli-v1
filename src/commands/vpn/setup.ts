import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'

import chalk from 'chalk'
import fs from 'fs'
import Listr from 'listr'
import sudo from 'sudo-prompt'

import {HckreContext} from '../../api/context'
import {SUDO_PROMPT_OPTIONS, DEFAULT_VPN_CONFIG_PATH} from '../../constants'
import {getCurrentLinuxDistribution} from '../../utils'

export default class Setup extends Command {
  static description = 'install wireguard'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    if (process.platform === 'darwin') {
      cli.error('hckre vpn:* commands are not available on macOS')
    }

    const {flags} = this.parse(Setup)
    const ctx = await HckreContext.initAndGet(flags, this)
    const tasks = new Listr(
      [
        {
          title: 'Installing wireguard',
          skip: () => {
            if (fs.existsSync('/usr/local/bin/wg-quick') || fs.existsSync('/usr/bin/wg-quick')) {
              return 'wireguard-tools exists'
            }
          },
          task: () =>
            new Promise((resolve, reject) => {
              sudo.exec(ctx.installCommand, SUDO_PROMPT_OPTIONS, (error, stdout) => {
                if (error) reject(error)
                resolve(stdout)
              })
            }),
        },
        {
          title: 'Checking for existing credentials',
          skip: () => {
            if (!fs.existsSync(DEFAULT_VPN_CONFIG_PATH)) {
              ctx.credentialsExists = false
              return "credentials doesn't exists"
            }
          },
          task: () => {
            ctx.credentialsExists = true
          },
        },
      ],
      ctx.listrOptions
    )
    cli.info('Few steps requires superuser access')
    cli.info(' 1. Installing wireguard')
    cli.info('You might be prompted for your password by sudo')
    cli.info('...')
    cli.action.start('› Detecting your linux distribution')
    const distribution = await getCurrentLinuxDistribution()
    if (distribution === 'Manjaro') {
      ctx.installCommand = 'pacman -S wireguard-tools  --noconfirm'
    } else if (distribution === 'Ubuntu') {
      ctx.installCommand = 'apt install -y wireguard'
    } else {
      this.error(`Currently we are not supporting in ${distribution}. Write to us to incase you need support.`)
    }
    cli.action.stop()
    cli.info('› Setting up vpn tools')
    await tasks.run()
    cli.info('...')
    if (ctx.credentialsExists) {
      this.log(`› Use ${chalk.bold(chalk.red('vpn:connect'))} to connect to vpn`)
    } else {
      this.log(`› Use ${chalk.bold(chalk.red('vpn:config'))} to configure the credentials for connecting !!`)
    }
    this.exit(0)
  }
}
