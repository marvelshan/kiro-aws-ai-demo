import { mkdir, writeFile, copyFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { scanMarkdownFiles } from './scanner.js';
import { parseArticleMetadata } from './parser.js';

/**
 * Generates the article list and copies files to the distribution directory
 * @param {string} sourceDir - Source directory containing markdown files
 * @param {string} outputDir - Output directory for the generated files
 * @returns {Promise<Object>} Generated article list
 */
export async function generateArticleList(sourceDir, outputDir) {
  try {
    // Scan for markdown files
    const markdownFiles = await scanMarkdownFiles(sourceDir);
    
    // Parse metadata from each file
    const articles = await Promise.all(
      markdownFiles.map(filePath => parseArticleMetadata(filePath))
    );
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    // Create the article list object
    const articleList = {
      articles
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
    
    // Copy markdown files to output directory
    await Promise.all(
      markdownFiles.map(async (filePath) => {
        const filename = basename(filePath);
        const destPath = join(articlesOutputDir, filename);
        await copyFile(filePath, destPath);
      })
    );
    
    console.log(`✓ Generated article list with ${articles.length} articles`);
    console.log(`✓ Copied ${markdownFiles.length} markdown files to ${articlesOutputDir}`);
    
    return articleList;
  } catch (error) {
    console.error('Error generating article list:', error.message);
    throw error;
  }
}
