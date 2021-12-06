import { flags } from '@oclif/command'
import { cli } from 'cli-ux'

import sudo from 'sudo-prompt'
import { VPNCommand } from '../../base/commands'

import { SUDO_PROMPT_OPTIONS } from '../../constants'

export default class Up extends VPNCommand {
  static description = 'start vpn'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    cli.info('Starting vpn requires superuser access')
    cli.info('You might be prompted for your password by sudo')
    cli.info('...')
    cli.action.start('› Starting vpn')
    const runCommand = () => {
      return new Promise((resolve, reject) => {
        sudo.exec('wg-quick up hackerearth', SUDO_PROMPT_OPTIONS, (error, stdout) => {
          if (error) reject(error)
          resolve(stdout)
        })
      })
    }
    await runCommand()
    cli.action.stop()
    this.exit(0)
  }
}
