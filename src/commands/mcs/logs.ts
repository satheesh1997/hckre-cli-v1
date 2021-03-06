import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { existsSync } from 'fs'

import chalk from 'chalk'
import Listr from 'listr'

import { HckreContext } from '../../api/context'
import { deploymentPlatform, DEPLOYMENT_PLATFORM_KEY } from '../../common-flags'
import { getDeploymentPlatform, getProjectDir } from '../../utils/mcs'

export default class Logs extends Command {
  static description = 'stops the mcs services'

  static flags = {
    help: flags.help({ char: 'h' }),
    [DEPLOYMENT_PLATFORM_KEY]: deploymentPlatform,
  }

  async run() {
    const { flags } = this.parse(Logs)
    const ctx = await HckreContext.initAndGet(flags, this)
    const deploymentPlatform = getDeploymentPlatform()
    const checkListrOptions = ctx.listrOptions
    ctx.failedChecks = 0
    checkListrOptions.exitOnError = false
    const tasks = new Listr(
      [
        {
          title: 'Checking for project',
          task: () => {
            if (!existsSync(`${getProjectDir(ctx)}.git/`)) {
              this.error("Project doesn't exist")
            }
          },
        },
        {
          title: 'Checking for running services',
          task: () => deploymentPlatform.checkServicesStatus(),
        },
        {
          title: 'Looking for the logs',
          skip: () => {
            if (ctx.failedChecks > 0) {
              return 'services not running'
            }
          },
          task: () => {
            // pass
          },
        },
      ],
      checkListrOptions
    )
    try {
      await tasks.run()
      deploymentPlatform.printServiceLogs()
    } catch (error) {
      cli.info('\n')
      cli.error(`Use ${chalk.bold(chalk.green('mcs:start'))} to start the services before starting !!`)
    }
    this.exit(0)
  }
}
