// ========================================
// TYPING ANIMATION
// ========================================
const typingTexts = ["IT Student", "Billiards Lover", "Motorcycle Enthusiast", "Content Creator", "Dreamer"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 80;
const deletingSpeed = 50;
const pauseTime = 2000;

function typeText() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const currentText = typingTexts[textIndex];

    if (isDeleting) {
        el.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        el.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentText.length) {
        speed = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typingTexts.length;
        speed = 400;
    }

    setTimeout(typeText, speed);
}

// ========================================
// NAVBAR
// ========================================
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const navHamburger = document.getElementById('navHamburger');
const allNavLinks = document.querySelectorAll('.nav-link');

// Scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveNav();
});

// Hamburger toggle
navHamburger.addEventListener('click', () => {
    navHamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

// Close mobile menu on link click
allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// Active nav link on scroll
function updateActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            allNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ========================================
// THEME TOGGLE
// ========================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// ========================================
// SCROLL REVEAL ANIMATION
// ========================================
function revealOnScroll() {
    const reveals = document.querySelectorAll('[data-reveal]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for sibling elements
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('[data-reveal]');
                let delay = 0;
                
                siblings.forEach((sibling, i) => {
                    if (sibling === entry.target) {
                        delay = i * 100;
                    }
                });
                
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
}

// ========================================
// SMOOTH SCROLL
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    typeText();
    revealOnScroll();
    initInteractiveBackgroundPlexus();
});

// ========================================
// DYNAMIC PARTICLE PLEXUS (GOOGLE-STYLE BACKGROUND)
// ========================================
function initInteractiveBackgroundPlexus() {
    // 1. Mobile & Hover Capability Detection
    const isMobile = window.innerWidth <= 768;
    const supportsHover = window.matchMedia("(hover: hover)").matches;
    
    if (isMobile || !supportsHover) {
        return; // Silent exit on mobile/tablet screens that do not support hover/pointer interaction
    }

    // 2. DOM Setup
    const canvas = document.getElementById('interactive-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 3. Mouse Coordinates Tracking
    let mouse = { x: -1000, y: -1000, active: false };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseenter', () => {
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // 4. Click Gravity-Inversion Shockwave
    window.addEventListener('mousedown', () => {
        if (mouse.active) {
            triggerShockwave(mouse.x, mouse.y);
        }
    });

    // 5. Particle Plexus Engine
    let particles = [];
    const maxParticles = 80;
    const magneticRadius = 220;
    const magneticStrength = 0.45;
    const orbitalStrength = 0.35;
    const friction = 0.94;
    const connectionDistance = 110;

    // Fetch theme colors dynamically
    function getThemeColors() {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLightTheme) {
            return [
                '0, 180, 220',  // Cyan/Blue
                '124, 58, 237', // Violet
                '220, 80, 150'  // Pink
            ];
        } else {
            return [
                '0, 212, 255',  // Neon Cyan
                '124, 58, 237', // Violet
                '244, 114, 182' // Neon Pink
            ];
        }
    }

    let activeColors = getThemeColors();

    // Re-check theme on changes
    const themeObserver = new MutationObserver(() => {
        activeColors = getThemeColors();
    });
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    class Particle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.baseVx = this.vx;
            this.baseVy = this.vy;
            this.radius = Math.random() * 2 + 1.2; // 1.2px to 3.2px
            this.color = activeColors[Math.floor(Math.random() * activeColors.length)];
            this.alpha = Math.random() * 0.4 + 0.3; // 0.3 to 0.7 base opacity
        }

        update() {
            // Apply magnetic attraction to mouse cursor if mouse is nearby
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < magneticRadius) {
                    // Attraction force decreases with distance
                    const force = (magneticRadius - dist) / magneticRadius;
                    
                    // Gravitational pull force vector
                    const pullX = (dx / dist) * force * magneticStrength;
                    const pullY = (dy / dist) * force * magneticStrength;

                    // Tangent orbital force to create swirling effect (perpendicular to pull)
                    const perpX = (-dy / dist) * force * orbitalStrength;
                    const perpY = (dx / dist) * force * orbitalStrength;

                    // Apply physics forces
                    this.vx += pullX + perpX;
                    this.vy += pullY + perpY;
                }
            }

            // Apply friction/drag to stabilize movements
            this.vx *= friction;
            this.vy *= friction;

            // Maintain a subtle base float drift when far away
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed < 0.2) {
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;
            }

            // Apply speed caps
            const maxSpeed = 7;
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Boundaries bounce
            if (this.x < 0) {
                this.x = 0;
                this.vx *= -1;
            } else if (this.x > canvas.width) {
                this.x = canvas.width;
                this.vx *= -1;
            }

            if (this.y < 0) {
                this.y = 0;
                this.vy *= -1;
            } else if (this.y > canvas.height) {
                this.y = canvas.height;
                this.vy *= -1;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.fill();
        }
    }

    // Initialize Canvas Particles
    function initParticles() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    initParticles();

    // Handle Window Resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initParticles();
        }, 200);
    });

    // 6. Click Shockwave Force
    function triggerShockwave(x, y) {
        const shockwaveRadius = 250;
        const shockwaveForce = 22;

        particles.forEach(p => {
            const dx = p.x - x;
            const dy = p.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < shockwaveRadius) {
                // Blast force is strongest at center
                const force = (shockwaveRadius - dist) / shockwaveRadius;
                const pushX = (dx / (dist || 1)) * force * shockwaveForce;
                const pushY = (dy / (dist || 1)) * force * shockwaveForce;

                // Instantly blow particles outward
                p.vx += pushX;
                p.vy += pushY;
            }
        });
    }

    // 7. Render/Animation Loop
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // B. Google-style Plexus Network Lines
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const lineAlpha = (1.0 - (dist / connectionDistance)) * 0.16;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    ctx.strokeStyle = `rgba(${p1.color}, ${lineAlpha})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Pause animation if window is hidden to conserve CPU/Battery
    let isPageVisible = true;
    document.addEventListener('visibilitychange', () => {
        isPageVisible = document.visibilityState === 'visible';
    });

    // Start loop
    requestAnimationFrame(function frame() {
        if (isPageVisible) {
            animate();
        } else {
            requestAnimationFrame(frame);
        }
    });
}


