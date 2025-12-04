# Static Blog System

A simple, serverless static blog system for displaying Markdown articles stored in a Git repository. Built with AWS S3, CloudFront, and vanilla JavaScript.

## Features

- 📝 Write articles in Markdown with YAML frontmatter
- 🚀 Automatic article discovery and indexing
- 🌐 Fast global delivery via CloudFront CDN
- 🔒 Secure HTTPS-only access
- 📱 Responsive design for all devices
- 💻 Syntax highlighting for code blocks
- 🎨 Clean, minimal interface
- 🔍 **Real-time article search** - Search across titles, content, and tags
- 🐙 **GitHub Repository Import** - Automatically import markdown files from any GitHub repo

## Architecture

```
Git Repository → Build Script → S3 Bucket → CloudFront → Readers
```

- **S3**: Hosts static files (HTML, CSS, JS, articles)
- **CloudFront**: CDN for fast, global content delivery
- **Build Script**: Scans markdown files and generates article index
- **Frontend**: Vanilla JavaScript SPA with markdown rendering

### Architecture Diagram

Generate a visual diagram of the infrastructure:

```bash
# Install Graphviz (required)
brew install graphviz  # macOS
# sudo apt-get install graphviz  # Ubuntu/Debian

# Install Python dependencies
pip install diagrams

# Generate diagram
python3 infrastructure/generate_architecture_diagram.py
```

The diagram will be saved as `infrastructure/blog-architecture.png`.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials
- AWS CDK (optional, can use npx)

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy Infrastructure

First-time setup (bootstrap CDK if needed):

```bash
npx cdk bootstrap
```

Deploy the infrastructure:

```bash
npm run cdk:deploy
```

This creates:
- S3 bucket with versioning
- CloudFront distribution with HTTPS
- Proper security policies

### 3. Add Articles

Create markdown files in the `articles/` directory:

```markdown
---
title: "My First Post"
date: "2024-12-04"
description: "A sample blog post"
tags: ["tutorial", "getting-started"]
---

# My First Post

Your content here...
```

### 4. Deploy Content

Build and deploy your blog:

```bash
npm run deploy
```

This will:
1. Scan articles and generate index
2. Build frontend assets
3. Sync to S3
4. Invalidate CloudFront cache
5. Display your blog URL

## Project Structure

```
.
├── articles/              # Markdown articles
├── frontend/              # Frontend application
│   ├── index.html        # Main HTML template
│   ├── app.js            # Application logic
│   ├── router.js         # SPA routing
│   └── styles.css        # Styling
├── scripts/              # Build and deployment scripts
│   ├── build.js          # Build process
│   ├── scanner.js        # Article scanner
│   ├── parser.js         # Frontmatter parser
│   ├── generator.js      # Index generator
│   └── deploy.js         # Deployment script
├── infrastructure/       # AWS CDK infrastructure
│   ├── bin/              # CDK app entry point
│   ├── lib/              # CDK stack definition
│   └── README.md         # Infrastructure docs
├── tests/                # Test files
└── dist/                 # Build output (generated)
```

## Development

### Local Development

Build the project locally:

```bash
npm run build
```

Serve locally (requires http-server or similar):

```bash
npx http-server dist
```

### Running Tests

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

## New Features

### 🔍 Search Functionality

Use the search bar at the top of the page to quickly find articles:
- Search by title, content, tags, or description
- Real-time results as you type
- Results ranked by relevance

### 🐙 GitHub Repository Import

Import markdown files from any public GitHub repository:

1. Click the "導入 GitHub Repo" button in the header
2. Enter a GitHub repository URL (e.g., `https://github.com/marvelshan/tech-forum`)
3. Click "讀取文章" to fetch all markdown files
4. Preview the articles and click "確認導入" to import

**Supported URL formats:**
- `https://github.com/owner/repo`
- `owner/repo`
- `https://github.com/owner/repo.git`

The importer will:
- Recursively scan all directories for `.md` files
- Parse YAML frontmatter for metadata
- Use filename as title if no frontmatter exists
- Display all articles with full markdown rendering

**Example repositories to try:**
- `https://github.com/marvelshan/tech-forum`
- Any public GitHub repo with markdown files

For detailed documentation, see [Search and GitHub Import Guide](docs/search-and-github-import.md).

## Writing Articles

### Frontmatter Format

```yaml
---
title: "Article Title"        # Required
date: "2024-12-04"            # Required (ISO 8601)
description: "Brief summary"  # Optional
tags: ["tag1", "tag2"]        # Optional
---
```

### Markdown Support

- Headings (H1-H6)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Links and images
- Blockquotes
- Tables
- And more...

### File Naming

- Use `.md` extension
- Avoid spaces (use hyphens: `my-article.md`)
- Files without frontmatter use filename as title

## Deployment

### Infrastructure Updates

View changes before deploying:

```bash
npm run cdk:diff
```

Deploy infrastructure changes:

```bash
npm run cdk:deploy
```

### Content Updates

After adding or modifying articles:

```bash
npm run deploy
```

### Manual S3 Sync

If needed, sync files manually:

```bash
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete
```

### Cache Invalidation

Manually invalidate CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR-DIST-ID \
  --paths "/*"
```

## Configuration

### Cache Settings

- Static assets (JS, CSS, images): 1 year
- HTML and JSON: 5 minutes
- CloudFront handles compression (Gzip/Brotli)

### Security

- S3 bucket blocks all public access
- Content served only through CloudFront
- HTTPS enforced (HTTP redirects to HTTPS)
- Origin Access Control for secure S3 access
- Versioning enabled for rollback capability

## Cost Optimization

- CloudFront caching reduces S3 requests
- Free tier covers most small blogs
- Pay only for storage and data transfer
- No servers to maintain

## Troubleshooting

### Build Fails

Check that all dependencies are installed:
```bash
npm install
```

### Deployment Fails

Ensure infrastructure is deployed first:
```bash
npm run cdk:deploy
```

Verify AWS credentials:
```bash
aws sts get-caller-identity
```

### Articles Not Showing

- Check frontmatter format (valid YAML)
- Ensure files are in `articles/` directory
- Rebuild and redeploy: `npm run deploy`
- Check CloudFront cache invalidation completed

### 404 Errors

- Wait for CloudFront cache invalidation (5-10 minutes)
- Check S3 bucket has the files
- Verify CloudFront distribution is enabled

## Scripts Reference

- `npm run build` - Build project locally
- `npm run deploy` - Deploy content to AWS
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run cdk:deploy` - Deploy infrastructure
- `npm run cdk:diff` - View infrastructure changes
- `npm run cdk:synth` - Generate CloudFormation template
- `npm run cdk:destroy` - Destroy infrastructure (⚠️ deletes everything)

## Infrastructure Details

See [infrastructure/README.md](infrastructure/README.md) for detailed infrastructure documentation.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review infrastructure docs
- Check AWS CloudWatch logs
- Open an issue on GitHub