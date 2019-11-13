#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import 'source-map-support/register';
import { AwsEcsBasic } from '../lib/aws-ecs-basic';

const app = new cdk.App();

new AwsEcsBasic(app, 'DemoBasicEcs');
