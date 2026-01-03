/**
 * Main application entry point
 * Initializes router and sets up basic application structure
 */

import Router from './router.js';
import ArticleSearch from './search.js';
import GitHubImporter from './github-importer.js';

// Initialize router
const router = new Router();

// Initialize search and GitHub importer
const articleSearch = new ArticleSearch();
const githubImporter = new GitHubImporter();

// Store current articles (from local or GitHub)
let currentArticles = [];
let isGitHubMode = false;

// Default GitHub repository
const DEFAULT_GITHUB_REPO = 'marvelshan/tech-forum';

/**
 * Error logger utility
 * Logs errors to console with timestamp and context
 * Requirements: 7.5
 */
class ErrorLogger {
    /**
     * Log an error with context
     * @param {string} context - Context where error occurred
     * @param {Error} error - Error object
     * @param {Object} additionalInfo - Additional information
     */
    static log(context, error, additionalInfo = {}) {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            message: error.message,
            stack: error.stack,
            ...additionalInfo
        };
        
        console.error(`[${timestamp}] Error in ${context}:`, errorInfo);
        
        return errorInfo;
    }
    
    /**
     * Log a network error
     * @param {string} url - URL that failed
     * @param {Error} error - Error object
     * @param {number} status - HTTP status code if available
     */
    static logNetworkError(url, error, status = null) {
        return this.log('Network Request', error, {
            url,
            status,
            type: 'network'
        });
    }
    
    /**
     * Log a parse error
     * @param {string} contentType - Type of content being parsed
     * @param {Error} error - Error object
     */
    static logParseError(contentType, error) {
        return this.log('Content Parsing', error, {
            contentType,
            type: 'parse'
        });
    }
    
    /**
     * Log a not found error
     * @param {string} resourceType - Type of resource not found
     * @param {string} resourceId - ID of resource
     */
    static logNotFound(resourceType, resourceId) {
        const error = new Error(`${resourceType} not found: ${resourceId}`);
        return this.log('Resource Not Found', error, {
            resourceType,
            resourceId,
            type: 'not_found'
        });
    }
}

/**
 * Handle article list route
 * Fetches articles/list.json and renders the article list
 * Requirements: 1.1, 1.2, 1.4
 */
async function handleArticleList(params) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">載入文章列表中...</div>';
    
    console.log('handleArticleList called');
    console.log('isGitHubMode:', isGitHubMode);
    console.log('currentArticles.length:', currentArticles.length);
    
    try {
        // Use GitHub articles if in GitHub mode, otherwise try to load from GitHub first
        if (isGitHubMode && currentArticles.length > 0) {
            console.log('Using GitHub articles:', currentArticles.length);
            articleSearch.initialize(currentArticles);
            renderArticleList(currentArticles);
        } else {
            // Try to load from default GitHub repository first
            console.log('Attempting to load from default GitHub repository');
            try {
                const articles = await githubImporter.importRepository(DEFAULT_GITHUB_REPO);
                currentArticles = articles;
                isGitHubMode = true;
                
                console.log(`Loaded ${articles.length} articles from GitHub`);
                articleSearch.initialize(articles);
                renderArticleList(articles);
            } catch (githubError) {
                console.warn('GitHub fetch failed, falling back to local articles:', githubError.message);
                
                // Fallback to local articles
                console.log('Fetching local articles');
                const response = await fetch('articles/list.json');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const articles = data.articles || [];
                currentArticles = articles;
                isGitHubMode = false;
                
                // Initialize search with articles
                articleSearch.initialize(articles);
                
                // Render article list
                renderArticleList(articles);
            }
        }
        
    } catch (error) {
        ErrorLogger.logNetworkError('articles/list.json', error);
        renderArticleListError(error);
    }
}

/**
 * Render the article list
 * @param {Array} articles - Array of article metadata objects
 */
function renderArticleList(articles) {
    console.log('renderArticleList called with', articles.length, 'articles');
    const content = document.getElementById('content');
    
    // Handle empty state
    if (!articles || articles.length === 0) {
        console.log('No articles to display');
        const emptyTemplate = document.getElementById('empty-state-template');
        const clone = emptyTemplate.content.cloneNode(true);
        
        // Update empty state message based on mode
        const emptyTitle = clone.querySelector('h2');
        const emptyText = clone.querySelector('p');
        
        if (isGitHubMode) {
            emptyTitle.textContent = '目前還沒有文章';
            emptyText.textContent = '從 GitHub repository 未找到任何 markdown 文章';
        } else {
            emptyTitle.textContent = '目前還沒有文章';
            emptyText.textContent = '敬請期待更多精彩內容';
        }
        
        content.innerHTML = '';
        content.appendChild(clone);
        return;
    }
    
    console.log('Rendering articles:', articles.map(a => a.title));
    
    // Get article list template
    const listTemplate = document.getElementById('article-list-template');
    const listClone = listTemplate.content.cloneNode(true);
    
    // Update page title based on mode
    const pageTitle = listClone.querySelector('.page-title');
    if (isGitHubMode) {
        pageTitle.textContent = `所有文章 (來自 GitHub)`;
    } else {
        pageTitle.textContent = '所有文章';
    }
    
    const articlesContainer = listClone.getElementById('articles-container');
    
    // Render each article
    articles.forEach(article => {
        const itemTemplate = document.getElementById('article-item-template');
        const itemClone = itemTemplate.content.cloneNode(true);
        
        // Set article title and link
        const link = itemClone.querySelector('.article-link');
        link.textContent = article.title;
        link.href = `#/article/${article.id}`;
        
        // Add click handler for navigation
        link.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigateToArticle(article.id);
        });
        
        // Set article date
        const dateElement = itemClone.querySelector('.article-date');
        dateElement.textContent = formatDisplayDate(article.date);
        dateElement.setAttribute('datetime', article.date);
        
        articlesContainer.appendChild(itemClone);
    });
    
    // Replace content
    content.innerHTML = '';
    content.appendChild(listClone);
}

/**
 * Render error state for article list
 * Requirements: 7.2, 7.5
 * @param {Error} error - Error object
 */
function renderArticleListError(error) {
    const content = document.getElementById('content');
    const template = document.getElementById('error-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.error-title').textContent = '載入失敗';
    clone.querySelector('.error-text').textContent = '無法載入文章列表，請檢查網路連線';
    
    // Show retry button
    const retryButton = clone.querySelector('.retry-button');
    retryButton.style.display = 'inline-block';
    retryButton.addEventListener('click', () => {
        ErrorLogger.log('User Action', new Error('Retry button clicked'), {
            action: 'retry',
            context: 'article-list'
        });
        handleArticleList({});
    });
    
    content.innerHTML = '';
    content.appendChild(clone);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDisplayDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Handle article detail route
 * Loads markdown file and renders article detail
 * Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2
 */
async function handleArticleDetail(params) {
    const content = document.getElementById('content');
    content.innerHTML = `<div class="loading">載入文章中...</div>`;
    
    console.log('handleArticleDetail called for:', params.id);
    console.log('isGitHubMode:', isGitHubMode);
    
    try {
        let article;
        let markdownContent;
        
        // Check if we're in GitHub mode and have the article in memory
        if (isGitHubMode && currentArticles.length > 0) {
            console.log('Looking for article in GitHub articles');
            article = currentArticles.find(a => a.id === params.id);
            
            if (!article) {
                ErrorLogger.logNotFound('Article', params.id);
                renderArticleNotFound(params.id);
                return;
            }
            
            // GitHub articles already have content
            markdownContent = article.content;
            console.log('Found GitHub article:', article.title);
        } else {
            console.log('Loading article from local files');
            // Load article metadata from list.json to get filename
            const listResponse = await fetch('articles/list.json');
            if (!listResponse.ok) {
                throw new Error('Failed to load article list');
            }
            
            const listData = await listResponse.json();
            article = listData.articles.find(a => a.id === params.id);
            
            if (!article) {
                // Article not found in list
                ErrorLogger.logNotFound('Article', params.id);
                renderArticleNotFound(params.id);
                return;
            }
            
            // Fetch markdown file from S3/dist
            const markdownResponse = await fetch(`articles/${article.filename}`);
            
            if (!markdownResponse.ok) {
                if (markdownResponse.status === 404) {
                    ErrorLogger.logNotFound('Article File', article.filename);
                    renderArticleNotFound(params.id);
                    return;
                }
                throw new Error(`HTTP error! status: ${markdownResponse.status}`);
            }
            
            markdownContent = await markdownResponse.text();
        }
        
        // Parse markdown to HTML
        const htmlContent = parseMarkdown(markdownContent);
        
        // Render article detail
        renderArticleDetail(article, htmlContent);
        
    } catch (error) {
        ErrorLogger.logNetworkError(`articles/${params.id}`, error);
        renderArticleDetailError(error, params.id);
    }
}

/**
 * Parse markdown content to HTML
 * Uses marked.js with highlight.js for code syntax highlighting
 * Requirements: 2.2, 2.3, 3.1, 3.2, 3.3, 3.4
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
function parseMarkdown(markdown) {
    try {
        // Configure marked with highlight.js
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.error('Highlight error:', err);
                        }
                    }
                    return code;
                },
                breaks: true,
                gfm: true
            });
            
            return marked.parse(markdown);
        } else {
            ErrorLogger.log('Dependency Missing', new Error('marked.js not loaded'), {
                library: 'marked.js'
            });
            return `<pre>${escapeHtml(markdown)}</pre>`;
        }
    } catch (error) {
        ErrorLogger.logParseError('Markdown', error);
        throw new Error('文章格式解析失敗');
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Render article detail view
 * Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2
 * @param {Object} article - Article metadata
 * @param {string} htmlContent - Parsed HTML content
 */
function renderArticleDetail(article, htmlContent) {
    const content = document.getElementById('content');
    const template = document.getElementById('article-detail-template');
    const clone = template.content.cloneNode(true);
    
    // Set article title
    clone.querySelector('.article-title').textContent = article.title;
    
    // Set article date
    const dateElement = clone.querySelector('.article-date');
    dateElement.textContent = formatDisplayDate(article.date);
    dateElement.setAttribute('datetime', article.date);
    
    // Set article content
    clone.querySelector('.article-content').innerHTML = htmlContent;
    
    // Set up back navigation
    const backLink = clone.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateHome();
    });
    
    // Replace content
    content.innerHTML = '';
    content.appendChild(clone);
    
    // Apply syntax highlighting to code blocks
    if (typeof hljs !== 'undefined') {
        content.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
    
    // Add copy buttons to code blocks
    addCopyButtonsToCodeBlocks();
}

/**
 * Add copy buttons to all code blocks
 */
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.article-content pre');
    
    codeBlocks.forEach((pre) => {
        // Skip if button already exists
        if (pre.querySelector('.copy-button')) {
            return;
        }
        
        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 2.5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M3.5 5.5h-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
            <span class="copy-text">複製</span>
        `;
        button.setAttribute('aria-label', '複製程式碼');
        
        // Add click handler
        button.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            const text = code.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                
                // Show success feedback
                button.classList.add('copied');
                const textSpan = button.querySelector('.copy-text');
                textSpan.textContent = '已複製！';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.classList.remove('copied');
                    textSpan.textContent = '複製';
                }, 2000);
                
            } catch (err) {
                console.error('Failed to copy:', err);
                
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    button.classList.add('copied');
                    const textSpan = button.querySelector('.copy-text');
                    textSpan.textContent = '已複製！';
                    
                    setTimeout(() => {
                        button.classList.remove('copied');
                        textSpan.textContent = '複製';
                    }, 2000);
                } catch (err2) {
                    console.error('Fallback copy failed:', err2);
                }
                
                document.body.removeChild(textArea);
            }
        });
        
        // Add button to pre element
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

/**
 * Render article not found (404) page
 * Requirements: 7.1
 * @param {string} articleId - Article ID that was not found
 */
function renderArticleNotFound(articleId) {
    const content = document.getElementById('content');
    const template = document.getElementById('error-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.error-title').textContent = '找不到此文章';
    clone.querySelector('.error-text').textContent = '此文章可能已被移除或不存在';
    
    // Add back to home link
    const backLink = clone.querySelector('.back-link');
    backLink.style.display = 'inline-block';
    
    content.innerHTML = '';
    content.appendChild(clone);
}

/**
 * Render error state for article detail
 * Requirements: 7.2, 7.5
 * @param {Error} error - Error object
 * @param {string} articleId - Article ID that failed to load
 */
function renderArticleDetailError(error, articleId) {
    const content = document.getElementById('content');
    const template = document.getElementById('error-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.error-title').textContent = '載入失敗';
    clone.querySelector('.error-text').textContent = error.message || '無法載入文章，請檢查網路連線';
    
    // Show retry button
    const retryButton = clone.querySelector('.retry-button');
    retryButton.style.display = 'inline-block';
    retryButton.addEventListener('click', () => {
        ErrorLogger.log('User Action', new Error('Retry button clicked'), {
            action: 'retry',
            context: 'article-detail',
            articleId
        });
        // Reload current route
        router.handleRouteChange();
    });
    
    content.innerHTML = '';
    content.appendChild(clone);
}

/**
 * Handle 404 not found route
 * Requirements: 7.1
 */
function handleNotFound() {
    const content = document.getElementById('content');
    const template = document.getElementById('error-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.error-title').textContent = '404 - 找不到頁面';
    clone.querySelector('.error-text').textContent = '您訪問的頁面不存在';
    
    // Show back to home link
    const backLink = clone.querySelector('.back-link');
    backLink.style.display = 'inline-block';
    
    content.innerHTML = '';
    content.appendChild(clone);
    
    ErrorLogger.log('Route Not Found', new Error('404 - Route not found'), {
        path: window.location.hash
    });
}

// Register routes
router.addRoute('/', handleArticleList);
router.addRoute('/article/:id', handleArticleDetail);
router.setNotFoundHandler(handleNotFound);

// Global error handler for uncaught errors
// Requirements: 7.3, 7.5
window.addEventListener('error', (event) => {
    ErrorLogger.log('Uncaught Error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Global handler for unhandled promise rejections
// Requirements: 7.4, 7.5
window.addEventListener('unhandledrejection', (event) => {
    ErrorLogger.log('Unhandled Promise Rejection', new Error(event.reason), {
        promise: event.promise
    });
});

// ===== Search Functionality =====

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show/hide clear button
        if (query) {
            searchClear.style.display = 'block';
        } else {
            searchClear.style.display = 'none';
        }
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Handle clear button
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        performSearch('');
    });
    
    // Handle Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

/**
 * Perform search and update article list
 * @param {string} query - Search query
 */
function performSearch(query) {
    const results = articleSearch.search(query);
    renderArticleList(results);
    
    // Update page title to show search results
    const content = document.getElementById('content');
    const pageTitle = content.querySelector('.page-title');
    if (pageTitle) {
        if (query) {
            const source = isGitHubMode ? ' (來自 GitHub)' : '';
            pageTitle.textContent = `搜尋結果: "${query}" (${results.length} 篇文章)${source}`;
        } else {
            const source = isGitHubMode ? ' (來自 GitHub)' : '';
            pageTitle.textContent = `所有文章${source}`;
        }
    }
}

// ===== GitHub Import Functionality =====

/**
 * Initialize GitHub import functionality
 */
function initializeGitHubImport() {
    console.log('Initializing GitHub import...');
    
    const importBtn = document.getElementById('github-import-btn');
    const modal = document.getElementById('github-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('import-cancel-btn');
    const fetchBtn = document.getElementById('import-fetch-btn');
    const confirmBtn = document.getElementById('import-confirm-btn');
    const urlInput = document.getElementById('github-url-input');
    
    console.log('Elements found:', {
        importBtn: !!importBtn,
        modal: !!modal,
        closeBtn: !!closeBtn,
        cancelBtn: !!cancelBtn,
        fetchBtn: !!fetchBtn,
        confirmBtn: !!confirmBtn,
        urlInput: !!urlInput
    });
    
    if (!importBtn || !modal) {
        console.error('Required elements not found!');
        return;
    }
    
    let fetchedArticles = [];
    
    // Open modal
    importBtn.addEventListener('click', () => {
        console.log('Import button clicked!');
        modal.style.display = 'flex';
        urlInput.focus();
    });
    
    console.log('GitHub import initialized successfully');
    
    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
        urlInput.value = '';
        document.getElementById('import-status').style.display = 'none';
        document.getElementById('import-preview').style.display = 'none';
        confirmBtn.style.display = 'none';
        fetchBtn.style.display = 'inline-block';
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fetch articles from GitHub
    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            showImportStatus('請輸入 GitHub repository URL', 'error');
            return;
        }
        
        showImportStatus('正在讀取 repository...', 'loading');
        fetchBtn.disabled = true;
        
        try {
            fetchedArticles = await githubImporter.importRepository(url);
            
            if (fetchedArticles.length === 0) {
                showImportStatus('未找到任何 markdown 檔案', 'error');
                fetchBtn.disabled = false;
                return;
            }
            
            // Show preview
            showImportPreview(fetchedArticles);
            showImportStatus(`成功讀取 ${fetchedArticles.length} 篇文章`, 'success');
            
            // Show confirm button
            fetchBtn.style.display = 'none';
            confirmBtn.style.display = 'inline-block';
            
        } catch (error) {
            showImportStatus(`錯誤: ${error.message}`, 'error');
            fetchBtn.disabled = false;
        }
    });
    
    // Confirm import
    confirmBtn.addEventListener('click', () => {
        console.log('Confirm import clicked, articles:', fetchedArticles.length);
        
        // Update current articles with GitHub articles
        currentArticles = fetchedArticles;
        isGitHubMode = true;
        
        console.log('Updated currentArticles:', currentArticles.length);
        console.log('isGitHubMode:', isGitHubMode);
        
        // Initialize search with new articles
        articleSearch.initialize(currentArticles);
        
        // Close modal
        closeModal();
        
        // Navigate to home and trigger article list rendering
        router.navigateHome();
        
        // Show success message
        setTimeout(() => {
            alert(`成功導入 ${fetchedArticles.length} 篇文章！`);
        }, 100);
    });
}

/**
 * Show import status message
 * @param {string} message - Status message
 * @param {string} type - Message type (loading, success, error)
 */
function showImportStatus(message, type) {
    const statusDiv = document.getElementById('import-status');
    statusDiv.textContent = message;
    statusDiv.className = `import-status ${type}`;
    statusDiv.style.display = 'block';
}

/**
 * Show preview of imported articles
 * @param {Array} articles - Array of article objects
 */
function showImportPreview(articles) {
    const previewDiv = document.getElementById('import-preview');
    const previewList = document.getElementById('preview-list');
    const articleCount = document.getElementById('article-count');
    
    articleCount.textContent = articles.length;
    
    // Clear previous preview
    previewList.innerHTML = '';
    
    // Show first 10 articles as preview
    const previewArticles = articles.slice(0, 10);
    
    previewArticles.forEach(article => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <div class="preview-title">${escapeHtml(article.title)}</div>
            <div class="preview-meta">
                <span class="preview-date">${article.date}</span>
                ${article.tags && article.tags.length > 0 ? 
                    `<span class="preview-tags">${article.tags.map(t => `#${t}`).join(' ')}</span>` : 
                    ''}
            </div>
        `;
        previewList.appendChild(item);
    });
    
    if (articles.length > 10) {
        const more = document.createElement('div');
        more.className = 'preview-more';
        more.textContent = `... 還有 ${articles.length - 10} 篇文章`;
        previewList.appendChild(more);
    }
    
    previewDiv.style.display = 'block';
}

// Initialize search and GitHub import when DOM is ready
function initializeApp() {
    initializeSearch();
    initializeGitHubImport();
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded, initialize immediately
    initializeApp();
}

// Export router for use in other modules
export { router, ErrorLogger, articleSearch, githubImporter };

// Make router available globally for debugging
window.router = router;
