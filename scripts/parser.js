import { readFile, stat } from 'fs/promises';
import { basename, extname } from 'path';
import matter from 'gray-matter';

/**
 * Parses frontmatter from a markdown file
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<Object>} Article metadata
 */
export async function parseArticleMetadata(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const parsed = matter(content);
    
    // Check if frontmatter exists and has required fields
    if (parsed.data && Object.keys(parsed.data).length > 0) {
      const { title, date, description, tags } = parsed.data;
      
      // Use frontmatter data if available
      const metadata = {
        id: generateId(filePath),
        title: title || generateTitleFromFilename(filePath),
        date: date ? formatDate(date) : await getFileModificationDate(filePath),
        filename: basename(filePath),
      };
      
      // Add optional fields if present
      if (description) {
        metadata.description = description;
      }
      if (tags && Array.isArray(tags)) {
        metadata.tags = tags;
      }
      
      return metadata;
    } else {
      // Fallback: use filename and file modification time
      return {
        id: generateId(filePath),
        title: generateTitleFromFilename(filePath),
        date: await getFileModificationDate(filePath),
        filename: basename(filePath),
      };
    }
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Generates an ID from the file path
 * @param {string} filePath - Path to the file
 * @returns {string} Generated ID
 */
function generateId(filePath) {
  const filename = basename(filePath, extname(filePath));
  return filename.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generates a title from the filename
 * @param {string} filePath - Path to the file
 * @returns {string} Generated title
 */
function generateTitleFromFilename(filePath) {
  const filename = basename(filePath, extname(filePath));
  // Convert kebab-case or snake_case to Title Case
  return filename
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gets the file modification date
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} ISO 8601 formatted date
 */
async function getFileModificationDate(filePath) {
  const stats = await stat(filePath);
  return stats.mtime.toISOString().split('T')[0];
}

/**
 * Formats a date to ISO 8601 format (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  // If it's already a string, try to parse and format it
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  // If parsing fails, return as-is
  return date;
}
