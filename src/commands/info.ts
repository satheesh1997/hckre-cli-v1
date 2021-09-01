import { Command } from '@oclif/command'
import { cli } from 'cli-ux'

import chalk from 'chalk'

export default class Info extends Command {
  static description = 'display information about cli'

  async run() {
    const message = `
${chalk.bold(chalk.greenBright('Hckre'))} is a CLI tool that is built for making the onboarding &
development work of engineering and support team ease.

${chalk.bold(chalk.yellow('Version'))}: ${this.config.version}

${chalk.bold(chalk.yellow('Dependencies'))}:
    ${chalk.bold(chalk.blue('Ubuntu'))}
        1. sudo apt install git
        2. refer to install docker - https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04
        3. sudo apt-get install docker-compose
    ${chalk.bold(chalk.blue('Arch'))}
        1. sudo pacman -S git
        2. refer to install docker - https://linuxconfig.org/manjaro-linux-docker-installation
        3. sudo pacman -S docker-compose

${chalk.bold(chalk.yellow('AWS Profiles'))}:
    1. production -> refers to singapore region
    2. staging -> refers to mumbai region

${chalk.bold(chalk.yellow('Update'))}:
    Use ${chalk.red('hckre update')} to check and update to the latest version.

${chalk.bold(chalk.yellow('Changelog'))}:
    1. Added init command to configure the cli
    2. Added caching for the instances list in aws:ssm

${chalk.bold(chalk.yellow('Important Links'))}:
    1. ${chalk.greenBright('[Issues]')} https://github.com/satheesh1997/hckre-cli/issues
    2. ${chalk.greenBright('[News]')} https://github.com/satheesh1997/hckre-cli/discussions/categories/announcements
    3. ${chalk.greenBright('[New Ideas]')} https://github.com/satheesh1997/hckre-cli/discussions/categories/ideas
    4. ${chalk.greenBright('[Wiki]')} https://github.com/satheesh1997/hckre-cli/wiki

${chalk.bold('Built with')} ${chalk.bold(chalk.redBright('oclif'))}.

${chalk.bold(
      chalk.greenBright(
        'The developers of this tool are looking for contributors. We are now public for everyone to contribute.'
      )
    )}
    `
    cli.info(message)
    this.exit(0)
  }
}
