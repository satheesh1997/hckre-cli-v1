import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import execa from 'execa'
import fs from 'fs'
import Listr from 'listr'
import sudo from 'sudo-prompt'

import { HckreContext } from '../../api/context'
import {
  CURRENT_GOSSM_VERSION,
  DEFAULT_AWS_CREDENTIALS_FILE_PATH,
  DEFAULT_AWS_CREDENTIALS_DIR,
  SUDO_PROMPT_OPTIONS,
} from '../../constants'

export default class Setup extends Command {
  static description = 'setup AWS & SSM access tools'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const { flags } = this.parse(Setup)
    const ctx = await HckreContext.initAndGet(flags, this)
    const awsTasks = new Listr(
      [
        {
          title: 'Looking if snap is available',
          task: () => execa('snap', ['version']),
        },
        {
          title: 'Looking to install cli via snap',
          skip: () => {
            if (fs.existsSync('/var/lib/snapd/snap/bin/aws') || fs.existsSync('/snap/bin/aws')) {
              return 'aws-cli exists'
            }
          },
          task: () =>
            new Promise((resolve, reject) => {
              sudo.exec('snap install aws-cli --classic', SUDO_PROMPT_OPTIONS, (error, stdout, stderr) => {
                if (error) reject(error)
                if (stderr) reject(stderr)
                resolve(stdout)
              })
            }),
        },
        {
          title: 'Looking to create credentials file',
          skip: () => {
            if (fs.existsSync(DEFAULT_AWS_CREDENTIALS_FILE_PATH)) {
              return 'file exists'
            }
            if (!fs.existsSync(DEFAULT_AWS_CREDENTIALS_DIR) && process.geteuid() !== 0) {
              fs.mkdirSync(DEFAULT_AWS_CREDENTIALS_DIR, { recursive: true })
            }
            if (process.geteuid() === 0) {
              return `Command ${ctx.commandId} running in sudo sudo mode`
            }
          },
          task: () => execa('touch', [DEFAULT_AWS_CREDENTIALS_FILE_PATH]),
        },
      ],
      ctx.listrOptions
    )
    const awsDarwinTasks = new Listr(
      [
        {
          title: 'Looking if HomeBrew is available',
          task: () => execa('brew', ['help']),
        },
        {
          title: 'Looking to install cli via brew',
          skip: () => {
            if (fs.existsSync('/opt/homebrew/bin/aws')) {
              return 'aws-cli exists'
            }
          },
          task: () => execa('brew', ['install', 'awscli']),
        },
        {
          title: 'Looking to create credentials file',
          skip: () => {
            if (fs.existsSync(DEFAULT_AWS_CREDENTIALS_FILE_PATH)) {
              return 'file exists'
            }
            if (!fs.existsSync(DEFAULT_AWS_CREDENTIALS_DIR) && process.geteuid() !== 0) {
              fs.mkdirSync(DEFAULT_AWS_CREDENTIALS_DIR, { recursive: true })
            }
            if (process.geteuid() === 0) {
              return `Command ${ctx.commandId} running in sudo sudo mode`
            }
          },
          task: () => execa('touch', [DEFAULT_AWS_CREDENTIALS_FILE_PATH]),
        },
      ],
      ctx.listrOptions
    )
    const gossmTasks = new Listr(
      [
        {
          title: 'Looking to skip the setup',
          skip: () => {
            if (!fs.existsSync('/usr/local/bin/gossm')) {
              ctx.skipGossmSetup = false
              return 'gossm not installed'
            }
          },
          task: async () => {
            const { stdout } = await execa('gossm --version', { shell: true })
            const version = stdout.split(' ')[2]
            if (version === CURRENT_GOSSM_VERSION) {
              ctx.skipGossmSetup = true
            }
          },
        },
        {
          title: 'Looking to clean cache',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
            if (fs.existsSync(`${ctx.cacheDir}/gossm_${CURRENT_GOSSM_VERSION}_Linux_x86_64.tar.gz`)) {
              return 'No file found in cache'
            }
          },
          task: () =>
            execa(`rm -rf gossm_${CURRENT_GOSSM_VERSION}_Linux_x86_64.tar.gz gossm`, {
              shell: true,
              cwd: ctx.cacheDir,
            }),
        },
        {
          title: 'Downloading version from release',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
          },
          task: () =>
            execa(
              `wget https://github.com/gjbae1212/gossm/releases/download/v${CURRENT_GOSSM_VERSION}/gossm_${CURRENT_GOSSM_VERSION}_Linux_x86_64.tar.gz`,
              { shell: true, cwd: ctx.cacheDir }
            ),
        },
        {
          title: 'Extracting gossm from compressed file',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
          },
          task: () =>
            execa(`tar -xvzf gossm_${CURRENT_GOSSM_VERSION}_Linux_x86_64.tar.gz`, { shell: true, cwd: ctx.cacheDir }),
        },
        {
          title: 'Copying gossm to bin',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
          },
          task: () =>
            new Promise((resolve, reject) => {
              sudo.exec(
                `cp ${ctx.cacheDir}/gossm /usr/local/bin/gossm`,
                SUDO_PROMPT_OPTIONS,
                (error, stdout, stderr) => {
                  if (error) reject(error)
                  if (stderr) reject(stderr)
                  resolve(stdout)
                }
              )
            }),
        },
      ],
      ctx.listrOptions
    )
    const gossmDarwinTasks = new Listr(
      [
        {
          title: 'Looking to skip the setup',
          skip: () => {
            if (!fs.existsSync('/opt/homebrew/bin/gossm')) {
              ctx.skipGossmSetup = false
              return 'gossm not installed'
            }
            ctx.skipGossmSetup = true
          },
          task: async () => {
            const { stdout } = await execa('gossm --version', { shell: true })
            const version = stdout.split(' ')[2]
            if (version === CURRENT_GOSSM_VERSION) {
              ctx.skipGossmSetup = true
            }
          },
        },
        {
          title: 'Tapping gossm',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
          },
          task: () => execa('brew tap gjbae1212/gossm', { shell: true }),
        },
        {
          title: 'Installing gossm',
          skip: () => {
            if (ctx.skipGossmSetup) {
              return 'gossm exists'
            }
          },
          task: () => execa('brew install gossm', { shell: true }),
        },
      ],
      ctx.listrOptions
    )

    if (process.platform === 'linux') {
      cli.info('Few steps requires superuser access')
      cli.info(' 1. Installing aws-cli')
      cli.info(' 2. Copying gossm to /usr/local/bin/')
      cli.info('You will be prompted for your password by sudo')
      cli.info('...\n')
      cli.info('› Setting up AWS cli')
      await awsTasks.run()
      cli.info('› Setting up SSM cli')
      await gossmTasks.run()
    } else if (process.platform === 'darwin') {
      cli.info('› Setting up AWS cli')
      await awsDarwinTasks.run()
      cli.info('› Setting up SSM cli')
      await gossmDarwinTasks.run()
    } else {
      cli.error('Unsupported platform')
    }
    this.exit(0)
  }
}
