import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { existsSync } from 'fs'

import chalk from 'chalk'
import Listr from 'listr'

import { HckreContext } from '../../api/context'
import { deploymentPlatform, DEPLOYMENT_PLATFORM_KEY } from '../../common-flags'
import { getDeploymentPlatform, getProjectDir } from '../../utils/mcs'

export default class Start extends Command {
  static description = 'starts the mcs services'

  static flags = {
    help: flags.help({ char: 'h' }),
    [DEPLOYMENT_PLATFORM_KEY]: deploymentPlatform,
  }

  async run() {
    const { flags } = this.parse(Start)
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
              ctx.failedChecks += 1
              this.error("project doesn't exist")
            }
          },
        },
        {
          title: 'Checking for deployed services',
          task: () => deploymentPlatform.checkServices(),
        },
        {
          title: 'Starting the services',
          skip: () => {
            if (ctx.failedChecks > 0) {
              return 'services not deployed'
            }
          },
          task: () => deploymentPlatform.startServices(),
        },
      ],
      checkListrOptions
    )
    try {
      await tasks.run()
      cli.info('› Services started successfully!!')
      cli.info(`› Service mcs.webserver listening on ${chalk.bold(chalk.green('http://localhost:8000/'))}`)
      cli.info(`› Use ${chalk.bold(chalk.green('mcs:logs'))} to check the logs`)
    } catch (e) {
      cli.info('\n')
      cli.error(
        `\n${ctx.failedChecks} check(s) did not pass !!\nRunning ${chalk.bold(
          chalk.red('mcs:deploy')
        )} might fix them !!`
      )
    }
    this.exit(0)
  }
}
