import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'

import * as chalk from 'chalk'
import * as execa from 'execa'
import * as fs from 'fs'
import * as Listr from 'listr'

import { HckreContext } from '../../api/context'
import { deploymentPlatform, DEPLOYMENT_PLATFORM_KEY } from '../../common-flags'
import { getDeploymentPlatform, getProjectDir } from '../../utils/mcs'
import { notifyCommandCompletedSuccessfully, getCLIConfiguration } from '../../utils'

export default class Deploy extends Command {
  static description = 'deploy mcs services'

  static flags = {
    help: flags.help({ char: 'h' }),
    [DEPLOYMENT_PLATFORM_KEY]: deploymentPlatform,
  }

  async run() {
    const { flags } = this.parse(Deploy)
    const ctx = await HckreContext.initAndGet(flags, this)
    const config = getCLIConfiguration(ctx)
    if (!fs.existsSync(getProjectDir(ctx))) {
      ctx.firstTimeDeployment = true
    }
    const deploymentPlatform = getDeploymentPlatform()
    ctx.failedChecks = 0
    const preDeploymentTasks = new Listr(
      [
        {
          title: 'Looking for project path',
          skip: () => {
            if (fs.existsSync(config.basic.path)) {
              return 'path exists'
            }
          },
          task: () => fs.mkdirSync(config.basic.path),
        },
        {
          title: 'Adding bitbucket.org to known hosts',
          skip: () => {
            if (fs.existsSync(getProjectDir(ctx) + '.git')) {
              return 'already cloned'
            }
          },
          task: () => {
            execa('ssh -o "StrictHostKeyChecking no" -T git@bitbucket.org', {
              shell: true,
            }).catch(() => {
              this.warn(
                'Please refer https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/ and setup your ssh keys.'
              )
              this.error('Unable to connect to Bitbucket')
            })
          },
        },
        {
          title: 'Cloning project & dependent submodules',
          skip: () => {
            if (fs.existsSync(getProjectDir(ctx) + '.git')) {
              return 'already cloned'
            }
          },
          task: () => execa('git', ['clone', '--recurse-submodules', config.mcs.git, config.mcs.dir], { cwd: config.basic.path }),
        },
        {
          title: 'Setting git author name',
          task: () => execa('git', ['config', 'user.name', config.git.name], { cwd: getProjectDir(ctx) }),
        },
        {
          title: 'Setting git author email',
          task: () => execa('git', ['config', 'user.email', config.git.email], { cwd: getProjectDir(ctx) }),
        },
      ],
      ctx.listrOptions
    )

    const deploymentCheckTasks = new Listr([
      {
        title: 'git',
        task: () => execa('git', ['version']),
      },
      ...deploymentPlatform.dependenciesCheckTasks(),
    ])

    const deploymentTasks = new Listr(
      [
        {
          title: 'Looking for required dependencies',
          task: () => deploymentCheckTasks,
        },
        {
          title: 'Cloning project from remote repository',
          task: () => preDeploymentTasks,
        },
        {
          title: 'Looking for docker-compose.yml file',
          task: () => {
            if (!fs.existsSync(`${getProjectDir(ctx)}docker-compose.yml`)) {
              this.error('docker-compose.yml not found')
            }
          },
        },
        {
          title: 'Creating required services',
          task: () => deploymentPlatform.createServices(),
        },
        {
          title: 'Looking for services',
          task: () => deploymentPlatform.checkServices(),
        },
        {
          title: 'Deployment success',
          task: () => {
            ctx.failedChecks = -1
          },
        },
      ],
      ctx.listrOptions
    )
    await deploymentTasks.run(ctx)
    if (ctx.failedChecks == -1) {
      if (ctx.firstTimeDeployment) {
        if (fs.existsSync('/bin/bash')) {
          await execa(`echo "alias cs='cd ${getProjectDir(ctx)}'" >> ~/.bashrc`, { shell: true })
        }
        if (fs.existsSync('/bin/zsh')) {
          await execa(`echo "alias cs='cd ${getProjectDir(ctx)}'" >> ~/.zshrc`, { shell: true })
        }
        cli.info(`› Use ${chalk.green('cs')} to change to project directory, after reloading the shell`)
      }
      cli.info(`› Use ${chalk.green('mcs:start')} to start the services`)
      cli.info(chalk.green('\nHappy Coding !!\n\n'))
      notifyCommandCompletedSuccessfully()
    } else {
      if (ctx.failedChecks > 0) {
        cli.info(`${ctx.failedChecks} service(s) failed to deploy`)
      }
      cli.error('Some error occured while deploying the services')
    }
    this.exit(0)
  }
}
