# AWS Container Demos

This repository is dedicated to demoing different AWS Container Services. It is built entirely on the [AWS CDK](https://docs.aws.amazon.com/en_pv/cdk/?id=docs_gateway). The goal of this repository is not to provide production ready examples. The goal is to provide solid foundations for building your own services.

## Demos

- AWS ECS Basic - This demo is designed to spin up a simple ECS cluster within a VPC and deploy an NGINX service. The service will support autoscaling and high-availability.
- AWS EKS Basic - This demo is designed to spin up a simple EKS cluster within a VPC and deploy an NGINX service.

## Usage

Each demo comes with a `yarn run` script that will point the cdk to the proper demo. This will enable you to use the CDK like normal.

```bash
yarn run ecs:basic --profile personal synth

yarn run ecs:basic --profile personal deploy

yarn run ecs:basic --profile personal destroy
```
