import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

/**
 * Recursively scans a directory for markdown files
 * @param {string} dirPath - Directory path to scan
 * @returns {Promise<string[]>} Array of markdown file paths
 */
export async function scanMarkdownFiles(dirPath) {
  const files = [];
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      // Skip hidden files (starting with .)
      if (entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Check if file has .md extension
        if (extname(entry.name).toLowerCase() === '.md') {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    throw error;
  }
  
  return files;
}
