import { Command, flags } from '@oclif/command'
import { spawnSync } from 'child_process'

import inquirer from 'inquirer'

export default class Run extends Command {
  static description = 'run a command'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const choosenCommand: any = await inquirer.prompt([
      {
        name: 'command',
        message: 'Choose a command to run',
        type: 'list',
        choices: [
          {
            name: 'Build - staticfiles',
            value: 'docker exec -it mcs.webserver bash -c "python manage.py collectstatic"',
          },
          {
            name: 'Migration - analytics',
            value: 'docker exec -it mcs.webserver bash -c "python manage.py migrate analytics --database=analytics"',
          },
          {
            name: 'Migration - default',
            value: 'docker exec -it mcs.webserver bash -c "python manage.py migrate"',
          },
        ],
      },
    ])

    spawnSync(choosenCommand.command, [], {
      stdio: 'inherit',
      shell: true,
    })
    this.exit(0)
  }
}
