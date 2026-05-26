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

let cachedSections = [];

// Cache section offsets to prevent layout thrashing (Forced Synchronous Layout) on scroll
function cacheSectionDimensions() {
    const sections = document.querySelectorAll('.section, .hero');
    cachedSections = Array.from(sections).map(section => ({
        id: section.getAttribute('id'),
        top: section.offsetTop,
        height: section.offsetHeight
    }));
}

// Recalculate dimensions when page fully loads and when viewport changes size
window.addEventListener('load', cacheSectionDimensions);
window.addEventListener('resize', cacheSectionDimensions);

// Scroll effect with passive listener for maximum frame rate
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Add/remove class only when crossing the 50px boundary
    if (scrollY > 50) {
        if (!navbar.classList.contains('scrolled')) {
            navbar.classList.add('scrolled');
        }
    } else {
        if (navbar.classList.contains('scrolled')) {
            navbar.classList.remove('scrolled');
        }
    }
    updateActiveNav();
}, { passive: true });

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

// Active nav link on scroll (0 layout reflows!)
function updateActiveNav() {
    if (cachedSections.length === 0) {
        cacheSectionDimensions();
    }
    
    const scrollPos = window.scrollY + 150;

    for (let i = 0; i < cachedSections.length; i++) {
        const { id, top, height } = cachedSections[i];

        if (scrollPos >= top && scrollPos < top + height) {
            allNavLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                    if (!link.classList.contains('active')) {
                        // Clear active status of other links first
                        allNavLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
            break; // Active section found, exit early!
        }
    }
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
    cacheSectionDimensions();
    init3DTiltEffect();
    
    // Lightbox next/prev click event listeners
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox(1);
        });
    }
    
    // Lightbox keyboard navigation support
    window.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('photoLightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            } else if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            }
        }
    });
});

// ========================================
// DYNAMIC PARTICLE PLEXUS (GOOGLE-STYLE BACKGROUND)
// ========================================
function initInteractiveBackgroundPlexus() {
    // 1. DOM Setup
    const canvas = document.getElementById('interactive-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 2. Mouse/Touch Coordinates Tracking
    let mouse = { x: -1000, y: -1000, active: false };
    const supportsHover = window.matchMedia("(hover: hover)").matches;

    if (supportsHover) {
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

        // Click Gravity-Inversion Shockwave
        window.addEventListener('mousedown', () => {
            if (mouse.active) {
                triggerShockwave(mouse.x, mouse.y);
            }
        });
    } else {
        // Mobile tap/touchstart micro-interaction shockwave
        window.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                triggerShockwave(touchX, touchY);
            }
        }, { passive: true });
    }

    // 3. Responsive/Adaptive Particle Plexus Parameters
    let particles = [];
    let isMobileDevice = window.innerWidth <= 768;
    let maxParticles = isMobileDevice ? 60 : 220;
    let connectionDistance = isMobileDevice ? 55 : 80;
    
    const magneticRadius = 220;
    const magneticStrength = 0.45;
    const orbitalStrength = 0.35;
    const friction = 0.94;

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
            this.targetAlpha = Math.random() * 0.4 + 0.3; // 0.3 to 0.7 base opacity
            this.alpha = this.targetAlpha;
            this.maxLife = Math.random() * 400 + 400; // ~6.6s to 13.3s at 60fps
            this.life = Math.random() * this.maxLife; // Stagger initial lifetime to prevent bulk blinks
        }

        reset(atEdge = true) {
            if (atEdge) {
                // Respawn at a random edge of the screen
                const edge = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
                const offset = 10;
                if (edge === 0) {
                    this.x = Math.random() * canvas.width;
                    this.y = -offset;
                } else if (edge === 1) {
                    this.x = canvas.width + offset;
                    this.y = Math.random() * canvas.height;
                } else if (edge === 2) {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + offset;
                } else {
                    this.x = -offset;
                    this.y = Math.random() * canvas.height;
                }
            } else {
                // Respawn at a completely random position inside the canvas
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }

            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.baseVx = this.vx;
            this.baseVy = this.vy;
            this.radius = Math.random() * 2 + 1.2;
            this.color = activeColors[Math.floor(Math.random() * activeColors.length)];
            this.alpha = 0; // Start fully transparent
            this.targetAlpha = Math.random() * 0.4 + 0.3;
            this.maxLife = Math.random() * 400 + 400;
            this.life = this.maxLife;
        }

        update() {
            // Decrease life remaining
            this.life--;

            // Handle fading out when near death, or fading in when newly spawned
            if (this.life <= 0) {
                this.reset(false); // Respawn somewhere on the screen when dead of old age
            } else if (this.life < 50) {
                // Fade out before death
                this.alpha -= 0.015;
                if (this.alpha < 0) this.alpha = 0;
            } else if (this.alpha < this.targetAlpha) {
                // Fade in
                this.alpha += 0.015;
                if (this.alpha > this.targetAlpha) this.alpha = this.targetAlpha;
            }

            // Apply magnetic attraction to mouse cursor if mouse is nearby and particle is healthy
            if (mouse.active && this.life > 50) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 20) {
                    // Too close to mouse, initiate absorption and fade out
                    this.alpha -= 0.05;
                    if (this.alpha <= 0) {
                        this.reset(true); // Respawn at the edge
                    }
                } else if (dist < magneticRadius) {
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
        
        // Dynamically update parameters on layout changes/resize
        isMobileDevice = window.innerWidth <= 768;
        maxParticles = isMobileDevice ? 60 : 220;
        connectionDistance = isMobileDevice ? 55 : 80;
        
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
                    const lineAlpha = (1.0 - (dist / connectionDistance)) * 0.12;
                    
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

// ========================================
// INTERACTIVE GALLERY LOGIC
// ========================================

// 1. Handle missing images by dynamically showing a premium glass placeholder
function handleImageError(imgEl, placeholderTitle) {
    imgEl.style.display = 'none'; // Hide the broken image element
    
    // Hide the search search-plus hover overlay for empty slots
    const parent = imgEl.parentElement;
    const overlay = parent.querySelector('.item-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Prevent double generation of placeholder cards
    if (parent.querySelector('.gallery-placeholder-card')) return;
    
    // Determine icon based on category type in source path
    let iconClass = 'fa-image';
    if (imgEl.src.includes('billiards')) {
        iconClass = 'fa-8-ball';
    } else if (imgEl.src.includes('motorcycles')) {
        iconClass = 'fa-motorcycle';
    } else if (imgEl.src.includes('life')) {
        iconClass = 'fa-camera';
    }
    
    // Generate placeholder card
    const card = document.createElement('div');
    card.className = 'gallery-placeholder-card';
    card.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${placeholderTitle}</span>
        <p>Ảnh chưa tải lên</p>
    `;
    
    parent.appendChild(card);
    
    // Disable clicking lightbox for empty placeholders
    parent.style.cursor = 'default';
}

// 2. Expand clicked gallery frame and hide the other two frames smoothly
function expandGalleryFrame(frameId) {
    const frames = {
        'billiards': document.getElementById('frame-billiards'),
        'motorcycles': document.getElementById('frame-motorcycles'),
        'life': document.getElementById('frame-life')
    };
    
    const grids = {
        'billiards': document.getElementById('grid-billiards'),
        'motorcycles': document.getElementById('grid-motorcycles'),
        'life': document.getElementById('grid-life')
    };
    
    const container = document.getElementById('photoGridContainer');
    const titleEl = document.getElementById('gridTitle');
    
    if (!container || !titleEl) return;
    
    // Set titles based on category
    const titles = {
        'billiards': 'Album Bản Thân (Myself) 👤',
        'motorcycles': 'Album Xe Máy (Motorcycles) 🏍️',
        'life': 'Album Đời Thường (Daily) 📸'
    };
    
    titleEl.textContent = titles[frameId] || 'Album';
    
    // Transition frames: active scales up, others fade & collapse
    Object.keys(frames).forEach(key => {
        const frame = frames[key];
        if (frame) {
            if (key === frameId) {
                frame.classList.remove('collapsed-frame');
                frame.classList.add('active-frame');
            } else {
                frame.classList.remove('active-frame');
                frame.classList.add('collapsed-frame');
            }
        }
    });
    
    // Hide all grids first, then show the requested one
    Object.keys(grids).forEach(key => {
        const grid = grids[key];
        if (grid) {
            grid.style.display = key === frameId ? 'grid' : 'none';
        }
    });
    
    // Show container
    container.style.display = 'block';
    
    // Smoothly scroll to the active frame header
    setTimeout(() => {
        const activeFrame = frames[frameId];
        if (activeFrame) {
            activeFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 400);
}

// 3. Close the expanded category grid and restore all three frames
function closeExpandedFrame() {
    const frames = [
        document.getElementById('frame-billiards'),
        document.getElementById('frame-motorcycles'),
        document.getElementById('frame-life')
    ];
    
    const container = document.getElementById('photoGridContainer');
    
    // Restore all frames visibility
    frames.forEach(frame => {
        if (frame) {
            frame.classList.remove('active-frame', 'collapsed-frame');
        }
    });
    
    // Hide container
    if (container) {
        container.style.display = 'none';
    }
    
    // Smoothly scroll back to the gallery section header
    setTimeout(() => {
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// Global variables for lightbox slide navigation
let activeAlbumImages = [];
let currentImageIndex = -1;

// 4. Open image in lightbox (for valid images only)
function openLightbox(itemEl, imgSrc, captionText) {
    const img = itemEl.querySelector('img');
    // If the image is hidden (placeholder is active), do not open the lightbox
    if (img && img.style.display === 'none') {
        return;
    }
    
    const lightbox = document.getElementById('photoLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    
    if (!lightbox || !lightboxImg || !caption) return;
    
    // Find all valid images in the current active grid
    const activeGrid = itemEl.closest('.photo-grid');
    if (activeGrid) {
        const allItems = Array.from(activeGrid.querySelectorAll('.gallery-item'));
        // Filter out placeholders
        activeAlbumImages = allItems.filter(item => {
            const itemImg = item.querySelector('img');
            return itemImg && itemImg.style.display !== 'none';
        });
        currentImageIndex = activeAlbumImages.indexOf(itemEl);
    } else {
        activeAlbumImages = [itemEl];
        currentImageIndex = 0;
    }
    
    lightboxImg.src = imgSrc;
    
    if (captionText) {
        caption.textContent = captionText;
        caption.style.display = 'block';
    } else {
        caption.style.display = 'none';
    }
    
    lightbox.classList.add('active');
    updateLightboxNavArrows();
}

// 5. Update visibility of lightbox navigation arrows
function updateLightboxNavArrows() {
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (!prevBtn || !nextBtn) return;
    
    if (activeAlbumImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

// 6. Navigate lightbox images
function navigateLightbox(direction) {
    if (activeAlbumImages.length <= 1) return;
    
    currentImageIndex += direction;
    if (currentImageIndex < 0) {
        currentImageIndex = activeAlbumImages.length - 1;
    } else if (currentImageIndex >= activeAlbumImages.length) {
        currentImageIndex = 0;
    }
    
    const nextItem = activeAlbumImages[currentImageIndex];
    if (nextItem) {
        const nextImg = nextItem.querySelector('img');
        const lightboxImg = document.getElementById('lightboxImg');
        const caption = document.getElementById('lightboxCaption');
        
        if (nextImg && lightboxImg) {
            lightboxImg.style.opacity = 0;
            setTimeout(() => {
                lightboxImg.src = nextImg.src;
                lightboxImg.style.opacity = 1;
                
                // Keep caption hidden since caption is empty in inner grids
                if (caption) {
                    caption.style.display = 'none';
                }
            }, 150);
        }
    }
}

// 7. Close full-screen lightbox
function closeLightbox(event) {
    const lightbox = document.getElementById('photoLightbox');
    if (!lightbox) return;
    
    // Close if clicked close button, outside elements, or overlay background
    if (
        event.target.id === 'photoLightbox' || 
        event.target.classList.contains('lightbox-close') || 
        event.target.closest('.lightbox-close')
    ) {
        lightbox.classList.remove('active');
    }
}

// ========================================
// 3D PARALLAX TILT EFFECT FOR GALLERY FRAMES
// ========================================
function init3DTiltEffect() {
    const frames = document.querySelectorAll('.gallery-frame');
    
    frames.forEach(frame => {
        // Create glare element dynamically if it doesn't exist
        let glare = frame.querySelector('.frame-glare');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'frame-glare';
            frame.appendChild(glare);
        }

        frame.addEventListener('mousemove', (e) => {
            // Cancel tilt calculation if this frame is currently expanded/active
            if (frame.classList.contains('active-frame')) {
                frame.style.transform = '';
                glare.style.opacity = '0';
                return;
            }

            const rect = frame.getBoundingClientRect();
            const x = e.clientX - rect.left; // mouse X relative to card bounds
            const y = e.clientY - rect.top;  // mouse Y relative to card bounds
            
            const width = rect.width;
            const height = rect.height;
            
            // Calculate tilt angle based on hover positioning (max tilt 10 degrees)
            const maxTilt = 10;
            const tiltX = ((y / height) - 0.5) * -maxTilt * 2; // X-axis tilt (tilt up/down)
            const tiltY = ((x / width) - 0.5) * maxTilt * 2;  // Y-axis tilt (tilt left/right)
            
            // Rotate card around perspective field and scale up slightly on hover
            frame.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // Move glare radial gradient spotlight directly with cursor coordinates
            const glareX = (x / width) * 100;
            const glareY = (y / height) * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)`;
            glare.style.opacity = '1';
        });

        frame.addEventListener('mouseleave', () => {
            // Smoothly ease card back to flat baseline orientation on hover exit
            frame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            frame.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            glare.style.opacity = '0';
        });

        frame.addEventListener('mouseenter', () => {
            // Remove transitions temporarily on hover entry to prevent layout rendering stutter
            frame.style.transition = 'none';
        });
    });
}


