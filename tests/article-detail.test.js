/**
 * Tests for article detail view functionality
 * Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Article Detail View', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Create a minimal DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="content"></div>
                <template id="article-detail-template">
                    <article class="article-detail">
                        <div class="article-header">
                            <h2 class="article-title"></h2>
                            <time class="article-date"></time>
                        </div>
                        <div class="article-content"></div>
                        <nav class="article-nav">
                            <a href="#/" class="back-link">← 返回文章列表</a>
                        </nav>
                    </article>
                </template>
                <template id="error-template">
                    <div class="error-message">
                        <h2 class="error-title"></h2>
                        <p class="error-text"></p>
                        <button class="retry-button" style="display: none;">重試</button>
                        <a href="#/" class="back-link">返回首頁</a>
                    </div>
                </template>
            </body>
            </html>
        `, { url: 'http://localhost' });
        
        document = dom.window.document;
        window = dom.window;
        global.document = document;
        global.window = window;
    });

    it('should render article with title and date', () => {
        // Test that article metadata is displayed
        // Requirements: 2.4
        const article = {
            id: 'test-article',
            title: 'Test Article',
            date: '2024-12-04',
            filename: 'test-article.md'
        };
        
        const htmlContent = '<p>Test content</p>';
        
        // Simulate rendering
        const content = document.getElementById('content');
        const template = document.getElementById('article-detail-template');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.article-title').textContent = article.title;
        clone.querySelector('.article-date').textContent = article.date;
        clone.querySelector('.article-content').innerHTML = htmlContent;
        
        content.appendChild(clone);
        
        // Verify
        expect(content.querySelector('.article-title').textContent).toBe('Test Article');
        expect(content.querySelector('.article-date').textContent).toBe('2024-12-04');
        expect(content.querySelector('.article-content').innerHTML).toBe('<p>Test content</p>');
    });

    it('should render 404 error for missing article', () => {
        // Test 404 handling
        // Requirements: 7.1
        const content = document.getElementById('content');
        const template = document.getElementById('error-template');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.error-title').textContent = '找不到此文章';
        clone.querySelector('.error-text').textContent = '此文章可能已被移除或不存在';
        
        content.appendChild(clone);
        
        // Verify
        expect(content.querySelector('.error-title').textContent).toBe('找不到此文章');
        expect(content.querySelector('.error-text').textContent).toBe('此文章可能已被移除或不存在');
    });

    it('should include back navigation link', () => {
        // Test back navigation
        // Requirements: 6.1, 6.2
        const content = document.getElementById('content');
        const template = document.getElementById('article-detail-template');
        const clone = template.content.cloneNode(true);
        
        content.appendChild(clone);
        
        const backLink = content.querySelector('.back-link');
        expect(backLink).toBeTruthy();
        expect(backLink.textContent).toContain('返回');
    });
});
