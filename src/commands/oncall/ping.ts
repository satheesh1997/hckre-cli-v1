import { Command, flags } from '@oclif/command'
import {
  PING_SERVICE_WEBSITE_APP,
  PING_SERVICE_WEBSITE_ASSESSMENT,
  PING_SERVICE_WEBSITE_WWW,
  SUPPORTED_PING_SEVICES,
  PING_SERVICE_WEBSITE_API,
  PING_SERVICE_WEBSITE_AUTH,
  PING_SERVICE_WEBSITE_STATIC,
  PING_SERVICE_WEBSITE_IDE,
} from '../../constants'
import { pingAll, pingApp, pingAssessment, pingIndex, pingApi, pingAuth, pingStatic, pingIde } from '../../utils/oncall'

export default class PingServices extends Command {
  static description = 'ping a service'

  static flags = {
    help: flags.help({ char: 'h' }),
    service: flags.string({
      char: 's',
      options: SUPPORTED_PING_SEVICES,
      description: 'just ping a particular service',
    }),
  }

  async run() {
    const { flags } = this.parse(PingServices)
    switch (flags.service) {
      case PING_SERVICE_WEBSITE_WWW:
        await pingIndex()
        break
      case PING_SERVICE_WEBSITE_ASSESSMENT:
        await pingAssessment()
        break
      case PING_SERVICE_WEBSITE_APP:
        await pingApp()
        break
      case PING_SERVICE_WEBSITE_API:
        await pingApi()
        break
      case PING_SERVICE_WEBSITE_AUTH:
        await pingAuth()
        break
      case PING_SERVICE_WEBSITE_STATIC:
        await pingStatic()
        break
      case PING_SERVICE_WEBSITE_IDE:
        await pingIde()
        break
      default:
        await pingAll()
    }
    this.exit(0)
  }
}
