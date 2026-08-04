/* ==========================================================
   RONGLIX.COM - Main JavaScript
   Core functionality: nav, scroll, reveal, counters, etc.
   ========================================================== */

(function () {
    'use strict';

    // ----- Loader -----
    window.addEventListener('load', () => {
        const loader = document.querySelector('.loader');
        if (loader) {
            setTimeout(() => loader.classList.add('hidden'), 400);
        }
        // Initialise modules after load
        initReveal();
        initCounters();
        initHeader();
        initNavToggle();
        initBackToTop();
        initForms();
        initActiveLink();
        if (typeof window.RonglixFX !== 'undefined') {
            window.RonglixFX.initParticles();
            window.RonglixFX.initNetwork();
        }
        if (typeof window.RonglixUI !== 'undefined') {
            window.RonglixUI.initTerminal();
            window.RonglixUI.initMatrix();
            window.RonglixUI.initTilt();
        }
    });

    // ----- Sticky header on scroll -----
    function initHeader() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 30) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ----- Mobile nav toggle -----
    function initNavToggle() {
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.main-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('nav-open', isOpen);
            // swap icon
            const iconOpen = toggle.querySelector('.icon-open');
            const iconClose = toggle.querySelector('.icon-close');
            if (iconOpen && iconClose) {
                iconOpen.style.display = isOpen ? 'none' : 'block';
                iconClose.style.display = isOpen ? 'block' : 'none';
            }
        });

        // close when clicking a nav link on mobile
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    document.body.classList.remove('nav-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    const iconOpen = toggle.querySelector('.icon-open');
                    const iconClose = toggle.querySelector('.icon-close');
                    if (iconOpen && iconClose) {
                        iconOpen.style.display = 'block';
                        iconClose.style.display = 'none';
                    }
                }
            });
        });
    }

    // ----- Reveal on scroll -----
    function initReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        if (!('IntersectionObserver' in window)) {
            reveals.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        reveals.forEach(el => observer.observe(el));
    }

    // ----- Counter animation -----
    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        if (!('IntersectionObserver' in window)) return;

        const animate = el => {
            const target = parseFloat(el.dataset.counter);
            const suffix = el.dataset.suffix || '';
            const duration = 1800;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const val = target * eased;
                let display;
                if (Number.isInteger(target)) {
                    display = Math.floor(val).toLocaleString();
                } else {
                    display = val.toFixed(1);
                }
                el.textContent = display + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    // ----- Back to top -----
    function initBackToTop() {
        const btn = document.querySelector('.back-top');
        if (!btn) return;

        const onScroll = () => {
            if (window.scrollY > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ----- Form handling (Contact / Newsletter) -----
    function initForms() {
        const forms = document.querySelectorAll('form[data-form]');
        forms.forEach(form => {
            form.addEventListener('submit', e => {
                e.preventDefault();
                const status = form.querySelector('.form-status');
                const btn = form.querySelector('button[type="submit"]');
                if (!btn) return;

                const original = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<span class="loading-dots"><span></span><span></span><span></span></span>';

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = original;
                    if (status) {
                        status.classList.add('success');
                        status.textContent = '// transmission complete — we will respond within 24h.';
                    }
                    form.reset();
                }, 1400);
            });
        });
    }

    // ----- Mark active nav link -----
    function initActiveLink() {
        const links = document.querySelectorAll('.nav-link');
        const path = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (href === path || (path === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // ----- Tabs (services page) -----
    document.addEventListener('click', e => {
        if (e.target.matches('.tab-btn')) {
            const key = e.target.dataset.tab;
            const tabsNav = e.target.closest('.tabs');
            if (!tabsNav) return;

            tabsNav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabsNav.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            const pane = tabsNav.querySelector(`#tab-${key}`);
            if (pane) pane.classList.add('active');
        }
    });

    // ----- Legal page TOC active highlight -----
    const tocLinks = document.querySelectorAll('.legal-toc a');
    if (tocLinks.length && 'IntersectionObserver' in window) {
        const sections = Array.from(tocLinks).map(link => {
            const id = link.getAttribute('href');
            if (id && id.startsWith('#')) return document.querySelector(id);
            return null;
        }).filter(Boolean);

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = '#' + entry.target.id;
                    tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    // ----- Smooth scroll for hash links -----
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ----- Console signature -----
    if (window.console && console.log) {
        const styles = [
            'background: linear-gradient(135deg,#00f0ff,#b06bff)',
            'color:#05060a',
            'font-family:monospace',
            'font-size:14px',
            'font-weight:bold',
            'padding:8px 14px',
            'border-radius:4px'
        ].join(';');
        console.log('%c ronglix.com // system online ', styles);
        console.log('%c> Building calm, secure, minimal software since 2024.', 'color:#00f0ff;font-family:monospace');
        console.log('%c> Interested in collaboration? → contact@ronglix.com', 'color:#b06bff;font-family:monospace');
    }

})();