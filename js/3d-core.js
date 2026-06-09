
// Custom "One Page" Logic & Animations
// Custom "One Page" Logic & Animations
class FullPageScroll {
    constructor() {
        this.sections = document.querySelectorAll('.fp-section');
        this.currentSection = 0;
        this.totalSections = this.sections.length;
        this.isScrolling = false;
        this.startY = 0;
        this.lastActionTime = 0;
        this.actionCooldown = 1000; // 1s between section jumps to prevent "excessive scrolling"

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
                if (window.innerWidth <= 768) return; // Disable tilt on mobile for performance
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
            if (!document.body.classList.contains('spa-mode')) return;
            
            const currentSecEl = this.sections[this.currentSection];
            const isScrollable = currentSecEl.id === 'section-portfolio' || currentSecEl.id === 'section-assets' || currentSecEl.id === 'section-about' || currentSecEl.id === 'section-contact';

            if (isScrollable) {
                const { scrollTop, scrollHeight, clientHeight } = currentSecEl;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
                const isAtTop = scrollTop <= 10;

                if (e.deltaY > 0 && !isAtBottom) return;
                if (e.deltaY < 0 && !isAtTop) return;
            }

            e.preventDefault();
            const now = Date.now();
            if (now - this.lastActionTime < this.actionCooldown) return;
            if (Math.abs(e.deltaY) < 10) return; 

            if (e.deltaY > 0) {
                this.goToSection(this.currentSection + 1);
            } else {
                this.goToSection(this.currentSection - 1);
            }
            this.lastActionTime = now;
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

        // Mouse Drag Support
        let isMouseDown = false;
        let startY = 0;
        let startScrollTop = 0;
        let dragTarget = null;
        let hasDragged = false;

        window.addEventListener('mousedown', (e) => {
            if (!document.body.classList.contains('spa-mode')) return;
            if (e.button !== 0) return; // Only left click
            
            // Do not drag if clicking form controls or interactive elements
            if (e.target.closest('a, button, input, textarea, select, [role="button"], #skip-preloader-btn, #portfolio-popup')) return;

            isMouseDown = true;
            startY = e.clientY;
            hasDragged = false;
            
            // Find scrollable parent if any
            let target = e.target;
            dragTarget = null;
            while (target && target !== document.body) {
                const style = window.getComputedStyle(target);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    if (target.scrollHeight > target.clientHeight) {
                        dragTarget = target;
                        startScrollTop = target.scrollTop;
                        break;
                    }
                }
                target = target.parentElement;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const currentY = e.clientY;
            const diff = startY - currentY;

            if (Math.abs(diff) > 15) {
                hasDragged = true;
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'grabbing';
            }

            if (dragTarget) {
                // Scroll the inner container
                dragTarget.scrollTop = startScrollTop + diff;
                
                // If we hit boundaries, transition sections if drag is large enough
                const isAtBottom = dragTarget.scrollHeight - dragTarget.scrollTop <= dragTarget.clientHeight + 5;
                const isAtTop = dragTarget.scrollTop <= 5;
                
                if (Math.abs(diff) > 120) {
                    const now = Date.now();
                    if (now - this.lastActionTime >= this.actionCooldown) {
                        if (diff > 0 && isAtBottom) {
                            this.goToSection(this.currentSection + 1);
                            isMouseDown = false;
                            this.lastActionTime = now;
                        } else if (diff < 0 && isAtTop) {
                            this.goToSection(this.currentSection - 1);
                            isMouseDown = false;
                            this.lastActionTime = now;
                        }
                    }
                }
            } else {
                // Dragging main/non-scrollable page to jump section
                if (Math.abs(diff) > 80) {
                    const now = Date.now();
                    if (now - this.lastActionTime >= this.actionCooldown) {
                        if (diff > 0) {
                            this.goToSection(this.currentSection + 1);
                        } else {
                            this.goToSection(this.currentSection - 1);
                        }
                        isMouseDown = false;
                        this.lastActionTime = now;
                    }
                }
            }
        });

        const stopDrag = (e) => {
            if (isMouseDown) {
                isMouseDown = false;
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                
                // If the user actually dragged, prevent click events from firing
                if (hasDragged && e) {
                    const preventClick = (event) => {
                        event.stopImmediatePropagation();
                        window.removeEventListener('click', preventClick, true);
                    };
                    window.addEventListener('click', preventClick, true);
                }
            }
            dragTarget = null;
        };

        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mouseleave', stopDrag);
    }

    resetSections() {
        this.sections.forEach((sec, idx) => {
            sec.style.display = 'block';
            sec.style.position = 'fixed';
            sec.style.top = '0';
            sec.style.left = '0';
            sec.style.width = '100%';
            sec.style.height = '100%';
            sec.style.overflowY = (sec.id === 'section-portfolio' || sec.id === 'section-assets' || sec.id === 'section-about' || sec.id === 'section-contact') ? 'auto' : 'hidden';
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
                sec.style.transform = 'translateY(-100%)';
                sec.style.opacity = '0';
                sec.style.pointerEvents = 'none';
                sec.style.zIndex = '10';
            } else if (idx === index) {
                sec.style.transform = 'translateY(0)';
                sec.style.opacity = '1';
                sec.style.pointerEvents = 'auto';
                sec.style.zIndex = '50';
                sec.style.overflowY = (sec.id === 'section-portfolio' || sec.id === 'section-assets' || sec.id === 'section-about' || sec.id === 'section-contact') ? 'auto' : 'hidden';
            } else {
                sec.style.transform = 'translateY(100%)';
                sec.style.opacity = '0';
                sec.style.pointerEvents = 'none';
                sec.style.zIndex = '10';
            }
        });

        if (window.bg3d) window.bg3d.updateSection(index);
        this.updateNav();
        
        const sectionId = this.sections[index].id;
        history.replaceState(null, null, `#${sectionId}`);
    }

    handleTouchStart(e) {
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        const now = Date.now();
        if (now - this.lastActionTime < this.actionCooldown) return;

        const currentY = e.touches[0].clientY;
        const diff = this.startY - currentY;

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

            if (diff > 0) { 
                if (!isAtBottom) return;
            } else { 
                if (!isAtTop) return;
            }
        }

        if (Math.abs(diff) > 80) { // Increased threshold for mobile to prevent accidental scrolling
            if (diff > 0) {
                this.goToSection(this.currentSection + 1);
            } else {
                this.goToSection(this.currentSection - 1);
            }
            this.startY = currentY;
            this.lastActionTime = now;
            e.preventDefault();
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

let fpApp;
window.scrollToSection = function (index) {
    if (fpApp) fpApp.goToSection(index);
}

document.addEventListener('DOMContentLoaded', () => {
    fpApp = new FullPageScroll();
});
