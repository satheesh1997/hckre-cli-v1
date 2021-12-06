import AWS from 'aws-sdk'
import { HckreContext } from '../api/context'

const ctx = HckreContext.get()

const getManagedInstances = (): any => {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: ctx.AWSProfile })
  const ssm = new AWS.SSM({ region: ctx.AWSRegion })

  const maxInstances = 200

  const readyInstancesList: any[] = []

  return new Promise((resolve, reject) => {
    let nextToken = ''
    const loop = () => {
      ssm.describeInstanceInformation(
        {
          MaxResults: 50,
          InstanceInformationFilterList: [{ key: 'ResourceType', valueSet: ['EC2Instance'] }],
          NextToken: nextToken,
        },
        (err, data) => {
          if (err) {
            reject(err)
          }
          if (data?.InstanceInformationList) {
            for (let eachInstance = 0; eachInstance < data.InstanceInformationList.length; eachInstance++) {
              readyInstancesList.push(data.InstanceInformationList[eachInstance])
            }
          }
          if (data?.NextToken && readyInstancesList.length < maxInstances) {
            nextToken = data.NextToken
            Promise.resolve().then(loop).catch(reject)
          } else {
            resolve(readyInstancesList)
          }
        }
      )
    }
    loop()
  })
}

const getDescribeInstances = (instancesFilter: { Filters: { Name: string; Values: string[] }[] }): any =>
  new Promise((resolve, reject) => {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: ctx.AWSProfile })

    new AWS.EC2({ region: ctx.AWSRegion }).describeInstances(instancesFilter, function (error, data) {
      if (error) return reject(error)
      resolve(data)
    })
  })

export const findInstances = async () => {
  const managedInstances = await getManagedInstances()

  const ec2InstanceIds: string[] = []
  let describeInstances: any[] = []

  if (managedInstances.length === 0) {
    describeInstances = await getDescribeInstances({
      Filters: [
        {
          Name: 'instance-state-name',
          Values: ['running'],
        },
      ],
    })
  } else {
    managedInstances.forEach((instance: any) => {
      if (instance.PingStatus === 'Online') {
        if (instance.ResourceType === 'EC2Instance') {
          ec2InstanceIds.push(instance.InstanceId)
        }
      }
    })

    const maxFilterValues = 200 - 1
    const n = ec2InstanceIds.length
    const numBatches = n / maxFilterValues + 1

    for (let i = 0; i < numBatches; i++) {
      const start = i * maxFilterValues
      let end = start + maxFilterValues

      if (end > n) {
        end = n
      }

      const instancesFilter = {
        Filters: [
          {
            Name: 'instance-state-name',
            Values: ['running'],
          },
          {
            Name: 'instance-id',
            Values: ec2InstanceIds.slice(start, end),
          },
        ],
      }

      const describeInstance = getDescribeInstances(instancesFilter)
      describeInstances.push(describeInstance)
    }
  }

  const reservations: any[] = []

  describeInstances.forEach(describeInstance => {
    if (describeInstance.Reservations.length > 0) {
      reservations.push(describeInstance.Reservations)
    }
  })

  const responses: any[] = []

  reservations.forEach(reservation => {
    reservation.forEach((rData: { Instances: any[] }) => {
      rData.Instances.forEach(instance => {
        let name = ''
        instance.Tags.forEach((tag: { Key: string; Value: string }) => {
          if (tag.Key === 'Name') {
            name = tag.Value
          }
        })
        responses.push({ value: instance.InstanceId, name: `${name}  (${instance.InstanceId})` })
      })
    })
  })
  return responses
}
