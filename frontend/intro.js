/**
 * Intro overlay — curtain animation
 * Same gradient as main site → slides UP to reveal the page beneath
 */
(function () {
    const overlay = document.getElementById('intro-overlay');
    const app     = document.getElementById('app');

    // Skip intro on repeat visits within the same session
    if (sessionStorage.getItem('intro_done')) {
        overlay.remove();
        return;
    }

    const TEXT         = '"Hello, World!"';
    const SUB          = 'Zak 的學習筆記 · AI Infra';
    const TOTAL_MS     = 3400;  // total time before curtain lifts
    const TYPE_SPEED   = 58;    // ms per character
    const TYPE_DELAY   = 900;   // wait before typing starts

    const typedEl  = document.getElementById('intro-typed');
    const cursorEl = document.querySelector('.intro-cursor');
    const subEl    = document.getElementById('intro-sub');
    const barEl    = document.getElementById('intro-bar');

    let charIndex = 0;

    // ── Progress bar ──
    function startProgressBar() {
        barEl.style.transitionDuration = TOTAL_MS + 'ms';
        barEl.getBoundingClientRect(); // force reflow
        barEl.style.width = '100%';
    }

    // ── Typewriter ──
    function typeNext() {
        if (charIndex < TEXT.length) {
            typedEl.textContent += TEXT[charIndex++];
            setTimeout(typeNext, TYPE_SPEED);
        } else {
            cursorEl.classList.add('hidden');
            subEl.textContent = SUB;
            subEl.classList.add('visible');
        }
    }

    // ── Curtain lift ──
    function liftCurtain() {
        overlay.classList.add('slide-up');
        sessionStorage.setItem('intro_done', '1');

        overlay.addEventListener('transitionend', (e) => {
            // Only remove after the transform transition (not opacity of inner)
            if (e.propertyName === 'transform') {
                overlay.remove();
            }
        }, { once: true });
    }

    startProgressBar();
    setTimeout(typeNext, TYPE_DELAY);
    setTimeout(liftCurtain, TOTAL_MS);
})();
