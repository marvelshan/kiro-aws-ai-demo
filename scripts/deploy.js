#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Deployment script for blog
 * Requirements: 4.2, 4.5 - Build static files for GitHub Pages deployment
 * 
 * This script:
 * 1. Runs the build process to generate static files
 * 2. Prepares files for GitHub Pages deployment
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

async function deploy() {
  console.log('🚀 Starting build process for GitHub Pages...\n');
  
  // Step 1: Build the project
  executeCommand('npm run build', 'Building project');
  
  console.log('\n🎉 Build completed successfully!');
  console.log('\n📁 Static files are ready in the dist/ directory');
  console.log('💡 These files will be automatically deployed to GitHub Pages via GitHub Actions');
}

// Run deployment
deploy().catch(error => {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
});
