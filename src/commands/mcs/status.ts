import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { existsSync } from 'fs'

import chalk from 'chalk'
import Listr from 'listr'

import { HckreContext } from '../../api/context'
import { deploymentPlatform, DEPLOYMENT_PLATFORM_KEY } from '../../common-flags'
import { getDeploymentPlatform, getProjectDir } from '../../utils/mcs'

export default class Status extends Command {
  static description = 'status of deployed services'

  static flags = {
    help: flags.help({ char: 'h' }),
    [DEPLOYMENT_PLATFORM_KEY]: deploymentPlatform,
  }

  async run() {
    const { flags } = this.parse(Status)
    const ctx = await HckreContext.initAndGet(flags, this)
    const deploymentPlatform = getDeploymentPlatform()
    const checkListrOptions = ctx.listrOptions
    ctx.failedChecks = 0
    checkListrOptions.exitOnError = false
    const tasks = new Listr(
      [
        {
          title: 'Looking for project',
          task: () => {
            if (!existsSync(`${getProjectDir(ctx)}.git/`)) {
              ctx.failedChecks += 1
              this.error('project not found')
            }
          },
        },
        {
          title: 'Looking for deployed services',
          task: () => deploymentPlatform.checkServices(),
        },
        {
          title: 'Looking for running services',
          task: () => deploymentPlatform.checkServicesStatus(),
        },
      ],
      checkListrOptions
    )
    try {
      await tasks.run()
      cli.info(chalk.greenBright('› All the deployed services are running !!'))
    } catch (e) {
      cli.info(chalk.bold('\nTip:'))
      cli.info(`  -> Use ${chalk.bold(chalk.green('mcs:deploy'))} to deploy the services`)
      cli.info(`  -> Use ${chalk.bold(chalk.greenBright('mcs:start'))} to start the services`)
    }
    this.exit(0)
  }
}
