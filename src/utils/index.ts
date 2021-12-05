import {ConfigIniParser} from 'config-ini-parser'

import execa from 'execa'
import fs from 'fs'
import ini from 'ini'
import notifier from 'node-notifier'

import {HckreContext} from '../api/context'
import {DEFAULT_DEPLOYMENT_PATH, DEFAULT_MCS_DIR} from '../constants'

export function getCommandSuccessMessage(): string {
  const ctx = HckreContext.get()

  if (ctx[HckreContext.START_TIME]) {
    if (!ctx[HckreContext.END_TIME]) {
      ctx[HckreContext.END_TIME] = Date.now()
    }

    const workingTimeInSeconds = Math.round((ctx[HckreContext.END_TIME] - ctx[HckreContext.START_TIME]) / 1000)
    const minutes = Math.floor(workingTimeInSeconds / 60)
    const seconds = (workingTimeInSeconds - minutes * 60) % 60
    const minutesToStr = minutes.toLocaleString([], {
      minimumIntegerDigits: 2,
    })
    const secondsToStr = seconds.toLocaleString([], {
      minimumIntegerDigits: 2,
    })
    return `Command ${ctx[HckreContext.COMMAND_ID]} has completed successfully in ${minutesToStr}:${secondsToStr}`
  }

  return `Command ${ctx[HckreContext.COMMAND_ID]} has completed successfully`
}

export function notifyCommandCompletedSuccessfully(): void {
  notifier.notify({
    title: 'HackerEarth CLI',
    message: getCommandSuccessMessage(),
  })
}

export function compareObjects(object1: any, object2: any, key: any) {
  const obj1 = object1[key]
  const obj2 = object2[key]

  if (obj1 < obj2) {
    return -1
  }
  if (obj1 > obj2) {
    return 1
  }
  return 0
}

export async function getCurrentLinuxDistribution() {
  const {stdout, stderr} = await execa('cat /etc/issue | head -1', {shell: true})
  if (stderr) {
    throw stderr
  }
  const distribution = stdout.split(' ')[0]
  return distribution
}

export function getCLIConfigurationFilePath(ctx: any) {
  if (!fs.existsSync(ctx.configDir)) {
    fs.mkdirSync(ctx.configDir)
  }
  return `${ctx.configDir}/hckre.ini`
}

export function getCLIConfiguration(ctx: any) {
  return ini.parse(fs.readFileSync(getCLIConfigurationFilePath(ctx), 'utf-8'))
}

export function createCLIDefaultConfigFile(ctx: any) {
  const configParser = new ConfigIniParser('\r\n')

  configParser.addSection('basic')
  configParser.addSection('mcs')
  configParser.addSection('git')
  configParser.addSection('oncall-tools')

  configParser.set('basic', 'path', DEFAULT_DEPLOYMENT_PATH)

  configParser.set('mcs', 'git', '')
  configParser.set('mcs', 'dir', DEFAULT_MCS_DIR)

  configParser.set('git', 'name', '')
  configParser.set('git', 'email', '')

  configParser.set(
    'oncall-tools',
    'Sentry-Recruit-Backend',
    'https://sentry.io/organizations/hackerearth-eng/issues/?project=5819744'
  )
  configParser.set(
    'oncall-tools',
    'Sentry-Recruit-Frontend',
    'https://sentry.io/organizations/hackerearth-eng/issues/?project=5821470'
  )

  fs.writeFileSync(getCLIConfigurationFilePath(ctx), configParser.stringify('\r\n'))
}
