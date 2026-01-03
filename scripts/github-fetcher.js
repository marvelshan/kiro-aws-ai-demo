import matter from 'gray-matter';
import https from 'https';

/**
 * Simple fetch implementation using Node.js https module
 * @param {string} url - URL to fetch
 * @param {Object} options - Request options
 * @returns {Promise<Response>} Response object
 */
function nodeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const request = https.request(requestOptions, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          statusText: response.statusMessage,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.end();
  });
}

/**
 * GitHub Content Fetcher
 * Fetches markdown files from a specified GitHub repository
 */
export class GitHubContentFetcher {
  constructor(owner, repo, token = null) {
    this.owner = owner;
    this.repo = repo;
    this.token = token || process.env.GITHUB_TOKEN;
    this.apiBase = 'https://api.github.com';
    this.rawBase = 'https://raw.githubusercontent.com';
  }

  /**
   * Fetch repository contents recursively
   * @param {string} path - Path within repo (default: root)
   * @returns {Promise<Array>} Array of markdown files with metadata
   */
  async fetchMarkdownFiles(path = '') {
    const url = `${this.apiBase}/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    try {
      console.log(`Fetching from: ${url}`);
      
      const headers = {
        'User-Agent': 'GitHub-Content-Fetcher/1.0'
      };
      
      if (this.token) {
        headers['Authorization'] = `token ${this.token}`;
      }
      
      const response = await nodeFetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository ${this.owner}/${this.repo} not found or path does not exist`);
        } else if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const contents = await response.json();
      console.log(`Found ${contents.length} items in ${path || 'root'}`);
      const markdownFiles = [];

      for (const item of contents) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          console.log(`Processing markdown file: ${item.name}`);
          // Fetch the content and parse metadata
          const fileData = await this.fetchAndParseMarkdownFile(item);
          if (fileData) {
            markdownFiles.push(fileData);
          }
        } else if (item.type === 'dir') {
          console.log(`Scanning directory: ${item.name}`);
          // Recursively fetch directory contents
          const subFiles = await this.fetchMarkdownFiles(item.path);
          markdownFiles.push(...subFiles);
        }
      }

      return markdownFiles;
    } catch (error) {
      console.error(`Error fetching repo contents from ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch and parse a single markdown file
   * @param {Object} fileItem - File item from GitHub API
   * @returns {Promise<Object|null>} Parsed file data or null if error
   */
  async fetchAndParseMarkdownFile(fileItem) {
    try {
      const response = await nodeFetch(fileItem.download_url);
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${fileItem.name}: ${response.status}`);
        return null;
      }

      const content = await response.text();
      const parsed = matter(content);
      
      // Generate metadata similar to local parser
      const metadata = this.generateArticleMetadata(fileItem, parsed);
      
      return {
        ...metadata,
        content: parsed.content,
        rawContent: content,
        githubPath: fileItem.path,
        downloadUrl: fileItem.download_url
      };
    } catch (error) {
      console.warn(`Error processing ${fileItem.name}:`, error.message);
      return null;
    }
  }

  /**
   * Generate article metadata from GitHub file and parsed content
   * @param {Object} fileItem - File item from GitHub API
   * @param {Object} parsed - Parsed content from gray-matter
   * @returns {Object} Article metadata
   */
  generateArticleMetadata(fileItem, parsed) {
    const { data: frontmatter } = parsed;
    
    // Generate ID from filename
    const id = this.generateId(fileItem.name);
    
    // Extract title from frontmatter or generate from filename
    const title = frontmatter.title || this.generateTitleFromFilename(fileItem.name);
    
    // Extract date from frontmatter or use current date
    const date = frontmatter.date ? this.formatDate(frontmatter.date) : new Date().toISOString().split('T')[0];
    
    const metadata = {
      id,
      title,
      date,
      filename: fileItem.name
    };
    
    // Add optional fields if present
    if (frontmatter.description) {
      metadata.description = frontmatter.description;
    }
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
      metadata.tags = frontmatter.tags;
    }
    
    return metadata;
  }

  /**
   * Generates an ID from the filename
   * @param {string} filename - Filename
   * @returns {string} Generated ID
   */
  generateId(filename) {
    return filename
      .replace(/\.md$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generates a title from the filename
   * @param {string} filename - Filename
   * @returns {string} Generated title
   */
  generateTitleFromFilename(filename) {
    return filename
      .replace(/\.md$/, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Formats a date to ISO 8601 format (YYYY-MM-DD)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
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

  /**
   * Fetch all articles from the repository
   * @returns {Promise<Array>} Array of article objects
   */
  async fetchAllArticles() {
    console.log(`Fetching articles from ${this.owner}/${this.repo}...`);
    
    const articles = await this.fetchMarkdownFiles();
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    console.log(`✓ Fetched ${articles.length} articles from GitHub repository`);
    
    return articles;
  }
}