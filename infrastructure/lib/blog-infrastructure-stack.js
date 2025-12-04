import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';

export class BlogInfrastructureStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create S3 bucket for static website hosting
    // Requirements: All (infrastructure) - Static website hosting with versioning
    const websiteBucket = new s3.Bucket(this, 'BlogWebsiteBucket', {
      bucketName: undefined, // Let CDK generate unique name
      versioned: true, // Enable versioning for content history
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect production data
      autoDeleteObjects: false, // Don't auto-delete on stack deletion
      
      // Block public access - content served only through CloudFront
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      
      // Enable access logging for security monitoring
      serverAccessLogsPrefix: 'access-logs/',
      
      // Encryption at rest
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // CORS configuration for frontend API calls
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'], // Will be restricted by CloudFront
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Create CloudFront distribution
    // Requirements: All (infrastructure) - CDN with HTTPS and caching
    const distribution = new cloudfront.Distribution(this, 'BlogDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        compress: true,
        
        // Cache policy for static content
        cachePolicy: new cloudfront.CachePolicy(this, 'BlogCachePolicy', {
          cachePolicyName: 'BlogStaticContentPolicy',
          comment: 'Cache policy for blog static content',
          defaultTtl: cdk.Duration.hours(24),
          maxTtl: cdk.Duration.days(365),
          minTtl: cdk.Duration.seconds(0),
          
          // Cache based on query strings for article IDs
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          headerBehavior: cloudfront.CacheHeaderBehavior.none(),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        }),
      },
      
      // Default root object
      defaultRootObject: 'index.html',
      
      // Enable HTTP/2 and HTTP/3
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      
      // Price class - use all edge locations for best performance
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      
      // Enable IPv6
      enableIpv6: true,
      
      // Error responses for SPA routing
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      
      // Enable logging
      enableLogging: true,
      logBucket: websiteBucket,
      logFilePrefix: 'cloudfront-logs/',
      logIncludesCookies: false,
    });

    // Grant CloudFront read access to S3 bucket
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Output the bucket name for deployment scripts
    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name for blog content',
      exportName: 'BlogBucketName',
    });

    // Output CloudFront distribution details
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: 'BlogDistributionId',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: 'BlogDistributionDomain',
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Blog website URL',
    });

    // Store references for deployment script
    this.websiteBucket = websiteBucket;
    this.distribution = distribution;
  }
}
