import {cli} from 'cli-ux'

import chalk from 'chalk'
import ping from 'node-http-ping'

export async function pingIndex() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging www.hackerearth.com`)
  await ping('https://www.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingAssessment() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging assessment.hackerearth.com`)
  await ping('https://assessment.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingApp() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging app.hackerearth.com`)
  await ping('https://app.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingApi() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging api.hackerearth.com`)
  await ping('https://api.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingAuth() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging auth.hackerearth.com`)
  await ping('https://auth.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingStatic() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging static-fastly.hackerearth.com`)
  await ping('https://static-fastly.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}

export async function pingIde() {
  cli.action.start(`${chalk.bold(chalk.greenBright('›'))} Pinging he-ide.hackerearth.com`)
  await ping('https://he-ide.hackerearth.com')
    .then((time: any) => cli.action.stop(chalk.greenBright(`${time}ms`)))
    .catch(() => cli.action.stop(chalk.bold(chalk.redBright('NOK'))))
}
export async function pingAll() {
  await pingIndex()
  await pingApp()
  await pingApi()
  await pingAuth()
  await pingAssessment()
  await pingStatic()
  await pingIde()
}
