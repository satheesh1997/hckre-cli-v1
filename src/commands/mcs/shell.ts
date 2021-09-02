import { Command, flags } from '@oclif/command'
import { spawnSync } from 'child_process'

import * as inquirer from 'inquirer'

export default class Shell extends Command {
  static description = 'open a shell'

  static flags = {
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const choosenCommand: any = await inquirer.prompt([
      {
        name: 'command',
        message: 'Choose a shell',
        type: 'list',
        choices: [
          { name: 'Webserver', value: 'docker exec -it mcs.webserver bash' },
          {
            name: 'Django',
            value: 'docker exec -it mcs.webserver bash -c "python manage.py shell_plus"',
          },
          {
            name: 'Mysql',
            value: 'docker exec -it mcs.mysql bash -c "mysql -u careerstack -p"',
          },
          {
            name: 'Python',
            value: 'docker exec -it mcs.webserver bash -c "python"',
          },
          {
            name: 'ipython',
            value: 'docker exec -it mcs.webserver bash -c "ipython"',
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
