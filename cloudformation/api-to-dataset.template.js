const cf = require('@mapbox/cloudfriend');

const Parameters = {
  GitSha: {
    Type: 'String',
    Description: 'The SHA',
  },
  MapboxAccessToken: {
    Type: 'String',
    Description: 'mapbox access token',
  },
  DatasetId: {
    Type: 'String',
    Description: 'Mapbox dataset id',
  }
};

const Resources = {
  Logs: {
    Type: 'AWS::Logs::LogGroup',
    Properties: {
      LogGroupName: cf.sub('/aws/lambda/${AWS::StackName}'),
      RetentionInDays: 14
    }
  },
  UpdateFunc: {
    Type: 'AWS::Lambda::Function',
    Properties: {
      FunctionName: cf.sub('${AWS::StackName}'),
      Role: cf.getAtt('IAMRole', 'Arn'),
      Code: {
        S3Bucket: cf.sub('mapbox-${AWS::Region}'),
        S3Key: cf.sub('bundles/api-to-dataset/${GitSha}.zip')
      },
      Handler: 'index.fetchAndPush',
      MemorySize: 128,
      Timeout: 60,
      Runtime: 'nodejs6.10',
      Environment: {
        Variables: {
          MAPBOX_ACCESS_TOKEN: cf.ref('MapboxAccessToken'),
          DATASET_ID: cf.ref('DatasetId')
        }
      }
    }
  },
  IAMRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole'
          }
        ]
      },
      Policies: [
        {
          PolicyName: 'api-to-dataset-service',
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Action: 'logs:*',
                Resource: cf.getAtt('Logs', 'Arn')
              }
            ]
          }
        }
      ]
    }
  },
  UpdateSchedule: {
    Type: 'AWS::Events::Rule',
    Properties: {
      Description: 'Fetch and update every two hours',
      ScheduleExpression: 'cron(0 */2 * * ? *)',
      Targets: [{ Arn: cf.getAtt('UpdateFunc', 'Arn'), Id: 'UpdateFunc' }]
    }
  },
  UpdatePermission: {
    Type: 'AWS::Lambda::Permission',
    Properties: {
      Action: 'lambda:InvokeFunction',
      FunctionName: cf.getAtt('UpdateFunc', 'Arn'),
      Principal: 'events.amazonaws.com',
      SourceArn: cf.getAtt('UpdateSchedule', 'Arn')
    }
  }
};

module.exports = cf.merge({ Parameters, Resources });
