import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import elb = require('@aws-cdk/aws-elasticloadbalancingv2');
import iam = require('@aws-cdk/aws-iam');
import logs = require('@aws-cdk/aws-logs');
import cdk = require('@aws-cdk/core');

export class AwsEcsBasic extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'BasicEcsVpc', {
      cidr: '10.1.0.0/16',
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true
    });

    const logGroup = new logs.LogGroup(this, 'BasicEcsLogGroup', {
      logGroupName: '/demo/aws-ecs-basic/nginx'
    });

    const executionRole = new iam.Role(this, 'BasicEcsExecutionRole', {
      roleName: 'BasicEcsNginxExecutionRole',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    });

    const cluster = new ecs.Cluster(this, 'BasicEcsCluster', {
      vpc
    });

    cluster.addCapacity('BasicEcsNodeGroup', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.LARGE),
      minCapacity: 3,
      desiredCapacity: 3,
      maxCapacity: 6,
      canContainersAccessInstanceRole: false
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'NginxTaxDefinition', {
      executionRole,
      family: 'basic-nginx-demo',
      networkMode: ecs.NetworkMode.AWS_VPC
    });

    const container = taskDefinition.addContainer('nginx-container', {
      image: ecs.ContainerImage.fromRegistry('nginx:1.17'),
      cpu: 1024,
      memoryLimitMiB: 1024,
      memoryReservationMiB: 512,
      logging: new ecs.AwsLogDriver({
        logGroup,
        streamPrefix: 'basic-'
      })
    });

    container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP
    });

    const service = new ecs.Ec2Service(this, "BasicEcsService", {
      cluster,
      desiredCount: 3,
      taskDefinition,
      assignPublicIp: false,
      serviceName: 'nginx-service'
    });

    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 6
    });

    scaling.scaleOnCpuUtilization('NginxCpuScaling', {
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });

    const lb = new elb.ApplicationLoadBalancer(this, 'BasicEcsLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('BasicEcsPublicListener', {
      protocol: elb.ApplicationProtocol.HTTP,
      port: 80,
      open: true
    });

    listener.addTargets('BasicEcsTargets', {
      port: 80,
      targets: [service.loadBalancerTarget({
        containerName: 'nginx-container',
        containerPort: 80
      })],
      healthCheck: {
        interval: cdk.Duration.seconds(30),
        path: '/',
        timeout: cdk.Duration.seconds(10),
      }
    });

    new cdk.CfnOutput(this, 'EcsClusterName', { value: cluster.clusterName });
    new cdk.CfnOutput(this, 'LogGroup', { value: logGroup.logGroupName });
    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: lb.loadBalancerDnsName });

  }
}
