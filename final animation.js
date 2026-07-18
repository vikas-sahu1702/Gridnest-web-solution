javascript


// animation.js
// Advanced Animation Functions
class PremiumAnimations {
    constructor() {
        this.initialized = false;
        this.scrollProgress = document.createElement('div');
        this.parallaxElements = [];
        this.tiltCards = [];
    }
    
    init() {
        if (this.initialized) return;
        
        this.setupScrollProgress();
        this.setupParallax();
        this.setupTiltCards();
        this.setupHoverEffects();
        this.setupStaggerAnimations();
        
        this.initialized = true;
    }
    
    // Scroll Progress Indicator
    setupScrollProgress() {
        this.scrollProgress.className = 'scroll-progress';
        document.body.appendChild(this.scrollProgress);
        
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            this.scrollProgress.style.width = scrolled + '%';
        });
    }
    
    // Parallax Effect
    setupParallax() {
        this.parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            this.parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        });
    }
    
    // 3D Tilt Cards
    setupTiltCards() {
        this.tiltCards = document.querySelectorAll('.tilt-card');
        
        this.tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const cardRect = card.getBoundingClientRect();
                const x = e.clientX - cardRect.left;
                const y = e.clientY - cardRect.top;
                
                const centerX = cardRect.width / 2;
                const centerY = cardRect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * 10;
                const rotateY = ((centerX - x) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }
    
    // Advanced Hover Effects
    setupHoverEffects() {
        const hoverElements = document.querySelectorAll('.hover-glow, .hover-scale, .hover-lift');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (element.classList.contains('hover-glow')) {
                    element.style.boxShadow = '0 0 30px rgba(37, 99, 235, 0.4)';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (element.classList.contains('hover-glow')) {
                    element.style.boxShadow = '';
                }
            });
        });
    }
    
    // Staggered Animations
    setupStaggerAnimations() {
        const staggerContainers = document.querySelectorAll('.stagger-container');
        
        staggerContainers.forEach(container => {
            // Check if container is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const children = Array.from(container.children);
                        children.forEach((child, index) => {
                            child.style.animationDelay = `${index * 0.1}s`;
                            child.classList.add('fade-in');
                        });
                        observer.unobserve(container);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(container);
        });
    }
    
    // Text Typing Animation
    typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Particle System
    createParticles(container, count = 50) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 5 + 2;
            const posX = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 3;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            // Random color
            const colors = ['#1F2937', '#F97316', '#8B5CF6', '#10B981'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            
            container.appendChild(particle);
        }
    }
    
    // Gradient Animation
    animateGradient(element) {
        let hue = 0;
        
        function updateGradient() {
            hue = (hue + 1) % 360;
            element.style.background = `linear-gradient(45deg, hsl(${hue}, 100%, 50%), hsl(${(hue + 60) % 360}, 100%, 50%))`;
            requestAnimationFrame(updateGradient);
        }
        
        updateGradient();
    }
    
    // Scroll Triggered Animations
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.animate;
                    
                    switch(animationType) {
                        case 'fade':
                            element.classList.add('fade-in', 'visible');
                            break;
                        case 'slide-left':
                            element.classList.add('slide-left', 'visible');
                            break;
                        case 'slide-right':
                            element.classList.add('slide-right', 'visible');
                            break;
                        case 'zoom':
                            element.classList.add('zoom-in', 'visible');
                            break;
                    }
                    
                    scrollObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }
    
    // Magnetic Button Effect
    setupMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic');
        
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) * 0.3;
                const deltaY = (y - centerY) * 0.3;
                
                button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }
    
    // Wave Effect
    createWaveEffect(element) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        element.appendChild(wave);
    }
    
    // Glitch Text Effect
    setupGlitchText() {
        const glitchElements = document.querySelectorAll('.glitch');
        
        glitchElements.forEach(element => {
            const text = element.textContent;
            element.setAttribute('data-text', text);
        });
    }
    
    // Initialize Everything
    start() {
        this.init();
        this.setupScrollAnimations();
        this.setupMagneticButtons();
        this.setupGlitchText();
        
        // Create particles in specific containers
        const particleContainers = document.querySelectorAll('.particles');
        particleContainers.forEach(container => {
            this.createParticles(container, 30);
        });
        
        // Animate gradients
        const gradientElements = document.querySelectorAll('.animate-gradient');
        gradientElements.forEach(element => {
            this.animateGradient(element);
        });
        
        // Add wave effects
        const waveElements = document.querySelectorAll('.wave-container');
        waveElements.forEach(element => {
            this.createWaveEffect(element);
        });
        
        // Typewriter effect for specific elements
        const typewriterElements = document.querySelectorAll('.typewriter');
        typewriterElements.forEach(element => {
            const text = element.textContent;
            this.typeWriter(element, text, 50);
        });
    }
}
// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animations = new PremiumAnimations();
    animations.start();
    
    // Add floating animation to elements
    const floatElements = document.querySelectorAll('.float-animation');
    floatElements.forEach((element, index) => {
        const speed = ['slow', 'medium', 'fast'][index % 3];
        element.classList.add(`float-${speed}`);
    });
    
    // Add shimmer effect to loading elements
    const shimmerElements = document.querySelectorAll('.shimmer');
    shimmerElements.forEach(element => {
        element.style.animationDelay = `${Math.random() * 2}s`;
    });
    
    // Setup ripple buttons
    const rippleButtons = document.querySelectorAll('.ripple');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = 'ripple-effect';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple effect
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
});
// Smooth Scroll Enhancement
class SmoothScroll {
    constructor() {
        this.scrollPosition = 0;
        this.scrollTarget = 0;
        this.scrollEase = 0.1;
        this.isScrolling = false;
        
        this.init();
    }
    
    init() {
        // Only enable on desktop
        if (window.innerWidth > 768) {
            this.setupSmoothScroll();
        }
    }
    
    setupSmoothScroll() {
        // Disable default scroll
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        
        // Create scroll container
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'smooth-scroll-container';
        this.scrollContainer.style.position = 'fixed';
        this.scrollContainer.style.top = '0';
        this.scrollContainer.style.left = '0';
        this.scrollContainer.style.width = '100%';
        this.scrollContainer.style.height = '100%';
        this.scrollContainer.style.overflow = 'hidden';
        
        // Move content into scroll container
        const content = document.querySelector('body > *:not(script)');
        this.scrollContainer.appendChild(content);
        document.body.appendChild(this.scrollContainer);
        
        // Create inner container
        this.innerContainer = document.createElement('div');
        this.innerContainer.className = 'smooth-scroll-inner';
        this.innerContainer.style.position = 'absolute';
        this.innerContainer.style.top = '0';
        this.innerContainer.style.left = '0';
        this.innerContainer.style.width = '100%';
        
        // Move content into inner container
        while (this.scrollContainer.firstChild) {
            this.innerContainer.appendChild(this.scrollContainer.firstChild);
        }
        this.scrollContainer.appendChild(this.innerContainer);
        
        // Set initial height
        this.updateHeight();
        
        // Animation loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.updateHeight());
        
        // Handle mouse wheel
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scrollTarget += e.deltaY;
            this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.maxScroll));
        });
        
        // Handle touch events
        let touchStart = 0;
        let touchScroll = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
            touchScroll = this.scrollTarget;
        });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            this.scrollTarget = touchScroll + (touchStart - touchY);
            this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, this.maxScroll));
        });
    }
    
    updateHeight() {
        const contentHeight = this.innerContainer.scrollHeight;
        this.scrollContainer.style.height = '100%';
        this.maxScroll = contentHeight - window.innerHeight;
    }
    
    animate() {
        this.scrollPosition += (this.scrollTarget - this.scrollPosition) * this.scrollEase;
        
        if (Math.abs(this.scrollTarget - this.scrollPosition) < 0.1) {
            this.scrollPosition = this.scrollTarget;
        }
        
        this.innerContainer.style.transform = `translate3d(0, -${this.scrollPosition}px, 0)`;
        
        requestAnimationFrame(() => this.animate());
    }
}
// Initialize smooth scroll on demand
if (window.innerWidth > 768 && false) { // Disabled by default
    new SmoothScroll();
}