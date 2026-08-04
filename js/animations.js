/* ==========================================================
   RONGLIX.COM - Animation Modules
   Particles, network graph, terminal, matrix, etc.
   ========================================================== */

window.RonglixFX = (function () {
    'use strict';

    // ----- Hero Particle Field -----
    function initParticles() {
        const canvas = document.getElementById('hero-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let w, h, particles;

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            w = canvas.width = rect.width * dpr;
            h = canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.scale(dpr, dpr);
            createParticles(rect.width, rect.height);
        };

        const createParticles = (cw, ch) => {
            const count = Math.min(90, Math.floor((cw * ch) / 18000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * cw,
                y: Math.random() * ch,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.7 ? '#b06bff' : (Math.random() > 0.5 ? '#00f0ff' : '#ff2e88')
            }));
        };

        let mouse = { x: -1000, y: -1000 };
        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        const tick = () => {
            ctx.clearRect(0, 0, w / dpr, h / dpr);
            if (!particles) return;

            // update + draw
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w / dpr) p.vx *= -1;
                if (p.y < 0 || p.y > h / dpr) p.vy *= -1;

                // mouse repel
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const force = (100 - dist) / 100;
                    p.x += (dx / dist) * force * 1.5;
                    p.y += (dy / dist) * force * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
                ctx.fill();
            });

            // connect nearby
            ctx.shadowBlur = 0;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        const op = 1 - dist / 130;
                        ctx.strokeStyle = `rgba(0, 240, 255, ${op * 0.25})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(tick);
        };

        resize();
        tick();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });
    }

    // ----- Hero Network Lines -----
    function initNetwork() {
        const canvas = document.getElementById('hero-network');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 1;

            const step = 80;
            for (let x = 0; x < canvas.width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        resize();
        draw();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { resize(); draw(); }, 200);
        });
    }

    return { initParticles, initNetwork };
})();


// ==========================================================
// RonglixUI - misc UI effects
// ==========================================================
window.RonglixUI = (function () {
    'use strict';

    // ----- Terminal Typewriter -----
    function initTerminal() {
        const term = document.querySelector('[data-terminal]');
        if (!term) return;

        const lines = JSON.parse(term.getAttribute('data-terminal'));
        const body = term.querySelector('.terminal-body');
        if (!body || !lines) return;

        let lineIdx = 0;

        const writeLine = () => {
            if (lineIdx >= lines.length) {
                // loop after pause
                setTimeout(() => {
                    body.innerHTML = '';
                    lineIdx = 0;
                    writeLine();
                }, 4500);
                return;
            }

            const line = lines[lineIdx];
            const div = document.createElement('div');
            div.className = 'terminal-line';
            body.appendChild(div);

            let charIdx = 0;
            const typeChar = () => {
                if (charIdx < line.text.length) {
                    div.innerHTML = (line.prompt ? `<span class="terminal-prompt">${line.prompt}</span>` : '') +
                        line.text.substring(0, charIdx + 1) + '<span class="terminal-cursor"></span>';
                    charIdx++;
                    setTimeout(typeChar, line.speed || 30);
                } else {
                    div.innerHTML = (line.prompt ? `<span class="terminal-prompt">${line.prompt}</span>` : '') +
                        line.text;
                    if (line.class) div.classList.add(line.class);
                    lineIdx++;
                    setTimeout(writeLine, line.delay || 600);
                }
            };
            typeChar();
        };

        setTimeout(writeLine, 800);
    }

    // ----- Matrix rain -----
    function initMatrix() {
        const containers = document.querySelectorAll('[data-matrix]');
        if (!containers.length) return;

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]|/\\';

        containers.forEach(container => {
            const canvas = document.createElement('canvas');
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            const resize = () => {
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            };
            resize();

            const cols = Math.floor(canvas.width / 18);
            const drops = Array(cols).fill(0).map(() => Math.random() * canvas.height / 18);

            const draw = () => {
                ctx.fillStyle = 'rgba(5, 6, 10, 0.08)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#00f0ff';
                ctx.font = '14px monospace';

                for (let i = 0; i < cols; i++) {
                    const ch = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillStyle = Math.random() > 0.98 ? '#ffffff' : '#00f0ff';
                    ctx.fillText(ch, i * 18, drops[i] * 18);
                    drops[i] += 0.7;
                    if (drops[i] * 18 > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                }
            };

            setInterval(draw, 60);

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resize, 200);
            });
        });
    }

    // ----- Tilt on hover -----
    function initTilt() {
        const cards = document.querySelectorAll('.tilt');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
                card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ----- Cursor follower (subtle dot) -----
    function initCursor() {
        if (window.innerWidth < 768) return;
        if (document.querySelector('.cursor-dot')) return;

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 8px; height: 8px;
            background: #00f0ff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            mix-blend-mode: screen;
            transition: transform 0.15s ease, opacity 0.2s ease;
            box-shadow: 0 0 15px #00f0ff;
            opacity: 0;
        `;
        document.body.appendChild(dot);

        let tx = 0, ty = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', e => {
            tx = e.clientX;
            ty = e.clientY;
            dot.style.opacity = '1';
        });
        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
        });

        const animate = () => {
            cx += (tx - cx) * 0.18;
            cy += (ty - cy) * 0.18;
            dot.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
            requestAnimationFrame(animate);
        };
        animate();
    }

    return { initTerminal, initMatrix, initTilt, initCursor };
})();


// ==========================================================
// Misc utilities
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Year auto update
    const yearEl = document.querySelectorAll('[data-year]');
    yearEl.forEach(el => el.textContent = new Date().getFullYear());

    // Random glitch text in titles
    const glitchEls = document.querySelectorAll('.glitch');
    glitchEls.forEach(el => {
        if (!el.dataset.text) el.dataset.text = el.textContent;
    });
});