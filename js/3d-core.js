
// Custom "One Page" Logic & Animations
class FullPageScroll {
    constructor() {
        this.sections = document.querySelectorAll('.fp-section');
        this.currentSection = 0;
        this.totalSections = this.sections.length;
        this.isScrolling = false;
        this.startY = 0;

        // Init
        this.init();
        this.initTiltEffect();
    }

    initTiltEffect() {
        const cards = document.querySelectorAll('.card-3d');
        if (cards.length === 0) return;

        cards.forEach((card) => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    init() {
        this.resetSections();

        // Desktop Wheel Support
        window.addEventListener('wheel', (e) => {
            // Check if we are in SPA mode
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleWheel(e);
        }, { passive: false });

        // Touch Support
        window.addEventListener('touchstart', (e) => {
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleTouchStart(e);
        });
        window.addEventListener('touchmove', (e) => {
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleTouchMove(e);
        }, { passive: false });

        // Keyboard Support
        window.addEventListener('keydown', (e) => this.handleKey(e));
    }

    resetSections() {
        this.sections.forEach((sec, idx) => {
            sec.style.transition = 'none';
            sec.style.display = 'block';
            sec.style.willChange = 'transform, opacity, filter';
            if (idx === 0) {
                sec.style.transform = 'translateY(0)';
                sec.style.zIndex = '20';
                sec.style.opacity = '1';
            } else {
                sec.style.transform = 'translateY(100%)';
                sec.style.zIndex = '0';
                sec.style.opacity = '1';
            }
        });
        if (window.bg3d) window.bg3d.updateSection(0);
        this.updateNav();
    }

    goToSection(index) {
        if (this.isScrolling || index < 0 || index >= this.totalSections || index === this.currentSection) return;

        this.isScrolling = true;
        const direction = index > this.currentSection ? 'down' : 'up';
        const prevIndex = this.currentSection;
        this.currentSection = index;

        const prevSec = this.sections[prevIndex];
        const nextSec = this.sections[index];

        // 1. Prepare Next Section (Immediate State)
        nextSec.style.transition = 'none';
        nextSec.style.zIndex = '20';
        nextSec.style.opacity = '1';

        // 2. Prepare Prev Section (Immediate State)
        prevSec.style.zIndex = '10'; // Behind new one

        // 3. Reset Others (Optimization)
        this.sections.forEach((sec, idx) => {
            if (idx !== index && idx !== prevIndex) {
                sec.style.zIndex = '0';
                sec.style.transform = 'translateY(100%)';
            }
        });

        // 4. Force Reflow
        void nextSec.offsetWidth;

        // 5. Animate
        if (direction === 'down') {
            // Stack Effect: Next comes up over Prev
            nextSec.style.transform = 'translateY(100%)'; // Start position
            void nextSec.offsetWidth; // Reflow

            // Move Next UP
            nextSec.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
            nextSec.style.transform = 'translateY(0%)';

            // Move Prev Back slightly (Parallax)
            prevSec.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
            prevSec.style.transform = 'translateY(-20%) scale(0.9)';

        } else {
            // Un-Stack Effect: Prev slides down revealing Next
            // Prev is strictly ON TOP
            prevSec.style.zIndex = '20';
            nextSec.style.zIndex = '10';

            // Ensure Next is in background position
            nextSec.style.transform = 'translateY(-20%) scale(0.9)';
            void nextSec.offsetWidth;

            // Slide Prev DOWN
            prevSec.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
            prevSec.style.transform = 'translateY(100%)';

            // Bring Next Forward
            nextSec.style.transition = 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
            nextSec.style.transform = 'translateY(0%) scale(1)';
        }

        // Apply extreme Transition Blur (Reduced for performance)
        prevSec.style.transition += ', filter 0.8s ease, opacity 0.8s ease';
        prevSec.style.filter = 'blur(40px)';
        prevSec.style.opacity = '0.5';
        nextSec.style.filter = 'blur(0)';
        nextSec.style.opacity = '1';

        if (window.bg3d) window.bg3d.updateSection(index);

        setTimeout(() => {
            this.isScrolling = false;
            // Clean up old sections
            this.sections.forEach((sec, idx) => {
                if (idx !== index) {
                    sec.style.filter = 'none';
                }
            });
        }, 800);

        this.updateNav();

        // Update Scroll Progress
        const progress = (index / (this.sections.length - 1)) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) progressBar.style.width = `${progress}%`;

        this.triggerSectionAnimations(index);
    }

    triggerSectionAnimations(index) {
        const legion = document.getElementById('logo-legion');
        const grafix = document.getElementById('logo-grafix');

        if (index === 0) {
            if (legion && grafix) {
                // Initial Reset
                [legion, grafix].forEach(el => {
                    el.style.transition = 'none';
                    el.style.transform = 'translateY(30px)';
                    el.style.opacity = '0';
                    el.style.filter = 'brightness(1)';
                });

                // 1. Reveal "Design Beyond"
                setTimeout(() => {
                    legion.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    legion.style.transform = 'translateY(0)';
                    legion.style.opacity = '1';
                    legion.style.filter = 'brightness(1.2)';
                }, 100);

                // 2. Reveal "Your Expectation."
                setTimeout(() => {
                    grafix.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    grafix.style.transform = 'translateY(0)';
                    grafix.style.opacity = '1';
                    grafix.style.filter = 'brightness(1.2)';
                }, 400);
            }
        } else {
            // Reset when leaving Section 0
            if (legion) legion.style.opacity = '0';
            if (grafix) grafix.style.opacity = '0';
        }
    }

    handleWheel(e) {
        // If content in section is scrollable, allow it until limits.
        const currentSecEl = this.sections[this.currentSection];
        // Check if cursor is over a scrollable inner container
        // Actually, let's keep it simple first. Fullpage scroll hijack.
        // If user wants internal scroll, we need logic:

        // Heuristic: If deltaY > 0 (down) and (scrollTop + clientHeight < scrollHeight), let it scroll.
        // Else, trigger section change.

        // Find scrollable child?
        // Let's assume the .fp-section itself or a child might scroll. 
        // My HTML structure has .overflow-y-auto on some sections.

        // Is the event target inside a scrollable element?
        let target = e.target;
        let scrollable = null;

        // Traverse up to find scrollable parent
        while (target && target !== document.body) {
            const style = window.getComputedStyle(target);
            // Check if element has scroll capability
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                // Check if it actually overflows
                if (target.scrollHeight > target.clientHeight) {
                    scrollable = target;
                    break;
                }
            }
            target = target.parentElement;
        }

        if (scrollable) {
            // Check boundaries more precisely
            // deltaY > 0 means scrolling down. 
            // We only trigger next section if we are ALREADY at the bottom.
            const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight + 2;
            const isAtTop = scrollable.scrollTop <= 0;

            if (e.deltaY > 0) { // Scrolling down
                if (!isAtBottom) return; // Let the internal scroll happen
            } else { // Scrolling up
                if (!isAtTop) return; // Let the internal scroll happen
            }
        }

        // Hijack for Page Transition
        e.preventDefault();
        if (this.isScrolling) return;

        // Use a slightly higher threshold to distinguish from slight jitters
        if (Math.abs(e.deltaY) < 15) return;

        if (e.deltaY > 0) {
            this.goToSection(this.currentSection + 1);
        } else {
            this.goToSection(this.currentSection - 1);
        }
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (this.isScrolling) {
            // e.preventDefault(); 
            return;
        }

        const currentY = e.touches[0].clientY;
        const diff = this.startY - currentY;

        // Internal scroll logic for touch
        let target = e.target;
        let scrollable = null;

        while (target && target !== document.body) {
            const style = window.getComputedStyle(target);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                if (target.scrollHeight > target.clientHeight) {
                    scrollable = target;
                    break;
                }
            }
            target = target.parentElement;
        }

        if (scrollable) {
            const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight + 2;
            const isAtTop = scrollable.scrollTop <= 0;

            if (diff > 0) { // Swipe Up (Scroll Down)
                if (!isAtBottom) return;
            } else { // Swipe Down (Scroll Up)
                if (!isAtTop) return;
            }
        }

        if (Math.abs(diff) > 40) { // Slightly less sensitive touch to avoid accidental jumps
            if (diff > 0) {
                this.goToSection(this.currentSection + 1);
            } else {
                this.goToSection(this.currentSection - 1);
            }
            this.startY = currentY;
        }
    }

    handleKey(e) {
        if (e.key === 'ArrowDown') {
            this.goToSection(this.currentSection + 1);
        } else if (e.key === 'ArrowUp') {
            this.goToSection(this.currentSection - 1);
        }
    }

    updateNav() {
        const allButtons = document.querySelectorAll('button[onclick^="scrollToSection"]');
        allButtons.forEach((btn) => {
            const OnClickVal = btn.getAttribute('onclick');
            const targetIndex = parseInt(OnClickVal.match(/\d+/)[0]);

            if (targetIndex === this.currentSection) {
                btn.classList.add('text-neon-blue');
                btn.classList.remove('text-gray-300', 'text-white');
            } else {
                btn.classList.remove('text-neon-blue');
                btn.classList.add('text-gray-300');
            }
        });
    }
}

// Global instance to access from HTML onclick
let fpApp;
window.scrollToSection = function (index) {
    if (fpApp) fpApp.goToSection(index);
}

document.addEventListener('DOMContentLoaded', () => {
    fpApp = new FullPageScroll();
});
