/**
 * GitHub Repository Importer
 * Fetches markdown files from a GitHub repository and displays them
 */

class GitHubImporter {
    constructor() {
        this.apiBase = 'https://api.github.com';
        this.rawBase = 'https://raw.githubusercontent.com';
    }

    /**
     * Parse GitHub repo URL to extract owner and repo name
     * @param {string} url - GitHub repo URL
     * @returns {Object|null} {owner, repo} or null if invalid
     */
    parseRepoUrl(url) {
        // Support various GitHub URL formats
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/]+)/,  // https://github.com/owner/repo
            /^([^\/]+)\/([^\/]+)$/               // owner/repo
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
                };
            }
        }

        return null;
    }

    /**
     * Fetch repository contents recursively
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {string} path - Path within repo (default: root)
     * @returns {Promise<Array>} Array of markdown files
     */
    async fetchRepoContents(owner, repo, path = '') {
        const url = `${this.apiBase}/repos/${owner}/${repo}/contents/${path}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository not found or path does not exist');
                } else if (response.status === 403) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const contents = await response.json();
            const markdownFiles = [];

            for (const item of contents) {
                if (item.type === 'file' && item.name.endsWith('.md')) {
                    // It's a markdown file
                    markdownFiles.push({
                        name: item.name,
                        path: item.path,
                        download_url: item.download_url,
                        size: item.size
                    });
                } else if (item.type === 'dir') {
                    // Recursively fetch directory contents
                    const subFiles = await this.fetchRepoContents(owner, repo, item.path);
                    markdownFiles.push(...subFiles);
                }
            }

            return markdownFiles;
        } catch (error) {
            console.error('Error fetching repo contents:', error);
            throw error;
        }
    }

    /**
     * Fetch markdown file content
     * @param {string} downloadUrl - Raw content URL
     * @returns {Promise<string>} Markdown content
     */
    async fetchMarkdownContent(downloadUrl) {
        try {
            const response = await fetch(downloadUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch markdown: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error('Error fetching markdown content:', error);
            throw error;
        }
    }

    /**
     * Extract frontmatter and content from markdown
     * @param {string} markdown - Raw markdown content
     * @returns {Object} {frontmatter, content}
     */
    parseFrontmatter(markdown) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);

        if (match) {
            const frontmatterText = match[1];
            const content = match[2];
            
            // Simple YAML parser for common fields
            const frontmatter = {};
            const lines = frontmatterText.split('\n');
            
            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                    frontmatter[key] = value;
                }
            }

            return { frontmatter, content };
        }

        // No frontmatter found
        return { frontmatter: {}, content: markdown };
    }

    /**
     * Generate article metadata from markdown file
     * @param {Object} file - File object from GitHub API
     * @param {string} markdown - Markdown content
     * @returns {Object} Article metadata
     */
    generateArticleMetadata(file, markdown) {
        const { frontmatter, content } = this.parseFrontmatter(markdown);
        
        // Generate ID from filename
        const id = file.name
            .replace(/\.md$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Extract title from frontmatter or filename or first heading
        let title = frontmatter.title;
        
        if (!title) {
            // Try to extract from first heading
            const headingMatch = content.match(/^#\s+(.+)$/m);
            if (headingMatch) {
                title = headingMatch[1];
            } else {
                // Use filename as fallback
                title = file.name.replace(/\.md$/, '').replace(/-|_/g, ' ');
            }
        }

        // Extract date from frontmatter or use current date
        const date = frontmatter.date || new Date().toISOString().split('T')[0];

        // Extract description
        const description = frontmatter.description || '';

        // Extract tags
        const tags = frontmatter.tags ? frontmatter.tags.split(',').map(t => t.trim()) : [];

        return {
            id,
            title,
            date,
            description,
            tags,
            filename: file.name,
            path: file.path,
            content: content,
            downloadUrl: file.download_url
        };
    }

    /**
     * Import all markdown files from a GitHub repository
     * @param {string} repoUrl - GitHub repository URL
     * @returns {Promise<Array>} Array of article objects with metadata and content
     */
    async importRepository(repoUrl) {
        const repoInfo = this.parseRepoUrl(repoUrl);
        
        if (!repoInfo) {
            throw new Error('Invalid GitHub repository URL');
        }

        const { owner, repo } = repoInfo;

        // Fetch all markdown files
        const files = await this.fetchRepoContents(owner, repo);

        if (files.length === 0) {
            throw new Error('No markdown files found in repository');
        }

        // Fetch content for each file and generate metadata
        const articles = [];
        
        for (const file of files) {
            try {
                const markdown = await this.fetchMarkdownContent(file.download_url);
                const article = this.generateArticleMetadata(file, markdown);
                articles.push(article);
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                // Continue with other files
            }
        }

        // Sort by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        return articles;
    }
}

export default GitHubImporter;
