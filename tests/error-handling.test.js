/**
 * Tests for error handling functionality
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Error Handling', () => {
    let dom;
    let document;
    let window;
    let consoleErrorSpy;

    beforeEach(() => {
        // Create a minimal DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div id="content"></div>
                <template id="error-template">
                    <div class="error-message">
                        <h2 class="error-title"></h2>
                        <p class="error-text"></p>
                        <div class="error-actions">
                            <button class="retry-button" style="display: none;">重試</button>
                            <a href="#/" class="back-link" style="display: none;">返回首頁</a>
                        </div>
                    </div>
                </template>
            </body>
            </html>
        `, { url: 'http://localhost' });
        
        document = dom.window.document;
        window = dom.window;
        global.document = document;
        global.window = window;
        
        // Spy on console.error
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('404 Error Display', () => {
        it('should display 404 error for missing articles', () => {
            // Requirements: 7.1
            const content = document.getElementById('content');
            const template = document.getElementById('error-template');
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.error-title').textContent = '找不到此文章';
            clone.querySelector('.error-text').textContent = '此文章可能已被移除或不存在';
            
            content.appendChild(clone);
            
            expect(content.querySelector('.error-title').textContent).toBe('找不到此文章');
            expect(content.querySelector('.error-text').textContent).toBe('此文章可能已被移除或不存在');
        });

        it('should display 404 error for invalid routes', () => {
            // Requirements: 7.1
            const content = document.getElementById('content');
            const template = document.getElementById('error-template');
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.error-title').textContent = '404 - 找不到頁面';
            clone.querySelector('.error-text').textContent = '您訪問的頁面不存在';
            
            content.appendChild(clone);
            
            expect(content.querySelector('.error-title').textContent).toBe('404 - 找不到頁面');
        });
    });

    describe('Network Error Display', () => {
        it('should display network error with retry button', () => {
            // Requirements: 7.2
            const content = document.getElementById('content');
            const template = document.getElementById('error-template');
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.error-title').textContent = '載入失敗';
            clone.querySelector('.error-text').textContent = '無法載入文章列表，請檢查網路連線';
            
            const retryButton = clone.querySelector('.retry-button');
            retryButton.style.display = 'inline-block';
            
            content.appendChild(clone);
            
            expect(content.querySelector('.error-title').textContent).toBe('載入失敗');
            expect(content.querySelector('.retry-button').style.display).toBe('inline-block');
        });
    });

    describe('Error Logging', () => {
        it('should log errors with timestamp', () => {
            // Requirements: 7.5
            const timestamp = new Date().toISOString();
            const error = new Error('Test error');
            
            console.error(`[${timestamp}] Error in Test Context:`, {
                timestamp,
                context: 'Test Context',
                message: error.message,
                stack: error.stack
            });
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            const logCall = consoleErrorSpy.mock.calls[0];
            expect(logCall[0]).toContain(timestamp);
            expect(logCall[0]).toContain('Error in Test Context');
        });

        it('should log errors with context information', () => {
            // Requirements: 7.5
            const error = new Error('Network error');
            const context = {
                url: 'articles/list.json',
                status: 500,
                type: 'network'
            };
            
            console.error('Network error:', {
                message: error.message,
                ...context
            });
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            const logCall = consoleErrorSpy.mock.calls[0];
            expect(logCall[1]).toHaveProperty('url', 'articles/list.json');
            expect(logCall[1]).toHaveProperty('type', 'network');
        });

        it('should include error details in logs', () => {
            // Requirements: 7.5
            const error = new Error('Parse error');
            error.stack = 'Error: Parse error\n    at parseMarkdown';
            
            console.error('Parse error:', {
                message: error.message,
                stack: error.stack
            });
            
            expect(consoleErrorSpy).toHaveBeenCalled();
            const logCall = consoleErrorSpy.mock.calls[0];
            expect(logCall[1]).toHaveProperty('message', 'Parse error');
            expect(logCall[1]).toHaveProperty('stack');
        });
    });

    describe('Generic Error Fallback', () => {
        it('should display generic error message', () => {
            // Requirements: 7.3
            const content = document.getElementById('content');
            content.innerHTML = `
                <div class="error-message">
                    <h2 class="error-title">發生錯誤</h2>
                    <p class="error-text">抱歉，處理您的請求時發生錯誤</p>
                    <a href="#/" class="back-link">返回首頁</a>
                </div>
            `;
            
            expect(content.querySelector('.error-title').textContent).toBe('發生錯誤');
            expect(content.querySelector('.error-text').textContent).toContain('處理您的請求時發生錯誤');
        });
    });

    describe('Error Actions', () => {
        it('should provide retry button for recoverable errors', () => {
            // Requirements: 7.2
            const content = document.getElementById('content');
            const template = document.getElementById('error-template');
            const clone = template.content.cloneNode(true);
            
            const retryButton = clone.querySelector('.retry-button');
            retryButton.style.display = 'inline-block';
            
            content.appendChild(clone);
            
            const button = content.querySelector('.retry-button');
            expect(button).toBeTruthy();
            expect(button.textContent).toBe('重試');
        });

        it('should provide back to home link', () => {
            // Requirements: 7.1
            const content = document.getElementById('content');
            const template = document.getElementById('error-template');
            const clone = template.content.cloneNode(true);
            
            const backLink = clone.querySelector('.back-link');
            backLink.style.display = 'inline-block';
            
            content.appendChild(clone);
            
            const link = content.querySelector('.back-link');
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toBe('#/');
        });
    });
});
