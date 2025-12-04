#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BlogInfrastructureStack } from '../lib/blog-infrastructure-stack.js';

const app = new cdk.App();

new BlogInfrastructureStack(app, 'BlogInfrastructureStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Static blog infrastructure with S3 and CloudFront',
});

app.synth();
