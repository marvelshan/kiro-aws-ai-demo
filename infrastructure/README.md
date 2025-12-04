# Blog Infrastructure

This directory contains AWS CDK infrastructure code for the static blog system.

## Architecture

The infrastructure consists of:
- **S3 Bucket**: Stores static website files (HTML, CSS, JS, markdown articles)
- **CloudFront Distribution**: CDN for fast global content delivery with HTTPS
- **Origin Access Control**: Secure access from CloudFront to S3

## Prerequisites

1. AWS CLI installed and configured with credentials
2. Node.js and npm installed
3. AWS CDK CLI installed globally (optional, can use npx)

```bash
npm install -g aws-cdk
```

## Initial Setup

### 1. Bootstrap CDK (First time only)

If you haven't used CDK in your AWS account/region before:

```bash
cd infrastructure
npx cdk bootstrap
```

### 2. Deploy Infrastructure

```bash
cd infrastructure
npx cdk deploy
```

This will:
- Create an S3 bucket with versioning enabled
- Set up a CloudFront distribution with HTTPS
- Configure proper security policies
- Output the bucket name and website URL

Review the changes and confirm when prompted.

## Deployment Commands

### Deploy Infrastructure Changes

```bash
cd infrastructure
npx cdk deploy
```

### View Infrastructure Diff

```bash
cd infrastructure
npx cdk diff
```

### Synthesize CloudFormation Template

```bash
cd infrastructure
npx cdk synth
```

### Destroy Infrastructure

⚠️ **Warning**: This will delete all resources including the S3 bucket content!

```bash
cd infrastructure
npx cdk destroy
```

## Deploying Blog Content

After infrastructure is deployed, use the deployment script from the project root:

```bash
npm run deploy
```

This script will:
1. Build the blog (scan articles, generate list.json)
2. Sync files to S3
3. Invalidate CloudFront cache
4. Display the website URL

## Stack Outputs

After deployment, the stack provides these outputs:

- **BucketName**: S3 bucket name for manual operations
- **DistributionId**: CloudFront distribution ID for cache invalidation
- **DistributionDomainName**: CloudFront domain name
- **WebsiteUrl**: Full HTTPS URL to access your blog

View outputs:

```bash
aws cloudformation describe-stacks --stack-name BlogInfrastructureStack --query "Stacks[0].Outputs"
```

## Security Features

- **S3 Bucket**: 
  - Block all public access
  - Versioning enabled
  - Server-side encryption
  - Access logging enabled
  
- **CloudFront**:
  - HTTPS only (HTTP redirects to HTTPS)
  - Origin Access Control for secure S3 access
  - Compression enabled (Gzip and Brotli)
  - Access logging enabled

## Cost Optimization

- CloudFront caching reduces S3 requests
- Static content cached for 1 year
- HTML/JSON cached for 5 minutes
- S3 versioning allows rollback but increases storage costs

## Troubleshooting

### CDK Bootstrap Error

If you see "CDK bootstrap required":
```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Deployment Script Can't Find Stack

Make sure the infrastructure is deployed first:
```bash
cd infrastructure && npx cdk deploy
```

### CloudFront Cache Not Updating

The deployment script automatically invalidates the cache. If needed, manually invalidate:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Permission Errors

Ensure your AWS credentials have permissions for:
- CloudFormation
- S3
- CloudFront
- IAM (for creating roles and policies)

## Custom Domain (Optional)

To use a custom domain:

1. Register domain in Route53 or use existing domain
2. Request ACM certificate in us-east-1 region
3. Update `blog-infrastructure-stack.js` to add:
   - Certificate ARN
   - Domain name configuration
   - Route53 alias record

## Monitoring

- CloudFront access logs: Stored in S3 bucket under `cloudfront-logs/`
- S3 access logs: Stored in S3 bucket under `access-logs/`
- CloudWatch metrics: Available for both S3 and CloudFront

## Further Reading

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
