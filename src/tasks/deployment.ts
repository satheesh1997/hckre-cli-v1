import { spawnSync } from 'child_process'

import * as execa from 'execa'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as Listr from 'listr'

import { HckreContext } from '../api/context'
import { getProjectDir } from '../utils/mcs'

class Deployment {
  constructor() {}

  createServices() {
    throw new Error('NotImplemented Error')
  }

  checkServices() {
    throw new Error('NotImplemented Error')
  }

  checkServicesStatus() {
    throw new Error('NotImplemented Error')
  }

  getEndPointsList() {
    throw new Error('NotImplemented Error')
  }

  dependenciesCheckTasks(): Listr.ListrTask[] {
    throw new Error('NotImplemented Error')
  }

  startServices() {
    throw new Error('NotImplemented Error')
  }

  stopServices() {
    throw new Error('NotImplemented Error')
  }

  printServiceLogs() {
    throw new Error('NotImplemented Error')
  }
}

export class DockerDeployment extends Deployment {
  createServices() {
    const ctx = HckreContext.get()
    return new Listr([
      {
        title: 'webserver',
        task: () =>
          execa('docker-compose', ['build', 'webserver'], {
            cwd: getProjectDir(ctx),
          }),
      },
      ...this.downloadWebserverDependentServicesTasks(),
    ])
  }

  checkServices() {
    const ctx = HckreContext.get()
    const services: any = this.readDockerComposeFile().services
    const keys = Object.keys(services)
    const tasks: Listr.ListrTask[] = []
    keys.forEach(key => {
      tasks.push({
        title: services[key].container_name,
        task: () =>
          execa('docker', ['image', 'inspect', services[key].image], {
            cwd: getProjectDir(ctx),
          }).catch(() => {
            ctx.failedChecks += 1
            throw new Error(`service not deployed`)
          }),
      })
    })
    return new Listr(tasks)
  }

  checkServicesStatus() {
    const ctx = HckreContext.get()
    const services: any = this.readDockerComposeFile().services
    const keys = Object.keys(services)
    const tasks: Listr.ListrTask[] = []
    keys.forEach(key => {
      tasks.push({
        title: services[key].container_name,
        task: () =>
          execa('docker', ['container', 'inspect', services[key].container_name], {
            cwd: getProjectDir(ctx),
          }).catch(() => {
            ctx.failedChecks += 1
            throw new Error(`service not running`)
          }),
      })
    })
    return new Listr(tasks)
  }

  startServices() {
    const ctx = HckreContext.get()
    return execa('docker-compose up -d', { shell: true, cwd: getProjectDir(ctx) })
  }

  stopServices() {
    const ctx = HckreContext.get()
    return execa('docker-compose down', { shell: true, cwd: getProjectDir(ctx) })
  }

  printServiceLogs() {
    const ctx = HckreContext.get()
    spawnSync(`docker-compose logs -f`, [], {
      stdio: 'inherit',
      shell: true,
      cwd: getProjectDir(ctx),
    })
  }

  dependenciesCheckTasks(): Listr.ListrTask[] {
    return [
      {
        title: 'docker',
        task: () => execa('docker', ['version']),
      },
      {
        title: 'docker-compose',
        task: () => execa('docker-compose', ['version']),
      },
    ]
  }

  private readDockerComposeFile(): any {
    const ctx = HckreContext.get()
    try {
      const compose = yaml.load(fs.readFileSync(`${getProjectDir(ctx)}docker-compose.yml`, 'utf8'))
      if (compose) {
        return compose
      }
    } catch (e) {
      throw e
    }
    throw new Error('Unable to read docker-compose.yml')
  }

  private downloadWebserverDependentServicesTasks(): Listr.ListrTask[] {
    const ctx = HckreContext.get()
    const depends_on: [] = this.readDockerComposeFile().services.webserver.depends_on
    const tasks: Listr.ListrTask[] = []
    depends_on.forEach(name => {
      tasks.push({
        title: name,
        task: () =>
          execa('docker-compose', ['pull', name], {
            cwd: getProjectDir(ctx),
          }),
      })
    })
    return tasks
  }
}
