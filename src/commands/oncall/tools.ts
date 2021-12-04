import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'

import inquirer from 'inquirer'

import { HckreContext } from '../../api/context'
import { getCLIConfiguration } from '../../utils'

export default class PingServices extends Command {
  static description = 'open a support tool'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const { flags } = this.parse(PingServices)
    const ctx = await HckreContext.initAndGet(flags, this)
    const config = getCLIConfiguration(ctx)
    const toolsChoices = []

    inquirer.registerPrompt('list', require('inquirer-search-list'))

    for (const tool in config['oncall-tools']) {
      toolsChoices.push({ name: tool, value: config['oncall-tools'][tool] })
    }

    const responses: any = await inquirer.prompt([
      {
        pageSize: 20,
        name: 'url',
        message: 'Choose a tool to open',
        type: 'list',
        choices: toolsChoices,
        loop: false,
      },
    ])

    await cli.open(responses.url)
    this.exit(0)
  }
}
