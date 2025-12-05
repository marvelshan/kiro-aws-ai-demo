# CI/CD Setup Guide

This guide explains how to set up automated continuous integration and deployment for the blog system using GitHub Actions.

## Overview

The CI/CD pipeline automatically:
- Runs tests on every push and pull request
- Builds the project (scans articles, generates index, bundles frontend)
- Deploys to AWS S3 on successful builds to the main branch
- Invalidates CloudFront cache for immediate content updates

## Prerequisites

- GitHub repository with the blog code
- AWS account with S3 bucket and CloudFront distribution deployed
- AWS CLI installed locally (for initial setup)

## Setup Steps

### 1. Create AWS IAM OIDC Provider

GitHub Actions uses OpenID Connect (OIDC) for secure, keyless authentication with AWS. This is more secure than using long-lived access keys.

```bash
# Create OIDC provider (one-time setup per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role for GitHub Actions

Create a file named `github-actions-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

Replace:
- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_GITHUB_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

Create the role:

```bash
aws iam create-role \
  --role-name GitHubActionsBlogDeployRole \
  --assume-role-policy-document file://github-actions-trust-policy.json
```

### 3. Attach Permissions to the Role

Create a file named `github-actions-permissions.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

Replace:
- `YOUR_BUCKET_NAME` with your S3 bucket name
- `YOUR_ACCOUNT_ID` with your AWS account ID
- `YOUR_DISTRIBUTION_ID` with your CloudFront distribution ID

Create and attach the policy:

```bash
aws iam put-role-policy \
  --role-name GitHubActionsBlogDeployRole \
  --policy-name BlogDeploymentPolicy \
  --policy-document file://github-actions-permissions.json
```

### 4. Configure GitHub Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ROLE_ARN` | ARN of the IAM role created above | `arn:aws:iam::123456789012:role/GitHubActionsBlogDeployRole` |
| `AWS_REGION` | AWS region where resources are deployed | `us-east-1` |
| `S3_BUCKET_NAME` | Name of your S3 bucket | `my-blog-bucket-12345` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | `E1234ABCDEFGH` |

#### Finding Your Values

**AWS Account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

**S3 Bucket Name:**
```bash
aws s3 ls | grep blog
```

**CloudFront Distribution ID:**
```bash
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Origins.Items[0].DomainName]' --output table
```

**IAM Role ARN:**
```bash
aws iam get-role --role-name GitHubActionsBlogDeployRole --query 'Role.Arn' --output text
```

### 5. Verify Workflow File

The workflow file is located at `.github/workflows/deploy.yml`. It should already be in your repository. Review it to ensure it matches your needs.

### 6. Test the Pipeline

1. Make a change to your repository (e.g., add a new article)
2. Commit and push to a feature branch
3. Create a pull request to `main`
4. The workflow will run tests and build (but not deploy)
5. Merge the pull request
6. The workflow will run again, this time deploying to AWS

## Workflow Behavior

### On Pull Requests
- ✅ Checkout code
- ✅ Install dependencies
- ✅ Run tests
- ✅ Build project
- ❌ Skip deployment

### On Push to Main
- ✅ Checkout code
- ✅ Install dependencies
- ✅ Run tests
- ✅ Build project
- ✅ Deploy to S3
- ✅ Invalidate CloudFront cache

### Manual Trigger
You can manually trigger the workflow from the GitHub Actions UI:
1. Go to **Actions** tab
2. Select **Build and Deploy** workflow
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Monitoring

### View Workflow Runs

1. Go to the **Actions** tab in your GitHub repository
2. Click on a workflow run to see details
3. Expand each step to view logs

### Common Issues

#### Authentication Fails

**Error:** `Error: Could not assume role with OIDC`

**Solution:**
- Verify the trust policy includes your repository name
- Check that the OIDC provider exists in IAM
- Ensure the role ARN in GitHub secrets is correct

#### S3 Sync Fails

**Error:** `An error occurred (AccessDenied) when calling the PutObject operation`

**Solution:**
- Verify the IAM role has S3 permissions
- Check the bucket name in GitHub secrets
- Ensure the bucket exists and is in the correct region

#### CloudFront Invalidation Fails

**Error:** `An error occurred (AccessDenied) when calling the CreateInvalidation operation`

**Solution:**
- Verify the IAM role has CloudFront permissions
- Check the distribution ID in GitHub secrets
- Ensure the distribution exists and is enabled

#### Tests Fail

**Error:** Test failures in the workflow

**Solution:**
- Run tests locally: `npm test`
- Fix failing tests before pushing
- Check test logs in the workflow output

## Security Best Practices

1. **Use OIDC instead of access keys** - No long-lived credentials stored in GitHub
2. **Principle of least privilege** - Role only has permissions needed for deployment
3. **Restrict by repository** - Trust policy limits access to specific repo
4. **Rotate secrets regularly** - Update role ARN if role is recreated
5. **Monitor CloudWatch** - Set up alerts for unusual deployment activity

## Advanced Configuration

### Deploy to Multiple Environments

Modify the workflow to support staging and production:

```yaml
on:
  push:
    branches:
      - main
      - staging

jobs:
  deploy:
    steps:
      - name: Set environment
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
          fi
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets[format('S3_BUCKET_{0}', env.ENVIRONMENT)] }}/ --delete
```

Add environment-specific secrets:
- `S3_BUCKET_PRODUCTION`
- `S3_BUCKET_STAGING`
- `CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION`
- `CLOUDFRONT_DISTRIBUTION_ID_STAGING`

### Add Slack Notifications

Add a step to notify on deployment:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Cache Dependencies

The workflow already uses npm caching for faster builds:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

## Troubleshooting Commands

### Test AWS Authentication Locally

```bash
# Configure AWS CLI with the same role
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/GitHubActionsBlogDeployRole \
  --role-session-name test-session \
  --web-identity-token $(curl -H "Authorization: bearer $GITHUB_TOKEN" https://token.actions.githubusercontent.com)
```

### Validate IAM Policy

```bash
# Check role trust policy
aws iam get-role --role-name GitHubActionsBlogDeployRole

# List attached policies
aws iam list-role-policies --role-name GitHubActionsBlogDeployRole

# Get policy document
aws iam get-role-policy \
  --role-name GitHubActionsBlogDeployRole \
  --policy-name BlogDeploymentPolicy
```

### Test S3 Sync

```bash
# Test sync locally with the same command
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME/ --delete --dryrun
```

### Test CloudFront Invalidation

```bash
# Create test invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Cost Considerations

GitHub Actions provides:
- 2,000 minutes/month free for private repositories
- Unlimited minutes for public repositories

Each deployment typically takes 2-3 minutes, so you can deploy ~600 times per month on the free tier.

AWS costs:
- S3 sync: Minimal (only changed files)
- CloudFront invalidation: First 1,000 paths free per month
- Data transfer: Covered by CloudFront free tier for small blogs

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Configuring OpenID Connect in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [AWS S3 CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [AWS CloudFront CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/)
