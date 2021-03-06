import { Command, flags } from '@oclif/command'
import { spawnSync } from 'child_process'
import { cli } from 'cli-ux'

import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'

import { HckreContext } from '../../api/context'
import { AWS_REGIONS_MAP, SUPPORTED_AWS_PROFILES, SUPPORTED_AWS_PROFILE_CHOICES } from '../../constants'
import { compareObjects } from '../../utils'
import { findInstances } from '../../utils/aws'
import { AvailableInstaceType } from '../../Types'

export default class EC2 extends Command {
  static description = 'login to ec2'

  static flags = {
    help: flags.help({ char: 'h' }),
    profile: flags.string({
      char: 'p',
      options: SUPPORTED_AWS_PROFILES,
      description: 'profile in which the instance is running',
    }),
    target: flags.string({ char: 't', description: 'instanceId to access' }),
    'refresh-cache': flags.boolean({ char: 'r', description: 'refresh cache instance list for selected profile' }),
  }

  async run() {
    const { flags } = this.parse(EC2)
    const ctx = await HckreContext.initAndGet(flags, this)

    ctx.AWSProfile = flags.profile
    ctx.AWSInstance = flags.target

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

    const instanceCahceListPath = `${ctx.cacheDir}/${ctx.AWSRegion}_instances-list.json`
    const lastSelectedInstancesCachePath = `${ctx.cacheDir}/${ctx.AWSRegion}_last_selected_instances.json`

    const checkRefershRequired = () => {
      if (fs.existsSync(instanceCahceListPath)) {
        const { mtime } = fs.statSync(instanceCahceListPath)
        const staleAt = new Date((mtime.valueOf() + 1000) * 60 * 60 * 24 * 1) // one day
        return staleAt < new Date()
      }
      return false
    }

    if (flags['refresh-cache'] || checkRefershRequired()) {
      if (fs.existsSync(instanceCahceListPath)) {
        fs.unlinkSync(instanceCahceListPath)
      }
      if (fs.existsSync(lastSelectedInstancesCachePath)) {
        fs.unlinkSync(lastSelectedInstancesCachePath)
      }
    }

    let previousSelectedInstance = []

    if (fs.existsSync(lastSelectedInstancesCachePath)) {
      previousSelectedInstance = JSON.parse(fs.readFileSync(lastSelectedInstancesCachePath).toString())
    }

    if (!ctx.AWSInstance) {
      let availableInstances: AvailableInstaceType[] = []

      if (fs.existsSync(instanceCahceListPath)) {
        cli.action.start(`${chalk.green('?')} ${chalk.bold('Fetching targets from cache')}`)
        availableInstances = JSON.parse(fs.readFileSync(instanceCahceListPath).toString())
        cli.action.stop(`${chalk.cyan('done')}`)
        cli.info(
          `${chalk.green('?')} ${chalk.bold(
            `Use ${chalk.redBright('aws:ssm -r')} to update the cache`
          )}... ${chalk.cyan('tip')}`
        )
      } else {
        cli.action.start(`${chalk.green('?')} ${chalk.bold(`Fetching targets running in ${ctx.AWSProfile}`)}`)
        availableInstances = await findInstances()
        availableInstances.sort((first, second) => {
          return compareObjects(first, second, 'name')
        })
        cli.action.stop(`${chalk.cyan('done')}`)
        fs.writeFileSync(instanceCahceListPath, JSON.stringify(availableInstances))
      }

      const previousLatestSelectedInstances = [...previousSelectedInstance].reverse()
      const changedOrderOfAvailableInstances = [...availableInstances]
      let lastIndex = 0

      previousLatestSelectedInstances.forEach(name => {
        const foundIndex = changedOrderOfAvailableInstances.findIndex(instance => instance.name === name)

        if (foundIndex !== -1) {
          const temp = changedOrderOfAvailableInstances[lastIndex]
          changedOrderOfAvailableInstances[lastIndex] = changedOrderOfAvailableInstances[foundIndex]
          changedOrderOfAvailableInstances[foundIndex] = temp
          lastIndex++
        }
      })

      const availableInstanceResponse: any = await inquirer.prompt([
        {
          pageSize: 20,
          name: 'instance',
          message: 'Choose a target in AWS',
          type: 'list',
          choices: changedOrderOfAvailableInstances,
        },
      ])

      const selectedInstanceName = availableInstances.filter(
        instance => instance.value === availableInstanceResponse.instance
      )[0].name
      const previosSelectedInstanceIndex = previousSelectedInstance.indexOf(selectedInstanceName)

      // delete the previous selectedName to preserve unique names in the list
      if (previosSelectedInstanceIndex !== -1) {
        delete previousSelectedInstance[previosSelectedInstanceIndex]
        previousSelectedInstance = previousSelectedInstance.filter(Boolean)
      }
      previousSelectedInstance.push(selectedInstanceName)
      fs.writeFileSync(lastSelectedInstancesCachePath, JSON.stringify(previousSelectedInstance))

      ctx.AWSInstance = availableInstanceResponse.instance
    }

    process.on('SIGINT', () => {
      // doing nothing on sigint signal to prevent ssm connection getting closed
    })

    spawnSync(`gossm -p ${ctx.AWSProfile} -r ${ctx.AWSRegion} -t ${ctx.AWSInstance} start`, [], {
      stdio: 'inherit',
      shell: true,
    })

    this.exit(0)
  }
}
