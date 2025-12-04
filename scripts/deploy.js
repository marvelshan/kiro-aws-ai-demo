#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Deployment script for blog infrastructure
 * Requirements: All (infrastructure) - Build and sync to S3, invalidate CloudFront cache
 * 
 * This script:
 * 1. Runs the build process to generate static files
 * 2. Retrieves CDK stack outputs (bucket name and distribution ID)
 * 3. Syncs built files to S3
 * 4. Invalidates CloudFront cache
 */

function executeCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function getStackOutputs() {
  console.log('\n🔍 Retrieving CDK stack outputs...');
  try {
    const output = execSync(
      'aws cloudformation describe-stacks --stack-name BlogInfrastructureStack --query "Stacks[0].Outputs" --output json',
      { encoding: 'utf-8' }
    );
    
    const outputs = JSON.parse(output);
    const bucketName = outputs.find(o => o.OutputKey === 'BucketName')?.OutputValue;
    const distributionId = outputs.find(o => o.OutputKey === 'DistributionId')?.OutputValue;
    
    if (!bucketName || !distributionId) {
      throw new Error('Could not find required stack outputs. Make sure the CDK stack is deployed.');
    }
    
    console.log(`✅ Found bucket: ${bucketName}`);
    console.log(`✅ Found distribution: ${distributionId}`);
    
    return { bucketName, distributionId };
  } catch (error) {
    console.error('❌ Failed to retrieve stack outputs:', error.message);
    console.error('\n💡 Tip: Make sure you have deployed the CDK stack first:');
    console.error('   cd infrastructure && npx cdk deploy');
    process.exit(1);
  }
}

async function deploy() {
  console.log('🚀 Starting deployment process...\n');
  
  // Step 1: Build the project
  executeCommand('npm run build', 'Building project');
  
  // Step 2: Get stack outputs
  const { bucketName, distributionId } = getStackOutputs();
  
  // Step 3: Sync files to S3
  executeCommand(
    `aws s3 sync dist/ s3://${bucketName}/ --delete --cache-control "public, max-age=31536000" --exclude "*.html" --exclude "articles/list.json"`,
    'Syncing static assets to S3 (with long cache)'
  );
  
  // Sync HTML and JSON files with shorter cache
  executeCommand(
    `aws s3 sync dist/ s3://${bucketName}/ --delete --cache-control "public, max-age=300" --exclude "*" --include "*.html" --include "articles/list.json"`,
    'Syncing HTML and JSON files to S3 (with short cache)'
  );
  
  // Step 4: Invalidate CloudFront cache
  console.log('\n🔄 Creating CloudFront invalidation...');
  try {
    const invalidationOutput = execSync(
      `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*" --query "Invalidation.Id" --output text`,
      { encoding: 'utf-8' }
    );
    
    const invalidationId = invalidationOutput.trim();
    console.log(`✅ CloudFront invalidation created: ${invalidationId}`);
    console.log('⏳ Cache invalidation may take a few minutes to complete');
  } catch (error) {
    console.error('❌ CloudFront invalidation failed:', error.message);
    console.error('⚠️  Files are uploaded but cache may not be cleared');
  }
  
  // Step 5: Get website URL
  try {
    const urlOutput = execSync(
      'aws cloudformation describe-stacks --stack-name BlogInfrastructureStack --query "Stacks[0].Outputs[?OutputKey==\'WebsiteUrl\'].OutputValue" --output text',
      { encoding: 'utf-8' }
    );
    
    const websiteUrl = urlOutput.trim();
    console.log('\n🎉 Deployment completed successfully!');
    console.log(`\n🌐 Your blog is available at: ${websiteUrl}`);
  } catch (error) {
    console.log('\n🎉 Deployment completed successfully!');
  }
}

// Run deployment
deploy().catch(error => {
  console.error('\n❌ Deployment failed:', error);
  process.exit(1);
});
