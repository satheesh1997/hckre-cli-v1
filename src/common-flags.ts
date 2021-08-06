import { string } from '@oclif/parser/lib/flags'

import { DEFAULT_DEPLOYMENT_PLATFORM } from './constants'

export const DEPLOYMENT_PLATFORM_KEY = 'platform'
export const deploymentPlatform = string({
  description: `platform to deploy. Default to '${DEFAULT_DEPLOYMENT_PLATFORM}'`,
  env: 'MCS_DEPLOYMENT_PLATFORM',
})
