import ec2 = require('@aws-cdk/aws-ec2');
import eks = require('@aws-cdk/aws-eks');
import iam = require('@aws-cdk/aws-iam');
import cdk = require('@aws-cdk/core');

export class AwsEksBasic extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'BasicEksVpc', {
      cidr: '10.1.0.0/16',
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true
    });

  }
}
