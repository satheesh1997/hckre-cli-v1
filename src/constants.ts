import * as os from 'os'

export const DOCKER: string = 'docker'
export const MUMBAI_REGION: string = 'ap-south-1'
export const SINGAPORE_REGION: string = 'ap-southeast-1'
export const AWS_PROD: string = 'production'
export const AWS_STAGE: string = 'staging'

export const DEFAULT_DEPLOYMENT_PATH: string = os.homedir + '/hackerearth'
export const DEFAULT_MCS_DIR: string = 'django_mycareerstack'
export const DEFAULT_DEPLOYMENT_PLATFORM: string = DOCKER
export const DEFAULT_AWS_CREDENTIALS_DIR: string = os.homedir + '/.aws'
export const DEFAULT_AWS_CREDENTIALS_FILE_PATH: string = os.homedir + '/.aws/credentials'
export const DEFAULT_VPN_CONFIG_PATH: string = '/etc/wireguard/hackerearth.conf'

export const SUPPORTED_DEPLOYMENT_PLATFORMS: string[] = [DOCKER]
export const SUPPORTED_AWS_REGIONS: string[] = [MUMBAI_REGION, SINGAPORE_REGION]
export const SUPPORTED_AWS_REGION_CHOICES: { name: string }[] = [{ name: SINGAPORE_REGION }, { name: MUMBAI_REGION }]
export const SUPPORTED_AWS_PROFILES: string[] = [AWS_PROD, AWS_STAGE]
export const SUPPORTED_AWS_PROFILE_CHOICES: { name: string }[] = [{ name: AWS_PROD }, { name: AWS_STAGE }]

export const AWS_REGIONS_MAP: { [key: string]: string } = {
  [AWS_PROD]: SINGAPORE_REGION,
  [AWS_STAGE]: MUMBAI_REGION,
}

export const CURRENT_GOSSM_VERSION: string = '1.3.2'

export const SUDO_PROMPT_OPTIONS = {
  name: 'HackerEarth Command Line',
}

export const PING_SERVICE_WEBSITE_WWW = 'www'
export const PING_SERVICE_WEBSITE_ASSESSMENT = 'assessment'
export const PING_SERVICE_WEBSITE_APP = 'app'
export const PING_SERVICE_WEBSITE_API = 'api'
export const PING_SERVICE_WEBSITE_AUTH = 'auth'
export const PING_SERVICE_WEBSITE_STATIC = 'static-fastly'
export const PING_SERVICE_WEBSITE_IDE = 'he-ide'

export const SUPPORTED_PING_SEVICES = [
  PING_SERVICE_WEBSITE_WWW,
  PING_SERVICE_WEBSITE_ASSESSMENT,
  PING_SERVICE_WEBSITE_APP,
  PING_SERVICE_WEBSITE_API,
  PING_SERVICE_WEBSITE_AUTH,
  PING_SERVICE_WEBSITE_STATIC,
  PING_SERVICE_WEBSITE_IDE,
]
