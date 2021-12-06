import { cli } from 'cli-ux'
import chalk from 'chalk'

import { HckreContext } from '../api/context'
import { DOCKER, SUPPORTED_DEPLOYMENT_PLATFORMS } from '../constants'
import { DockerDeployment } from '../tasks/deployment'
import { getCLIConfiguration } from '../utils'

export function getDeploymentPlatform(): any {
  const ctx = HckreContext.get()

  if (!SUPPORTED_DEPLOYMENT_PLATFORMS.includes(ctx.deploymentPlatform)) {
    cli.error(`unsupported deployment platform: ${chalk.red(ctx.deploymentPlatform)}`)
  }

  cli.info(`› Current deployment platform: ${chalk.yellowBright(ctx.deploymentPlatform)}`)

  if (ctx.deploymentPlatform === DOCKER) {
    return new DockerDeployment()
  }
}

export function getProjectDir(ctx: any) {
  const config = getCLIConfiguration(ctx)
  return config.basic.path + '/' + config.mcs.dir + '/'
}
