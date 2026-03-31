/**
 * Main application entry point
 */

import Router from './router.js';
import ArticleSearch from './search.js';

const router = new Router();
const articleSearch = new ArticleSearch();

let currentArticles = [];
let activeFolder = '/'; // currently selected folder

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

// (removed)

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

// ===== Folder Grid (Home) =====

async function handleHome() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">載入中...</div>';

    try {
        const response = await fetch('articles/list.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        currentArticles = data.articles || [];
        articleSearch.initialize(currentArticles);
        renderFolderGrid(buildFolderMap(currentArticles));
    } catch (error) {
        renderError('載入失敗', '無法載入文章列表，請檢查網路連線', () => handleHome());
    }
}

// Folder visual config: gradient + SVG icon per topic
const FOLDER_CONFIG = {
    'k8s內部系列': {
        gradient: 'linear-gradient(135deg, #0f4c81 0%, #1a6fa8 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="10" stroke="white" stroke-width="2.5" fill="none" opacity="0.9"/>
            <line x1="24" y1="8" x2="24" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="24" y1="34" x2="24" y2="40" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="8" y1="24" x2="14" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="34" y1="24" x2="40" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="12.7" y1="12.7" x2="17" y2="17" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="31" y1="31" x2="35.3" y2="35.3" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="35.3" y1="12.7" x2="31" y2="17" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="17" y1="31" x2="12.7" y2="35.3" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
        </svg>`
    },
    'kuberay系列': {
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="24,6 38,14 38,30 24,38 10,30 10,14" stroke="white" stroke-width="2" fill="none" opacity="0.85"/>
            <polygon points="24,14 32,19 32,29 24,34 16,29 16,19" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.08)" opacity="0.7"/>
            <circle cx="24" cy="24" r="3.5" fill="white" opacity="0.9"/>
            <line x1="24" y1="6"  x2="24" y2="14" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="38" y1="14" x2="32" y2="19" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="38" y1="30" x2="32" y2="29" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="24" y1="38" x2="24" y2="34" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="10" y1="30" x2="16" y2="29" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="10" y1="14" x2="16" y2="19" stroke="white" stroke-width="1.5" opacity="0.6"/>
        </svg>`
    },
    'leetcode系列': {
        gradient: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a27 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="14" height="3" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="8" y="17" width="22" height="3" rx="1.5" fill="white" opacity="0.7"/>
            <rect x="8" y="24" width="18" height="3" rx="1.5" fill="white" opacity="0.7"/>
            <rect x="8" y="31" width="10" height="3" rx="1.5" fill="white" opacity="0.5"/>
            <circle cx="36" cy="34" r="7" stroke="white" stroke-width="2" fill="none" opacity="0.85"/>
            <path d="M32.5 34 L35 36.5 L39.5 30.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`
    },
    'observability系列': {
        gradient: 'linear-gradient(135deg, #2d1b4e 0%, #4a2c7a 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="6,36 14,24 20,30 28,16 34,22 42,10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>
            <circle cx="14" cy="24" r="2.5" fill="white" opacity="0.8"/>
            <circle cx="20" cy="30" r="2.5" fill="white" opacity="0.8"/>
            <circle cx="28" cy="16" r="2.5" fill="white" opacity="0.8"/>
            <circle cx="34" cy="22" r="2.5" fill="white" opacity="0.8"/>
            <line x1="6" y1="40" x2="42" y2="40" stroke="white" stroke-width="1.5" opacity="0.3"/>
        </svg>`
    },
    'question': {
        gradient: 'linear-gradient(135deg, #3d2000 0%, #7a4500 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="16" stroke="white" stroke-width="2" fill="none" opacity="0.85"/>
            <path d="M18 19c0-3.3 2.7-6 6-6s6 2.7 6 6c0 3-2 4.5-4 6s-2 3-2 4" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9"/>
            <circle cx="24" cy="35" r="2" fill="white" opacity="0.9"/>
        </svg>`
    },
    '小實驗': {
        gradient: 'linear-gradient(135deg, #003d3d 0%, #006666 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8 L18 26 L10 38 L38 38 L30 26 L30 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>
            <line x1="15" y1="8" x2="33" y2="8" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
            <circle cx="20" cy="32" r="2" fill="white" opacity="0.7"/>
            <circle cx="28" cy="34" r="1.5" fill="white" opacity="0.5"/>
            <circle cx="24" cy="30" r="1" fill="white" opacity="0.4"/>
        </svg>`
    },
    '時事系列': {
        gradient: 'linear-gradient(135deg, #3d0000 0%, #7a1a1a 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="10" width="34" height="28" rx="3" stroke="white" stroke-width="2" fill="none" opacity="0.85"/>
            <line x1="7" y1="18" x2="41" y2="18" stroke="white" stroke-width="1.5" opacity="0.5"/>
            <rect x="12" y="22" width="10" height="10" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.1)" opacity="0.8"/>
            <line x1="26" y1="23" x2="36" y2="23" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
            <line x1="26" y1="27" x2="36" y2="27" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
            <line x1="26" y1="31" x2="33" y2="31" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        </svg>`
    },
    '鐵人賽17th系列': {
        gradient: 'linear-gradient(135deg, #1a0a00 0%, #4a2800 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 6 L28 18 L40 18 L30 26 L34 38 L24 30 L14 38 L18 26 L8 18 L20 18 Z" stroke="white" stroke-width="2" stroke-linejoin="round" fill="rgba(255,255,255,0.12)" opacity="0.9"/>
        </svg>`
    },
    '/': {
        gradient: 'linear-gradient(135deg, #1c2938 0%, #2c3e50 100%)',
        svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 14 L10 38 L38 38 L38 20 L26 20 L22 14 Z" stroke="white" stroke-width="2" stroke-linejoin="round" fill="rgba(255,255,255,0.08)" opacity="0.85"/>
        </svg>`
    },
};

function getFolderConfig(name) {
    return FOLDER_CONFIG[name] || {
        gradient: 'linear-gradient(135deg, #243447 0%, #2c3e50 100%)',
        svg: FOLDER_CONFIG['/'].svg
    };
}

function renderFolderGrid(folderMap) {
    const content = document.getElementById('content');

    const wrapper = document.createElement('div');
    wrapper.className = 'folder-grid-page';

    const title = document.createElement('h2');
    title.className = 'page-title';
    title.textContent = '筆記分類';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'folder-grid';

    const folders = Object.keys(folderMap).sort((a, b) => {
        if (a === '/') return 1;
        if (b === '/') return -1;
        return a.localeCompare(b, 'zh-TW');
    });

    folders.forEach((folder, i) => {
        const count = folderMap[folder].length;
        const displayName = folder === '/' ? '未分類' : folder;
        const config = getFolderConfig(folder);

        const card = document.createElement('div');
        card.className = 'folder-card';
        card.style.animationDelay = `${i * 70}ms`;
        card.innerHTML = `
            <div class="folder-card-bg" style="background:${config.gradient}">
                <div class="folder-card-svg">${config.svg}</div>
                <div class="folder-card-overlay"></div>
            </div>
            <div class="folder-card-body">
                <div class="folder-card-name">${displayName}</div>
                <div class="folder-card-count">${count} 篇文章</div>
            </div>
        `;
        card.addEventListener('click', () => {
            router.navigate(`/folder/${encodeURIComponent(folder)}`);
        });
        grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    content.innerHTML = '';
    content.appendChild(wrapper);
}

// ===== Folder Article List =====

async function handleFolderView(params) {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading">載入中...</div>';

    // Ensure articles are loaded
    if (currentArticles.length === 0) {
        try {
            const response = await fetch('articles/list.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            currentArticles = data.articles || [];
            articleSearch.initialize(currentArticles);
        } catch (error) {
            renderError('載入失敗', '無法載入文章列表，請檢查網路連線', () => handleFolderView(params));
            return;
        }
    }

    const folderName = decodeURIComponent(params.name);
    const articles = currentArticles.filter(a => (a.folder || '/') === folderName);
    const displayName = folderName === '/' ? '未分類' : folderName;
    const config = getFolderConfig(folderName);

    renderArticleList(articles, displayName, config.gradient);
}

// ===== Article List =====

async function handleArticleList() {
    // Redirect old list route to home
    router.navigate('/');
}

function renderArticleList(articles, folderName, gradient) {
    const content = document.getElementById('content');

    if (!articles || articles.length === 0) {
        const clone = document.getElementById('empty-state-template').content.cloneNode(true);
        content.innerHTML = '';
        content.appendChild(clone);
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'folder-article-page';

    const header = document.createElement('div');
    header.className = 'folder-article-header';
    header.innerHTML = `
        <button class="folder-back-btn" aria-label="返回分類">← 返回</button>
        <div class="folder-article-title-wrap">
            <div class="folder-article-accent" style="background:${gradient || 'var(--pacific-blue)'}"></div>
            <h2 class="page-title">${folderName} <span class="folder-article-count">${articles.length}</span></h2>
        </div>
    `;
    header.querySelector('.folder-back-btn').addEventListener('click', () => router.navigateHome());
    wrapper.appendChild(header);

    const container = document.createElement('div');
    container.id = 'articles-container';
    wrapper.appendChild(container);

    for (const article of articles) {
        const itemClone = document.getElementById('article-item-template').content.cloneNode(true);

        const articleEl = itemClone.querySelector('.article-item');
        articleEl.style.cursor = 'pointer';
        articleEl.addEventListener('click', () => {
            router.navigateToArticle(article.id);
        });

        const link = itemClone.querySelector('.article-link');
        link.textContent = article.title;
        link.href = `#/article/${article.id}`;
        link.addEventListener('click', (e) => {
            e.stopPropagation(); // 避免觸發兩次
            e.preventDefault();
            router.navigateToArticle(article.id);
        });

        const dateEl = itemClone.querySelector('.article-date');
        dateEl.textContent = formatDisplayDate(article.date);
        dateEl.setAttribute('datetime', article.date);

        const readTimeEl = itemClone.querySelector('.read-time-value');
        if (readTimeEl) readTimeEl.closest('.article-read-time')?.remove();

        container.appendChild(itemClone);
    }

    content.innerHTML = '';
    content.appendChild(wrapper);
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

        renderArticleDetail(article, htmlContent);
    } catch (error) {
        renderError('載入失敗', error.message || '無法載入文章，請檢查網路連線',
            () => router.handleRouteChange());
    }
}

function renderArticleDetail(article, htmlContent) {
    const content = document.getElementById('content');
    const clone = document.getElementById('article-detail-template').content.cloneNode(true);

    clone.querySelector('.article-title').textContent = article.title;

    const dateEl = clone.querySelector('.article-date');
    dateEl.textContent = formatDisplayDate(article.date);
    dateEl.setAttribute('datetime', article.date);

    // Remove read-time span from detail view
    clone.querySelector('.article-read-time')?.remove();

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
    addCodeLangLabels();
    initReadingProgress();
    initArticleScrollReveal();
}

// ===== Reading Progress Bar =====

function initReadingProgress() {
    // Remove any existing bar
    document.getElementById('reading-progress')?.remove();

    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    function updateProgress() {
        const articleEl = document.querySelector('.article-detail');
        if (!articleEl) return;
        const rect = articleEl.getBoundingClientRect();
        const total = articleEl.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
        bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

// ===== Article Scroll Reveal =====

function initArticleScrollReveal() {
    const targets = document.querySelectorAll(
        '.article-content h1, .article-content h2, .article-content h3, ' +
        '.article-content h4, .article-content p, .article-content pre, ' +
        '.article-content blockquote, .article-content ul, .article-content ol, ' +
        '.article-content table, .article-header'
    );

    targets.forEach(el => el.classList.add('content-reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('content-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

// ===== Code Language Labels =====

function addCodeLangLabels() {
    document.querySelectorAll('.article-content pre code').forEach(code => {
        const pre = code.parentElement;
        if (pre.querySelector('.code-lang')) return;

        // Extract language from hljs class e.g. "language-go"
        const langClass = [...code.classList].find(c => c.startsWith('language-'));
        if (!langClass) return;
        const lang = langClass.replace('language-', '').toUpperCase();

        const label = document.createElement('span');
        label.className = 'code-lang';
        label.textContent = lang;
        pre.appendChild(label);
    });
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
    if (!query.trim()) {
        // Empty search — go back to folder grid
        if (currentArticles.length > 0) {
            renderFolderGrid(buildFolderMap(currentArticles));
        }
        return;
    }
    const results = articleSearch.search(query);
    renderArticleList(results, `搜尋「${query}」`, '🔍');
}

// ===== Routes =====

router.addRoute('/', handleHome);
router.addRoute('/folder/:name', handleFolderView);
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
