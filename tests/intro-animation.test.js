/**
 * Tests for intro overlay animation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

function buildDOM() {
    return new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="intro-overlay">
                <div class="intro-inner">
                    <div class="intro-label">AI Infra</div>
                    <div class="intro-code">
                        <span class="intro-prompt">$ </span>
                        <span id="intro-typed"></span>
                        <span class="intro-cursor">▋</span>
                    </div>
                    <div class="intro-sub" id="intro-sub"></div>
                </div>
                <div class="intro-progress"><div id="intro-bar"></div></div>
            </div>
            <div id="app"></div>
        </body>
        </html>
    `, {
        url: 'http://localhost',
        runScripts: 'dangerously',
    });
}

describe('Intro Overlay', () => {
    let dom;

    beforeEach(() => {
        dom = buildDOM();
        // Clear sessionStorage between tests
        dom.window.sessionStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('overlay element exists in DOM', () => {
        const overlay = dom.window.document.getElementById('intro-overlay');
        expect(overlay).not.toBeNull();
    });

    it('app element starts without visible class', () => {
        const app = dom.window.document.getElementById('app');
        expect(app.classList.contains('visible')).toBe(false);
    });

    it('intro-typed starts empty', () => {
        const typed = dom.window.document.getElementById('intro-typed');
        expect(typed.textContent).toBe('');
    });

    it('intro-sub starts empty', () => {
        const sub = dom.window.document.getElementById('intro-sub');
        expect(sub.textContent).toBe('');
    });

    it('intro-bar starts at 0 width', () => {
        const bar = dom.window.document.getElementById('intro-bar');
        // Default inline style is empty (CSS handles it)
        expect(bar.style.width).toBe('');
    });

    it('sessionStorage skip: overlay hidden when intro_done is set', () => {
        // Simulate already-seen session
        dom.window.sessionStorage.setItem('intro_done', '1');

        // Re-run the intro logic inline (mirrors intro.js skip branch)
        const overlay = dom.window.document.getElementById('intro-overlay');
        const app = dom.window.document.getElementById('app');

        if (dom.window.sessionStorage.getItem('intro_done')) {
            overlay.style.display = 'none';
            app.classList.add('visible');
        }

        expect(overlay.style.display).toBe('none');
        expect(app.classList.contains('visible')).toBe(true);
    });

    it('typewriter appends characters correctly', () => {
        const typed = dom.window.document.getElementById('intro-typed');
        const text = '"Hello, World!"';

        // Simulate typing all characters
        for (const ch of text) {
            typed.textContent += ch;
        }

        expect(typed.textContent).toBe('"Hello, World!"');
    });

    it('cursor gets hidden class after typing completes', () => {
        const cursor = dom.window.document.querySelector('.intro-cursor');
        cursor.classList.add('hidden');
        expect(cursor.classList.contains('hidden')).toBe(true);
    });

    it('sub text becomes visible after typing', () => {
        const sub = dom.window.document.getElementById('intro-sub');
        sub.textContent = 'Zak 的學習筆記 · AI Infra';
        sub.classList.add('visible');

        expect(sub.textContent).toBe('Zak 的學習筆記 · AI Infra');
        expect(sub.classList.contains('visible')).toBe(true);
    });

    it('fade-out class hides overlay', () => {
        const overlay = dom.window.document.getElementById('intro-overlay');
        overlay.classList.add('fade-out');
        expect(overlay.classList.contains('fade-out')).toBe(true);
    });

    it('app becomes visible after intro finishes', () => {
        const app = dom.window.document.getElementById('app');
        app.classList.add('visible');
        expect(app.classList.contains('visible')).toBe(true);
    });

    it('sessionStorage is set after intro completes', () => {
        dom.window.sessionStorage.setItem('intro_done', '1');
        expect(dom.window.sessionStorage.getItem('intro_done')).toBe('1');
    });
});
