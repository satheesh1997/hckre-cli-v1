import {Command, flags} from '@oclif/command'
import {spawnSync} from 'child_process'

import inquirer from 'inquirer'

import {HckreContext} from '../../api/context'
import {AWS_REGIONS_MAP, SUPPORTED_AWS_PROFILES, SUPPORTED_AWS_PROFILE_CHOICES} from '../../constants'

export default class ECRLogin extends Command {
  static description = 'login to ecr'

  static flags = {
    help: flags.help({char: 'h'}),
    profile: flags.string({
      char: 'p',
      options: SUPPORTED_AWS_PROFILES,
      description: 'profile with which you want to login',
    }),
  }

  async run() {
    const {flags} = this.parse(ECRLogin)
    const ctx = await HckreContext.initAndGet(flags, this)

    ctx.AWSProfile = flags.profile

    inquirer.registerPrompt('list', require('inquirer-search-list'))

    if (!ctx.AWSProfile) {
      const responses: any = await inquirer.prompt([
        {
          name: 'profile',
          message: 'Choose a profile in credentials',
          type: 'list',
          choices: SUPPORTED_AWS_PROFILE_CHOICES,
        },
      ])
      ctx.AWSProfile = responses.profile
    }

    ctx.AWSRegion = AWS_REGIONS_MAP[ctx.AWSProfile]

    spawnSync(`$(aws ecr --profile ${ctx.AWSProfile} get-login --no-include-email --region ${ctx.AWSRegion})`, [], {
      stdio: 'inherit',
      shell: true,
    })

    this.exit(0)
  }
}
