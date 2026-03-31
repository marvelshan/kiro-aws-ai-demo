/**
 * Intro overlay animation
 * Typewriter effect → progress bar → fade out → reveal app
 */
(function () {
    // Skip intro if already seen this session
    if (sessionStorage.getItem('intro_done')) {
        document.getElementById('intro-overlay').style.display = 'none';
        document.getElementById('app').classList.add('visible');
        return;
    }

    const TEXT = '"Hello, World!"';
    const SUB  = 'Zak 的學習筆記 · AI Infra';
    const TOTAL_DURATION = 3200; // ms total before fade-out

    const typedEl  = document.getElementById('intro-typed');
    const cursorEl = document.querySelector('.intro-cursor');
    const subEl    = document.getElementById('intro-sub');
    const barEl    = document.getElementById('intro-bar');
    const overlay  = document.getElementById('intro-overlay');
    const app      = document.getElementById('app');

    let charIndex = 0;
    const TYPE_SPEED = 60; // ms per character
    const typeDelay  = 800; // wait before typing starts

    // Animate progress bar
    function startProgressBar() {
        barEl.style.transitionDuration = TOTAL_DURATION + 'ms';
        // Force reflow so transition fires
        barEl.getBoundingClientRect();
        barEl.style.width = '100%';
    }

    // Typewriter
    function typeNext() {
        if (charIndex < TEXT.length) {
            typedEl.textContent += TEXT[charIndex];
            charIndex++;
            setTimeout(typeNext, TYPE_SPEED);
        } else {
            // Done typing — show sub text, hide cursor
            cursorEl.classList.add('hidden');
            subEl.textContent = SUB;
            subEl.classList.add('visible');
        }
    }

    // Fade out overlay and reveal app
    function finishIntro() {
        overlay.classList.add('fade-out');
        app.classList.add('visible');
        sessionStorage.setItem('intro_done', '1');

        // Remove overlay from DOM after transition
        overlay.addEventListener('transitionend', () => {
            overlay.remove();
        }, { once: true });
    }

    // Kick off
    startProgressBar();
    setTimeout(typeNext, typeDelay);
    setTimeout(finishIntro, TOTAL_DURATION);
})();
