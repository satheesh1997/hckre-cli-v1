# hckre

One-stop CLI for HackerEarth's engineering & support team.
<br/><br/>

[![CodeQL](https://github.com/satheesh1997/hckre-cli/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/satheesh1997/hckre-cli/actions/workflows/codeql-analysis.yml)
[![Linter](https://github.com/satheesh1997/hckre-cli/actions/workflows/linters.yml/badge.svg)](https://github.com/satheesh1997/hckre-cli/actions/workflows/linters.yml)
[![Version](https://img.shields.io/npm/v/hckre.svg)](https://npmjs.org/package/hckre)
[![Downloads/week](https://img.shields.io/npm/dw/hckre.svg)](https://npmjs.org/package/hckre)
[![License](https://img.shields.io/npm/l/hckre.svg)](https://github.com/satheesh1997/hckre/blob/master/package.json)

[![asciicast](https://asciinema.org/a/MhFjHIGPQwcd6lh6TRCk9zopw.svg)](https://asciinema.org/a/MhFjHIGPQwcd6lh6TRCk9zopw)

<!-- toc -->
* [hckre](#hckre)
* [Installation](#installation)
* [Commands](#commands)
* [Wiki](#wiki)
* [Contributors](#contributors)
<!-- tocstop -->

# Installation

<!-- installation -->

## Binary (Linux)

```sh-session
$ curl https://hckre-cli.s3.ap-south-1.amazonaws.com/install.sh | bash
$ hckre COMMAND
running command...
$ hckre --help [COMMAND]
USAGE
  $ hckre COMMAND
...
```

## NPM (Linux, macOS)

```sh-session
$ npm install -g hckre
$ hckre COMMAND
running command...
$ hckre --help [COMMAND]
USAGE
  $ hckre COMMAND
...
```

<!-- installationstop -->

# Commands

<!-- commands -->
* [`hckre autocomplete [SHELL]`](#hckre-autocomplete-shell)
* [`hckre aws:config`](#hckre-awsconfig)
* [`hckre aws:ec2`](#hckre-awsec2)
* [`hckre aws:ecr`](#hckre-awsecr)
* [`hckre aws:setup`](#hckre-awssetup)
* [`hckre commands`](#hckre-commands)
* [`hckre help [COMMAND]`](#hckre-help-command)
* [`hckre info`](#hckre-info)
* [`hckre init`](#hckre-init)
* [`hckre mcs:deploy`](#hckre-mcsdeploy)
* [`hckre mcs:logs`](#hckre-mcslogs)
* [`hckre mcs:run`](#hckre-mcsrun)
* [`hckre mcs:shell`](#hckre-mcsshell)
* [`hckre mcs:start`](#hckre-mcsstart)
* [`hckre mcs:status`](#hckre-mcsstatus)
* [`hckre mcs:stop`](#hckre-mcsstop)
* [`hckre oncall:ping`](#hckre-oncallping)
* [`hckre oncall:tools`](#hckre-oncalltools)
* [`hckre update [CHANNEL]`](#hckre-update-channel)
* [`hckre vpn:config`](#hckre-vpnconfig)
* [`hckre vpn:down`](#hckre-vpndown)
* [`hckre vpn:setup`](#hckre-vpnsetup)
* [`hckre vpn:up`](#hckre-vpnup)

## `hckre autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ hckre autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ hckre autocomplete
  $ hckre autocomplete bash
  $ hckre autocomplete zsh
  $ hckre autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.3.0/src/commands/autocomplete/index.ts)_

## `hckre aws:config`

configure AWS credentials profile

```
USAGE
  $ hckre aws:config

OPTIONS
  -h, --help                    show CLI help
  --profile=production|staging
```

## `hckre aws:ec2`

login to ec2

```
USAGE
  $ hckre aws:ec2

OPTIONS
  -h, --help                        show CLI help
  -p, --profile=production|staging  profile in which the instance is running
  -r, --refresh-cache               refresh cache instance list for selected profile
  -t, --target=target               instanceId to access
```

## `hckre aws:ecr`

login to ecr

```
USAGE
  $ hckre aws:ecr

OPTIONS
  -h, --help                        show CLI help
  -p, --profile=production|staging  profile with which you want to login
```

## `hckre aws:setup`

setup AWS & SSM access tools

```
USAGE
  $ hckre aws:setup

OPTIONS
  -h, --help  show CLI help
```

## `hckre commands`

list all the commands

```
USAGE
  $ hckre commands

OPTIONS
  -h, --help              show CLI help
  -j, --json              display unfiltered api data in json format
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --hidden                show hidden commands
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [@oclif/plugin-commands](https://github.com/oclif/plugin-commands/blob/v1.3.0/src/commands/commands.ts)_

## `hckre help [COMMAND]`

display help for hckre

```
USAGE
  $ hckre help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `hckre info`

display information about cli

```
USAGE
  $ hckre info
```

## `hckre init`

initialise CLI

```
USAGE
  $ hckre init

OPTIONS
  -h, --help    show CLI help
  -u, --update  update the existing configurations
```

## `hckre mcs:deploy`

deploy mcs services

```
USAGE
  $ hckre mcs:deploy

OPTIONS
  -h, --help           show CLI help
  --platform=platform  platform to deploy. Default to 'docker'
```

## `hckre mcs:logs`

stops the mcs services

```
USAGE
  $ hckre mcs:logs

OPTIONS
  -h, --help           show CLI help
  --platform=platform  platform to deploy. Default to 'docker'
```

## `hckre mcs:run`

run a command

```
USAGE
  $ hckre mcs:run

OPTIONS
  -h, --help  show CLI help
```

## `hckre mcs:shell`

open a shell

```
USAGE
  $ hckre mcs:shell

OPTIONS
  -h, --help  show CLI help
```

## `hckre mcs:start`

starts the mcs services

```
USAGE
  $ hckre mcs:start

OPTIONS
  -h, --help           show CLI help
  --platform=platform  platform to deploy. Default to 'docker'
```

## `hckre mcs:status`

status of deployed services

```
USAGE
  $ hckre mcs:status

OPTIONS
  -h, --help           show CLI help
  --platform=platform  platform to deploy. Default to 'docker'
```

## `hckre mcs:stop`

stops the mcs services

```
USAGE
  $ hckre mcs:stop

OPTIONS
  -h, --help           show CLI help
  --platform=platform  platform to deploy. Default to 'docker'
```

## `hckre oncall:ping`

ping a service

```
USAGE
  $ hckre oncall:ping

OPTIONS
  -h, --help                                                      show CLI help
  -s, --service=www|assessment|app|api|auth|static-fastly|he-ide  just ping a particular service
```

## `hckre oncall:tools`

open a support tool

```
USAGE
  $ hckre oncall:tools

OPTIONS
  -h, --help  show CLI help
```

## `hckre update [CHANNEL]`

update the hckre CLI

```
USAGE
  $ hckre update [CHANNEL]

OPTIONS
  --from-local  interactively choose an already installed version
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.5.0/src/commands/update.ts)_

## `hckre vpn:config`

configure vpn credentials

```
USAGE
  $ hckre vpn:config

OPTIONS
  -h, --help  show CLI help
```

## `hckre vpn:down`

stop vpn

```
USAGE
  $ hckre vpn:down

OPTIONS
  -h, --help  show CLI help
```

## `hckre vpn:setup`

install wireguard

```
USAGE
  $ hckre vpn:setup

OPTIONS
  -h, --help  show CLI help
```

## `hckre vpn:up`

start vpn

```
USAGE
  $ hckre vpn:up

OPTIONS
  -h, --help  show CLI help
```
<!-- commandsstop -->

# Wiki

<!-- wiki -->

[https://github.com/satheesh1997/hckre-cli/wiki](https://github.com/satheesh1997/hckre-cli/wiki)

<!-- wikistop -->

# Contributors

<a href = "https://github.com/satheesh1997/hckre-cli/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=satheesh1997/hckre-cli"/>
</a>
