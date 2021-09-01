import Command from '@oclif/command'
import os from 'os'
import path from 'path'
import Listr from 'listr'
import { DEPLOYMENT_PLATFORM_KEY } from '../common-flags'

export namespace HckreContext {
  export const START_TIME = 'startTime'
  export const END_TIME = 'endTime'
  export const CONFIG_DIR = 'configDir'
  export const CACHE_DIR = 'cacheDir'
  export const ERROR_LOG = 'errorLog'
  export const COMMAND_ID = 'commandId'
  export const LOGS_DIR = 'logsDir'

  const ctx: any = {}

  export async function init(flags: any, command: Command): Promise<void> {
    ctx.deploymentPlatform = flags[DEPLOYMENT_PLATFORM_KEY] || 'docker'
    ctx.listrOptions = { collapse: false } as Listr.ListrOptions

    ctx[START_TIME] = Date.now()
    ctx[CONFIG_DIR] = command.config.configDir
    ctx[CACHE_DIR] = command.config.cacheDir
    ctx[ERROR_LOG] = command.config.errlog
    ctx[COMMAND_ID] = command.id
    ctx[LOGS_DIR] = path.resolve(os.tmpdir(), 'hckre-logs', Date.now().toString())
  }

  export async function initAndGet(flags: any, command: Command): Promise<any> {
    await init(flags, command)
    return ctx
  }

  export function get(): any {
    return ctx
  }
}
