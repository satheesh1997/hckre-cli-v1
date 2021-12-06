import Command from '@oclif/command'
import { cli } from 'cli-ux'

export abstract class VPNCommand extends Command {
  async init() {
    if (process.platform === 'darwin') {
      cli.error('hckre vpn:* commands are not available on macOS')
    }
    super.init()
  }
}
