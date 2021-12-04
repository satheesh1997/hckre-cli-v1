import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { ConfigIniParser } from 'config-ini-parser'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

import chalk from 'chalk'
import inquirer from 'inquirer'
import readline from 'readline'

import {
  DEFAULT_AWS_CREDENTIALS_DIR,
  DEFAULT_AWS_CREDENTIALS_FILE_PATH,
  SUPPORTED_AWS_PROFILES,
  SUPPORTED_AWS_PROFILE_CHOICES,
} from '../../constants'

export default class Config extends Command {
  static description = 'configure AWS credentials profile'

  static flags = {
    help: flags.help({ char: 'h' }),
    profile: flags.string({ options: SUPPORTED_AWS_PROFILES }),
  }

  async run() {
    const { flags } = this.parse(Config)

    let awsProfile: any = flags.profile

    inquirer.registerPrompt('list', require('inquirer-search-list'))

    if (!awsProfile) {
      const responses: any = await inquirer.prompt([
        {
          name: 'profile',
          message: 'Choose a profile to configure',
          type: 'list',
          choices: SUPPORTED_AWS_PROFILE_CHOICES,
        },
      ])
      awsProfile = responses.profile
    }

    cli.info(
      `${chalk.green('?')} ${chalk.bold(
        `Paste the credentials from ${chalk.blueBright('https://hackerearth.awsapps.com/start#/')}`
      )}`
    )
    cli.info(`${chalk.grey('Option 2: Add a profile to your AWS credentials file')}`)

    const credentialsReaderInterface: any = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const credentialsLines = []

    for await (const line of credentialsReaderInterface) {
      if (line === '') {
        break
      } else {
        credentialsLines.push(line)
      }
    }

    if (credentialsLines.length == 0) {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }

    cli.info('...')
    cli.action.start(`› Validating credentials for ${awsProfile}`)

    const configParser = new ConfigIniParser('\r\n')
    const inputConfigParser = new ConfigIniParser('\r\n')
    const section = credentialsLines[0].replace('[', '').replace(']', '')

    try {
      inputConfigParser.parse(credentialsLines.join('\r\n'))
    } catch {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }

    if (!inputConfigParser.isHaveSection(section)) {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }

    if (!inputConfigParser.isHaveOption(section, 'aws_access_key_id')) {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }
    if (!inputConfigParser.isHaveOption(section, 'aws_secret_access_key')) {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }
    if (!inputConfigParser.isHaveOption(section, 'aws_session_token')) {
      this.error(
        `Invalid credentials. Copy valid credentials from ${chalk.blueBright(
          'https://hackerearth.awsapps.com/start#/'
        )}`
      )
    }

    cli.action.stop()
    cli.action.start(`› Configuring credentials for ${awsProfile}`)

    if (!existsSync(DEFAULT_AWS_CREDENTIALS_DIR)) {
      mkdirSync(DEFAULT_AWS_CREDENTIALS_DIR)
    }

    if (existsSync(DEFAULT_AWS_CREDENTIALS_FILE_PATH)) {
      const config = readFileSync(DEFAULT_AWS_CREDENTIALS_FILE_PATH)
      configParser.parse(config.toString())
    }

    if (!configParser.isHaveSection(awsProfile)) {
      configParser.addSection(awsProfile)
    }

    configParser.set(awsProfile, 'aws_access_key_id', inputConfigParser.get(section, 'aws_access_key_id'))
    configParser.set(awsProfile, 'aws_secret_access_key', inputConfigParser.get(section, 'aws_secret_access_key'))
    configParser.set(awsProfile, 'aws_session_token', inputConfigParser.get(section, 'aws_session_token'))

    writeFileSync(DEFAULT_AWS_CREDENTIALS_FILE_PATH, configParser.stringify('\r\n'))

    cli.action.stop()
    cli.info(`\n${chalk.green(chalk.bold(`Credentials configured for the ${awsProfile} profile !!`))}\n`)

    this.exit(0)
  }
}
