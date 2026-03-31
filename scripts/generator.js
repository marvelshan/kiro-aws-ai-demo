import { mkdir, writeFile, copyFile, readFile } from 'fs/promises';
import { join, dirname, basename, relative } from 'path';
import { scanMarkdownFiles } from './scanner.js';
import { parseArticleMetadata } from './parser.js';

/**
 * Estimate reading time in minutes from markdown text
 * Chinese ~300 chars/min, English ~200 words/min
 */
function estimateReadingTime(text) {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(chineseChars / 300 + words / 200));
}

/**
 * Generates the article list and copies files to the distribution directory
 * @param {string} sourceDir - Source directory containing markdown files
 * @param {string} outputDir - Output directory for the generated files
 * @returns {Promise<Object>} Generated article list
 */
export async function generateArticleList(sourceDir, outputDir) {
  try {
    const markdownFiles = await scanMarkdownFiles(sourceDir);

    // Parse metadata, passing sourceDir so folder is computed correctly
    const articles = await Promise.all(
      markdownFiles.map(async filePath => {
        const meta = await parseArticleMetadata(filePath, sourceDir);
        const content = await readFile(filePath, 'utf-8');
        meta.readTime = estimateReadingTime(content);
        return meta;
      })
    );

    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const articleList = { articles };

    const articlesOutputDir = join(outputDir, 'articles');
    await mkdir(articlesOutputDir, { recursive: true });

    // Write list.json
    await writeFile(
      join(articlesOutputDir, 'list.json'),
      JSON.stringify(articleList, null, 2),
      'utf-8'
    );

    // Copy markdown files preserving sub-directory structure
    await Promise.all(
      markdownFiles.map(async (filePath) => {
        const rel = relative(sourceDir, filePath);
        const destPath = join(articlesOutputDir, rel);
        await mkdir(dirname(destPath), { recursive: true });
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
