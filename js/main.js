// Advanced Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // Trigger slightly before element comes into view
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            entry.target.classList.remove('opacity-0', 'translate-y-10', 'scale-95');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Fix 100vh issue on mobile
    const setVh = () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);

    // Standard Scroll Progress for multi-page mode
    window.addEventListener('scroll', () => {
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el, index) => {
        // Add base classes for animation
        el.classList.add('opacity-0', 'translate-y-10', 'scale-95', 'transition-all', 'duration-700', 'ease-out');

        // Stagger effect for grid items
        if (el.parentElement.classList.contains('grid')) {
            el.style.transitionDelay = `${index * 100}ms`;
        }

        observer.observe(el);
    });

    // Mobile Menu Toggle (if we add one later, though current nav is simple)
    // For now, let's add a subtle parallax effect to the hero section on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroSection = document.querySelector('section');
        if (heroSection) {
            const limit = heroSection.offsetTop + heroSection.offsetHeight;
            if (scrolled > heroSection.offsetTop && scrolled <= limit) {
                heroSection.style.backgroundPositionY = (scrolled * 0.5) + 'px';
            }
        }
    });

    // Mobile Menu Toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // --- CUSTOM CURSOR ---
    const cursor = document.createElement('div');
    cursor.className = 'fixed w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out mix-blend-difference hidden md:block';
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    let cursorRafId = null;
    document.addEventListener('mousemove', (e) => {
        if (cursorRafId) cancelAnimationFrame(cursorRafId);
        cursorRafId = requestAnimationFrame(() => {
            cursor.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
        });
    });

    // Cursor hover effects
    const interactiveElements = document.querySelectorAll('button, a, .card-3d, .nav-link');
    interactiveElements.forEach(el => {
        let magneticRafId = null;

        el.addEventListener('mouseenter', () => {
            cursor.classList.add('scale-150', 'bg-white');
            cursor.style.mixBlendMode = 'difference';
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('scale-150', 'bg-white');
            cursor.style.mixBlendMode = 'difference';
            if (magneticRafId) cancelAnimationFrame(magneticRafId);
            el.style.transform = `translate3d(0, 0, 0) scale(1)`;
        });

        // --- MAGNETIC EFFECT ---
        el.addEventListener('mousemove', (e) => {
            if (magneticRafId) cancelAnimationFrame(magneticRafId);
            magneticRafId = requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate3d(${x * 0.2}px, ${y * 0.2}px, 0) scale(1.05)`;
            });
        });
    });

    window.closeMobileMenu = function () {
        if (menu) menu.classList.add('hidden');
    }

    // --- PORTFOLIO POPUP LOGIC ---
    function initPortfolioPopup() {
        const popup = document.createElement('div');
        popup.id = 'portfolio-popup';
        popup.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-500 backdrop-blur-md bg-black/60';
        popup.innerHTML = `
            <div class="relative max-w-md w-full glass-card p-8 rounded-3xl border border-white/20 shadow-2xl transform scale-90 translate-z-0 transition-all duration-500 group-active:scale-95" id="popup-content">
                <button id="close-popup" class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="text-center">
                    <div class="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 class="text-xl md:text-2xl font-bold text-white mb-4 leading-relaxed">
                        Photos View කරන්න ඕනි පහසුකම පස්සෙ Site Update එකකින් දෙන්නම්
                    </h3>
                    <div class="h-px w-12 bg-white/20 mx-auto mb-6"></div>
                    <p class="text-gray-400 text-sm mb-2 uppercase tracking-widest">Contact for more information</p>
                    <a href="mailto:legionzinfo@gmail.com" class="text-neon-blue font-bold hover:underline">legionzinfo@gmail.com</a>
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        const content = document.getElementById('popup-content');

        const showPopup = () => {
            popup.classList.remove('opacity-0', 'pointer-events-none');
            content.style.transform = 'perspective(1000px) rotateX(0deg) scale(1)';
        };

        const hidePopup = () => {
            popup.classList.add('opacity-0', 'pointer-events-none');
            content.style.transform = 'perspective(1000px) rotateX(20deg) scale(0.9)';
        };

        const portfolioItems = document.querySelectorAll('.portfolio-card');
        portfolioItems.forEach(item => {
            item.addEventListener('click', showPopup);
        });

        document.getElementById('close-popup').addEventListener('click', hidePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) hidePopup();
        });

        // Add Escape key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hidePopup();
        });
    }

    initPortfolioPopup();
});
