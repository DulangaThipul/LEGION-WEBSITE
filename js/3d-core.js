
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

        // Desktop Wheel Support (Disable on mobile)
        window.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 768) return;
            // Check if we are in SPA mode
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleWheel(e);
        }, { passive: false });

        // Touch Support (Disable on mobile to prevent accidental page jumps)
        window.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) return;
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleTouchStart(e);
        });
        window.addEventListener('touchmove', (e) => {
            if (window.innerWidth <= 768) return;
            if (!document.body.classList.contains('spa-mode')) return;
            this.handleTouchMove(e);
        }, { passive: false });

        // Keyboard Support
        window.addEventListener('keydown', (e) => this.handleKey(e));

        // Discrete Section Scrolling (One scroll = One page jump)
        let lastScrollTime = 0;
        const scrollCooldown = 800; // ms between scrolls

        window.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 768) return;
            if (!document.body.classList.contains('spa-mode')) return;

            const currentSecEl = this.sections[this.currentSection];
            const isScrollable = currentSecEl.id === 'section-portfolio' || currentSecEl.id === 'section-assets';

            if (isScrollable) {
                const { scrollTop, scrollHeight, clientHeight } = currentSecEl;
                // Use a larger threshold (10px) to avoid precision issues
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
                const isAtTop = scrollTop <= 10;

                // If scrolling down and we have space to scroll down, let it happen
                if (e.deltaY > 0 && !isAtBottom) return;
                // If scrolling up and we have space to scroll up, let it happen
                if (e.deltaY < 0 && !isAtTop) return;
            }

            // If we are here, we either aren't in a scrollable section 
            // OR we've hit the boundary of one. Perform jump.
            e.preventDefault();
            const now = Date.now();
            if (now - lastScrollTime < scrollCooldown) return;

            if (Math.abs(e.deltaY) < 5) return; // Very low threshold

            if (e.deltaY > 0) {
                this.goToSection(this.currentSection + 1);
                lastScrollTime = now;
            } else {
                this.goToSection(this.currentSection - 1);
                lastScrollTime = now;
            }
        }, { passive: false });
    }

    resetSections() {
        this.sections.forEach((sec, idx) => {
            sec.style.display = 'block';
            sec.style.position = 'fixed';
            sec.style.top = '0';
            sec.style.left = '0';
            sec.style.width = '100%';
            sec.style.height = '100%';
            sec.style.overflowY = (sec.id === 'section-portfolio' || sec.id === 'section-assets') ? 'auto' : 'hidden';
            sec.style.overscrollBehavior = 'contain';
            sec.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
            
            if (idx === 0) {
                sec.style.transform = 'translateY(0)';
                sec.style.opacity = '1';
                sec.style.pointerEvents = 'auto';
                sec.style.zIndex = '20';
            } else {
                sec.style.transform = 'translateY(100%)';
                sec.style.opacity = '0';
                sec.style.pointerEvents = 'none';
                sec.style.zIndex = '10';
            }
        });
        this.currentSection = 0;
        if (window.bg3d) window.bg3d.updateSection(0);
        this.updateNav();
    }

    goToSection(index) {
        if (index < 0 || index >= this.totalSections || index === this.currentSection) return;

        this.currentSection = index;

        this.sections.forEach((sec, idx) => {
            if (idx < index) {
                // Above: Slide up and fade out
                sec.style.transform = 'translateY(-100%)';
                sec.style.opacity = '0';
                sec.style.pointerEvents = 'none';
                sec.style.zIndex = '10';
                sec.style.overflowY = 'hidden';
            } else if (idx === index) {
                // Current: Move to center and fade in
                sec.style.transform = 'translateY(0)';
                sec.style.opacity = '1';
                sec.style.pointerEvents = 'auto';
                sec.style.zIndex = '50'; // Higher z-index for active
                sec.style.overflowY = (sec.id === 'section-portfolio' || sec.id === 'section-assets') ? 'auto' : 'hidden';
            } else {
                // Below: Stay down
                sec.style.transform = 'translateY(100%)';
                sec.style.opacity = '0';
                sec.style.pointerEvents = 'none';
                sec.style.zIndex = '10';
                sec.style.overflowY = 'hidden';
            }
        });

        // Sync 3D Background
        if (window.bg3d) window.bg3d.updateSection(index);
        this.updateNav();
        
        // Update URL hash without jumping
        const sectionId = this.sections[index].id;
        history.replaceState(null, null, `#${sectionId}`);
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
        // Let native scroll happen
        // e.preventDefault();
        return;
    }

    handleTouchMove(e) {
        // Let native scroll happen
        // e.preventDefault();
        return;
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

        // e.preventDefault();
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
