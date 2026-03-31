/**
 * Main application entry point
 */

import Router from './router.js';
import ArticleSearch from './search.js';

const router = new Router();
const articleSearch = new ArticleSearch();

let currentArticles = [];
let activeFolder = '/'; // currently selected folder

// ===== View Count (localStorage) =====

function getViewKey(articleId) {
    return `views_${articleId}`;
}

function getViewCount(articleId) {
    return parseInt(localStorage.getItem(getViewKey(articleId)) || '0', 10);
}

function incrementViewCount(articleId) {
    const count = getViewCount(articleId) + 1;
    localStorage.setItem(getViewKey(articleId), count);
    return count;
}

// ===== Date Formatting =====

function formatDisplayDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

// ===== Reading Time =====

function estimateReadingTime(text) {
    // Average Chinese reading speed ~300 chars/min, English ~200 words/min
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const words = text.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(chineseChars / 300 + words / 200);
    return Math.max(1, minutes);
}

// ===== Folder Tree =====

/**
 * Build a nested folder structure from flat article list
 * Returns { '/': [...], 'question': [...], ... }
 */
function buildFolderMap(articles) {
    const map = {};
    for (const article of articles) {
        const folder = article.folder || '/';
        if (!map[folder]) map[folder] = [];
        map[folder].push(article);
    }
    return map;
}

/**
 * Render the folder sidebar tree
 */
function renderFolderTree(folderMap, container) {
    container.innerHTML = '';

    // Sort: root first, then alphabetically
    const folders = Object.keys(folderMap).sort((a, b) => {
        if (a === '/') return -1;
        if (b === '/') return 1;
        return a.localeCompare(b);
    });

    for (const folder of folders) {
        const count = folderMap[folder].length;
        const label = folder === '/' ? '📂 根目錄' : `📁 ${folder}`;

        const item = document.createElement('div');
        item.className = 'folder-item' + (folder === activeFolder ? ' active' : '');
        item.innerHTML = `<span class="folder-name">${label}</span><span class="folder-count">${count}</span>`;
        item.addEventListener('click', () => {
            activeFolder = folder;
            // Re-render with filtered articles
            const filtered = folderMap[folder];
            renderArticleList(filtered, folderMap);
        });
        container.appendChild(item);
    }
}

// ===== Article List =====

async function handleArticleList() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">載入文章列表中...</div>';

    try {
        const response = await fetch('articles/list.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        currentArticles = data.articles || [];
        articleSearch.initialize(currentArticles);
        renderArticleList(currentArticles, buildFolderMap(currentArticles));
    } catch (error) {
        renderError('載入失敗', '無法載入文章列表，請檢查網路連線', () => handleArticleList());
    }
}

function renderArticleList(articles, folderMap) {
    const content = document.getElementById('content');

    if (!articles || articles.length === 0) {
        const clone = document.getElementById('empty-state-template').content.cloneNode(true);
        content.innerHTML = '';
        content.appendChild(clone);
        return;
    }

    const listClone = document.getElementById('article-list-template').content.cloneNode(true);

    // Render folder tree
    const folderTree = listClone.getElementById('folder-tree');
    if (folderMap) renderFolderTree(folderMap, folderTree);

    // Update page title
    const pageTitle = listClone.querySelector('.page-title');
    if (activeFolder === '/') {
        pageTitle.textContent = `所有文章 (${articles.length})`;
    } else {
        pageTitle.textContent = `📁 ${activeFolder} (${articles.length})`;
    }

    const container = listClone.getElementById('articles-container');

    for (const article of articles) {
        const itemClone = document.getElementById('article-item-template').content.cloneNode(true);

        const link = itemClone.querySelector('.article-link');
        link.textContent = article.title;
        link.href = `#/article/${article.id}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigateToArticle(article.id);
        });

        const dateEl = itemClone.querySelector('.article-date');
        dateEl.textContent = formatDisplayDate(article.date);
        dateEl.setAttribute('datetime', article.date);

        const readTimeEl = itemClone.querySelector('.read-time-value');
        if (readTimeEl) readTimeEl.textContent = article.readTime || '—';

        const viewsEl = itemClone.querySelector('.views-count');
        viewsEl.textContent = getViewCount(article.id);

        container.appendChild(itemClone);
    }

    content.innerHTML = '';
    content.appendChild(listClone);
    // Trigger scroll-reveal for newly rendered cards
    requestAnimationFrame(initScrollReveal);
}

// ===== Article Detail =====

async function handleArticleDetail(params) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">載入文章中...</div>';

    try {
        const response = await fetch('articles/list.json');
        if (!response.ok) throw new Error('Failed to load article list');

        const data = await response.json();
        const article = data.articles.find(a => a.id === params.id);

        if (!article) {
            renderError('找不到此文章', '此文章可能已被移除或不存在', null, true);
            return;
        }

        // Article path: preserve folder structure
        const articlePath = article.folder && article.folder !== '/'
            ? `articles/${article.folder}/${article.filename}`
            : `articles/${article.filename}`;

        const mdResponse = await fetch(articlePath);
        if (!mdResponse.ok) {
            renderError('找不到此文章', '此文章可能已被移除或不存在', null, true);
            return;
        }

        const markdownContent = await mdResponse.text();
        const htmlContent = parseMarkdown(markdownContent);
        const readTime = estimateReadingTime(markdownContent);

        // Increment and get view count
        const views = incrementViewCount(article.id);

        renderArticleDetail(article, htmlContent, views, readTime);
    } catch (error) {
        renderError('載入失敗', error.message || '無法載入文章，請檢查網路連線',
            () => router.handleRouteChange());
    }
}

function renderArticleDetail(article, htmlContent, views, readTime) {
    const content = document.getElementById('content');
    const clone = document.getElementById('article-detail-template').content.cloneNode(true);

    clone.querySelector('.article-title').textContent = article.title;

    const dateEl = clone.querySelector('.article-date');
    dateEl.textContent = formatDisplayDate(article.date);
    dateEl.setAttribute('datetime', article.date);

    const readTimeEl = clone.querySelector('.read-time-value');
    if (readTimeEl) readTimeEl.textContent = readTime || '—';

    clone.querySelector('.views-count').textContent = views;
    clone.querySelector('.article-content').innerHTML = htmlContent;

    const backLink = clone.querySelector('.back-link');
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateHome();
    });

    content.innerHTML = '';
    content.appendChild(clone);

    if (typeof hljs !== 'undefined') {
        content.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
    }
    addCopyButtons();
}

// ===== Markdown =====

function parseMarkdown(markdown) {
    if (typeof marked === 'undefined') return `<pre>${escapeHtml(markdown)}</pre>`;
    marked.setOptions({
        highlight: (code, lang) => {
            if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                try { return hljs.highlight(code, { language: lang }).value; } catch {}
            }
            return code;
        },
        breaks: true,
        gfm: true
    });
    return marked.parse(markdown);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addCopyButtons() {
    document.querySelectorAll('.article-content pre').forEach(pre => {
        if (pre.querySelector('.copy-button')) return;
        const btn = document.createElement('button');
        btn.className = 'copy-button';
        btn.setAttribute('aria-label', '複製程式碼');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 2.5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M3.5 5.5h-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg><span class="copy-text">複製</span>`;
        btn.addEventListener('click', async () => {
            const text = pre.querySelector('code')?.textContent || '';
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed'; ta.style.left = '-9999px';
                document.body.appendChild(ta); ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            btn.classList.add('copied');
            btn.querySelector('.copy-text').textContent = '已複製！';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.querySelector('.copy-text').textContent = '複製';
            }, 2000);
        });
        pre.style.position = 'relative';
        pre.appendChild(btn);
    });
}

// ===== Error =====

function renderError(title, text, retryFn, showBack = false) {
    const content = document.getElementById('content');
    const clone = document.getElementById('error-template').content.cloneNode(true);
    clone.querySelector('.error-title').textContent = title;
    clone.querySelector('.error-text').textContent = text;
    if (retryFn) {
        const btn = clone.querySelector('.retry-button');
        btn.style.display = 'inline-block';
        btn.addEventListener('click', retryFn);
    }
    if (showBack) {
        clone.querySelector('.back-link').style.display = 'inline-block';
    }
    content.innerHTML = '';
    content.appendChild(clone);
}

function handleNotFound() {
    renderError('404 - 找不到頁面', '您訪問的頁面不存在', null, true);
}

// ===== Search =====

function initializeSearch() {
    const input = document.getElementById('search-input');
    const clear = document.getElementById('search-clear');
    if (!input) return;

    let timer;
    input.addEventListener('input', (e) => {
        clear.style.display = e.target.value ? 'block' : 'none';
        clearTimeout(timer);
        timer = setTimeout(() => performSearch(e.target.value), 300);
    });
    clear.addEventListener('click', () => {
        input.value = '';
        clear.style.display = 'none';
        performSearch('');
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(input.value);
    });
}

function performSearch(query) {
    const results = articleSearch.search(query);
    const folderMap = buildFolderMap(results);
    activeFolder = '/';
    renderArticleList(results, folderMap);

    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = query
            ? `搜尋結果: "${query}" (${results.length} 篇文章)`
            : `所有文章 (${results.length})`;
    }
}

// ===== Routes =====

router.addRoute('/', handleArticleList);
router.addRoute('/article/:id', handleArticleDetail);
router.setNotFoundHandler(handleNotFound);

// ===== Scroll Reveal =====

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger each card by 60ms
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.article-item').forEach(el => observer.observe(el));
}

// ===== Init =====

function initializeApp() {
    initializeSearch();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

export { router, articleSearch };
window.router = router;
