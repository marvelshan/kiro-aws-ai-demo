# Development Guide

This guide covers local development setup, the build process, testing, and how to contribute to the blog system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Build Process](#build-process)
- [Testing](#testing)
- [Available npm Scripts](#available-npm-scripts)
- [Project Architecture](#project-architecture)
- [Adding New Features](#adding-new-features)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** 18 or higher
  ```bash
  node --version  # Should be v18.x.x or higher
  ```
  
- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

- **Git**
  ```bash
  git --version
  ```

### Optional (for deployment)

- **AWS CLI** (for manual deployments)
  ```bash
  aws --version
  ```
  
- **AWS CDK** (for infrastructure changes)
  ```bash
  npx cdk --version
  ```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-tool-integration-blog
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **Production dependencies**: marked, highlight.js, gray-matter
- **Development dependencies**: vitest, fast-check, aws-cdk, jsdom

### 3. Verify Installation

Run tests to ensure everything is set up correctly:

```bash
npm test
```

All tests should pass.

### 4. Build the Project

```bash
npm run build
```

This creates the `dist/` directory with:
- Frontend files (HTML, CSS, JS)
- Article index (`articles/list.json`)
- Copied markdown files

### 5. Run Locally

Serve the built files locally:

```bash
npx http-server dist
```

Open your browser to `http://localhost:8080`.

## Development Workflow

### Typical Development Cycle

1. **Make changes** to source files (frontend/, scripts/, articles/)
2. **Run tests** to verify changes: `npm test`
3. **Build** the project: `npm run build`
4. **Test locally**: `npx http-server dist`
5. **Commit** changes: `git commit -am "Description"`
6. **Push** to trigger CI/CD: `git push`

### Hot Reload Development

For frontend development with auto-reload:

```bash
# Terminal 1: Watch and rebuild on changes
npm run build -- --watch  # If supported by your build script

# Terminal 2: Serve with auto-reload
npx http-server dist -c-1
```

Note: The current build script doesn't have watch mode. You'll need to rebuild manually or add a file watcher.

### Working on Articles

1. Create or edit markdown files in `articles/`
2. Rebuild: `npm run build`
3. Refresh browser to see changes

No need to restart the server - just rebuild and refresh.

### Working on Frontend

1. Edit files in `frontend/` (HTML, CSS, JS)
2. Rebuild: `npm run build`
3. Refresh browser

For CSS/JS changes, you may need to hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

### Working on Build Scripts

1. Edit files in `scripts/`
2. Test the script directly:
   ```bash
   node scripts/scanner.js
   node scripts/parser.js
   node scripts/generator.js
   ```
3. Run full build: `npm run build`
4. Verify output in `dist/`

## Build Process

### Overview

The build process consists of several steps:

```
articles/*.md → Scanner → Parser → Generator → list.json
                                              ↓
frontend/*    → Copy to dist/              dist/
```

### Step-by-Step Breakdown

#### 1. Article Scanning (`scripts/scanner.js`)

**Purpose**: Find all markdown files in the `articles/` directory

**Process**:
- Recursively scans `articles/` directory
- Filters for `.md` files
- Excludes hidden files (starting with `.`)
- Returns array of file paths

**Output**: Array of file paths
```javascript
[
  'articles/sample-article.md',
  'articles/another-post.md',
  'articles/comprehensive-markdown-guide.md'
]
```

#### 2. Frontmatter Parsing (`scripts/parser.js`)

**Purpose**: Extract metadata from markdown files

**Process**:
- Reads each markdown file
- Parses YAML frontmatter using `gray-matter`
- Extracts: title, date, description, tags
- Falls back to filename and file mtime if no frontmatter

**Output**: Article metadata object
```javascript
{
  id: 'sample-article',
  title: 'Welcome to My Blog',
  date: '2024-12-04',
  filename: 'sample-article.md',
  description: 'This is a sample article...',
  tags: ['welcome', 'introduction']
}
```

#### 3. List Generation (`scripts/generator.js`)

**Purpose**: Create article index and copy files

**Process**:
- Combines scanner and parser results
- Sorts articles by date (newest first)
- Generates `articles/list.json`
- Copies markdown files to `dist/articles/`

**Output**: `dist/articles/list.json`
```json
{
  "articles": [
    {
      "id": "comprehensive-markdown-guide",
      "title": "Comprehensive Markdown Guide",
      "date": "2024-12-05",
      "filename": "comprehensive-markdown-guide.md",
      "description": "A complete guide...",
      "tags": ["markdown", "tutorial"]
    }
  ]
}
```

#### 4. Frontend Copy (`scripts/build.js`)

**Purpose**: Copy frontend assets to dist/

**Process**:
- Copies `frontend/index.html` to `dist/`
- Copies all JS files from `frontend/` to `dist/`
- Copies `frontend/styles.css` to `dist/`

### Build Script Execution

Run the complete build:

```bash
npm run build
```

This executes `node scripts/build.js`, which orchestrates all steps.

### Build Output Structure

```
dist/
├── index.html           # Main HTML file
├── app.js              # Application logic
├── router.js           # Routing
├── search.js           # Search functionality
├── github-importer.js  # GitHub import
├── styles.css          # Styles
└── articles/
    ├── list.json       # Generated index
    ├── sample-article.md
    ├── another-post.md
    └── comprehensive-markdown-guide.md
```

## Testing

### Running Tests

**Run all tests once:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run specific test file:**
```bash
npx vitest run tests/markdown-parser.test.js
```

### Test Structure

Tests are located in the `tests/` directory:

- `markdown-parser.test.js` - Tests markdown parsing and rendering
- `article-detail.test.js` - Tests article detail page functionality
- `error-handling.test.js` - Tests error scenarios

### Writing Tests

#### Unit Tests

Use Vitest for unit tests:

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../scripts/my-module.js';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

#### Property-Based Tests

Use fast-check for property-based tests:

```javascript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('Property: Round-trip consistency', () => {
  it('should maintain data after serialize/deserialize', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const serialized = serialize(input);
        const deserialized = deserialize(serialized);
        return deserialized === input;
      }),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage

Check test coverage:

```bash
npx vitest run --coverage
```

## Available npm Scripts

### Build and Development

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | `node scripts/build.js` | Build the project (scan articles, generate index, copy files) |
| `npm test` | `vitest --run` | Run all tests once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |

### Deployment

| Script | Command | Description |
|--------|---------|-------------|
| `npm run deploy` | `node scripts/deploy.js` | Build and deploy to AWS S3 |

### Infrastructure (AWS CDK)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run cdk:deploy` | `cd infrastructure && npx cdk deploy` | Deploy infrastructure to AWS |
| `npm run cdk:diff` | `cd infrastructure && npx cdk diff` | Show infrastructure changes |
| `npm run cdk:synth` | `cd infrastructure && npx cdk synth` | Generate CloudFormation template |
| `npm run cdk:destroy` | `cd infrastructure && npx cdk destroy` | Destroy all infrastructure (⚠️ dangerous) |

### Custom Scripts

You can add custom scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "serve": "http-server dist"
  }
}
```

## Project Architecture

### Frontend Architecture

The frontend is a simple Single Page Application (SPA):

```
index.html
    ↓
app.js (main controller)
    ├── router.js (handles navigation)
    ├── search.js (search functionality)
    └── github-importer.js (GitHub import)
```

**Key Components:**

1. **Router** (`router.js`)
   - Hash-based routing (`#/` and `#/article/:id`)
   - Handles navigation between list and detail views
   - Updates URL without page reload

2. **App Controller** (`app.js`)
   - Initializes the application
   - Fetches article list from `articles/list.json`
   - Renders article list or detail based on route
   - Handles markdown parsing with marked.js
   - Applies syntax highlighting with highlight.js

3. **Search** (`search.js`)
   - Real-time search across titles, content, tags
   - Filters article list dynamically

4. **GitHub Importer** (`github-importer.js`)
   - Fetches markdown files from GitHub repos
   - Parses frontmatter
   - Displays preview before import

### Backend Architecture

There is no traditional backend. The system is fully static:

- **Build time**: Scripts generate static files
- **Runtime**: S3 serves static files via CloudFront
- **No server**: No Node.js server in production

### Data Flow

```
User Request
    ↓
CloudFront (CDN)
    ↓
S3 Bucket
    ↓
Static Files (HTML, JS, CSS, JSON, MD)
    ↓
Browser
    ↓
JavaScript renders content
```

## Adding New Features

### Adding a New Frontend Feature

1. **Create the feature file** (e.g., `frontend/comments.js`)
2. **Import in app.js**:
   ```javascript
   import { initComments } from './comments.js';
   ```
3. **Initialize the feature**:
   ```javascript
   initComments();
   ```
4. **Update build script** to copy the new file
5. **Write tests** in `tests/comments.test.js`
6. **Build and test**: `npm run build && npm test`

### Adding a New Build Step

1. **Create the script** (e.g., `scripts/optimize-images.js`)
2. **Update `scripts/build.js`** to call your script:
   ```javascript
   import { optimizeImages } from './optimize-images.js';
   await optimizeImages();
   ```
3. **Test the script**: `node scripts/optimize-images.js`
4. **Write tests** if applicable
5. **Document** in this guide

### Modifying Infrastructure

1. **Edit CDK stack** in `infrastructure/lib/blog-infrastructure-stack.js`
2. **View changes**: `npm run cdk:diff`
3. **Test locally** with CDK synth: `npm run cdk:synth`
4. **Deploy**: `npm run cdk:deploy`
5. **Update documentation** in `infrastructure/README.md`

## Debugging

### Frontend Debugging

**Browser DevTools:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Check Console for errors
3. Use Network tab to inspect requests
4. Use Sources tab to set breakpoints

**Common Issues:**

- **404 errors**: Check that files exist in `dist/`
- **Markdown not rendering**: Check marked.js configuration
- **Routing not working**: Check hash in URL and router.js logic

### Build Script Debugging

**Add console.log statements:**
```javascript
console.log('Scanning articles...');
const files = await scanArticles();
console.log('Found files:', files);
```

**Run scripts directly:**
```bash
node scripts/scanner.js
node scripts/parser.js
node scripts/generator.js
```

**Check output:**
```bash
ls -la dist/articles/
cat dist/articles/list.json
```

### Test Debugging

**Run single test:**
```bash
npx vitest run tests/markdown-parser.test.js
```

**Add debug output:**
```javascript
it('should parse markdown', () => {
  const result = parseMarkdown('# Hello');
  console.log('Result:', result);
  expect(result).toContain('<h1>');
});
```

**Use vitest UI:**
```bash
npx vitest --ui
```

## Contributing

### Contribution Workflow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Make changes** and commit: `git commit -am "Add my feature"`
4. **Write tests** for new functionality
5. **Run tests**: `npm test`
6. **Build**: `npm run build`
7. **Push**: `git push origin feature/my-feature`
8. **Create Pull Request** on GitHub

### Code Style

- Use **ES6+ syntax** (const, let, arrow functions, async/await)
- Use **meaningful variable names**
- Add **comments** for complex logic
- Follow **existing code patterns**
- Keep functions **small and focused**

### Commit Messages

Use clear, descriptive commit messages:

```
✅ Good:
- "Add search functionality to article list"
- "Fix markdown parser handling of code blocks"
- "Update README with deployment instructions"

❌ Bad:
- "Update"
- "Fix bug"
- "Changes"
```

### Pull Request Guidelines

- **Describe** what your PR does
- **Reference** any related issues
- **Include** screenshots for UI changes
- **Ensure** all tests pass
- **Update** documentation if needed

## Additional Resources

- [Marked.js Documentation](https://marked.js.org/)
- [Highlight.js Documentation](https://highlightjs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Getting Help

If you encounter issues:

1. Check this development guide
2. Review the main [README.md](../README.md)
3. Check [infrastructure/README.md](../infrastructure/README.md) for AWS-specific issues
4. Search existing GitHub issues
5. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

---

Happy coding! 🚀
