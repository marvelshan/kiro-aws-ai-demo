import { generateArticleList } from './generator.js';
import { GitHubContentFetcher } from './github-fetcher.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { copyFile, mkdir, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, '..', 'articles');
const OUTPUT_DIR = join(__dirname, '..', 'dist');
const FRONTEND_DIR = join(__dirname, '..', 'frontend');

// GitHub repository configuration
const GITHUB_OWNER = 'marvelshan';
const GITHUB_REPO = 'tech-forum';

async function build() {
  try {
    console.log('Building article list...');
    
    // Check if we should use GitHub content or local content
    const useGitHub = process.env.USE_GITHUB !== 'false'; // Default to true
    
    if (useGitHub) {
      console.log(`Fetching articles from GitHub repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
      try {
        await generateGitHubArticleList(OUTPUT_DIR);
      } catch (error) {
        console.warn('GitHub fetch failed, falling back to local articles:', error.message);
        console.log('Using local articles directory as fallback');
        await generateArticleList(SOURCE_DIR, OUTPUT_DIR);
      }
    } else {
      console.log('Using local articles directory');
      await generateArticleList(SOURCE_DIR, OUTPUT_DIR);
    }
    
    console.log('Copying frontend files...');
    await copyFrontendFiles();
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

/**
 * Generate article list from GitHub repository content
 * @param {string} outputDir - Output directory for the generated files
 * @returns {Promise<Object>} Generated article list
 */
async function generateGitHubArticleList(outputDir) {
  try {
    const fetcher = new GitHubContentFetcher(GITHUB_OWNER, GITHUB_REPO);
    const articles = await fetcher.fetchAllArticles();
    
    // Create the article list object (metadata only for list.json)
    const articleList = {
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        date: article.date,
        description: article.description,
        tags: article.tags,
        filename: article.filename
      }))
    };
    
    // Ensure output directories exist
    const articlesOutputDir = join(outputDir, 'articles');
    await mkdir(articlesOutputDir, { recursive: true });
    
    // Write list.json
    const listJsonPath = join(articlesOutputDir, 'list.json');
    await writeFile(
      listJsonPath,
      JSON.stringify(articleList, null, 2),
      'utf-8'
    );
    
    // Cache markdown files to output directory
    await Promise.all(
      articles.map(async (article) => {
        const destPath = join(articlesOutputDir, article.filename);
        await writeFile(destPath, article.rawContent, 'utf-8');
      })
    );
    
    console.log(`✓ Generated article list with ${articles.length} articles from GitHub`);
    console.log(`✓ Cached ${articles.length} markdown files to ${articlesOutputDir}`);
    
    return articleList;
  } catch (error) {
    console.error('Error generating GitHub article list:', error.message);
    throw error;
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
