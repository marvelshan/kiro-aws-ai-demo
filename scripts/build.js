import { generateArticleList } from './generator.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { copyFile, mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, '..', 'articles');
const OUTPUT_DIR = join(__dirname, '..', 'dist');
const FRONTEND_DIR = join(__dirname, '..', 'frontend');

async function build() {
  try {
    console.log('Building article list from Git Submodule...');
    console.log(`Source directory: ${SOURCE_DIR}`);
    
    // Use local articles directory (which is now a Git submodule)
    await generateArticleList(SOURCE_DIR, OUTPUT_DIR);
    
    console.log('Copying frontend files...');
    await copyFrontendFiles();
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

/**
 * Copy frontend files to dist directory
 */
async function copyFrontendFiles() {
  // Ensure dist directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });
  
  // List of frontend files to copy
  const files = ['index.html', 'app.js', 'router.js', 'styles.css', 'search.js', 'github-importer.js'];
  
  // Copy each file
  await Promise.all(
    files.map(async (file) => {
      const sourcePath = join(FRONTEND_DIR, file);
      const destPath = join(OUTPUT_DIR, file);
      await copyFile(sourcePath, destPath);
    })
  );
  
  // Copy .nojekyll file for GitHub Pages
  const rootDir = join(__dirname, '..');
  const nojekyllSource = join(rootDir, '.nojekyll');
  const nojekyllDest = join(OUTPUT_DIR, '.nojekyll');
  await copyFile(nojekyllSource, nojekyllDest);
  
  console.log(`✓ Copied ${files.length} frontend files to ${OUTPUT_DIR}`);
  console.log('✓ Copied .nojekyll file for GitHub Pages');
}

build();
