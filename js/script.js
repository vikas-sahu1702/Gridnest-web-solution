// script.js
// DOM Elements
const loadingScreen = document.querySelector('.loading-screen');
const mouseGlow = document.querySelector('.mouse-glow');
const navbar = document.querySelector('.navbar');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const backToTop = document.querySelector('.back-to-top');
const newsletterModal = document.getElementById('newsletterModal');
const modalClose = document.getElementById('modalClose');
const newsletterForm = document.getElementById('newsletterForm');
const statNumbers = document.querySelectorAll('.stat-number');
// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});
// Mouse Glow Effect
document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = `${e.clientX}px`;
    mouseGlow.style.top = `${e.clientY}px`;
    mouseGlow.style.opacity = '1';
});
document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
});
// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
        backToTop.style.display = 'flex';
    } else {
        navbar.classList.remove('scrolled');
        backToTop.style.display = 'none';
    }
});
// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});
// Back to Top
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}
// Intersection Observer for Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add animation classes
            entry.target.classList.add('visible');
            
            // Animate counters
            if (entry.target.classList.contains('stat-number')) {
                animateCounter(entry.target);
            }
        }
    });
}, observerOptions);
// Observe elements
document.querySelectorAll('.fade-in, .zoom-in, .slide-left, .slide-right, .stat-number').forEach(element => {
    observer.observe(element);
});
// Newsletter Modal
setTimeout(() => {
    if (!localStorage.getItem('newsletterShown')) {
        newsletterModal.style.display = 'flex';
    }
}, 3000);
modalClose.addEventListener('click', () => {
    newsletterModal.style.display = 'none';
    localStorage.setItem('newsletterShown', 'true');
});
// Newsletter Form Submission
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const email = emailInput.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return;
    }

    const API_BASE = window.location.origin + '/api';
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    fetch(API_BASE + '/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(result => {
        const modalBody = document.querySelector('.modal-body');
        if (result.data.success) {
            modalBody.innerHTML = `
                <h3 class="modal-title">Success!</h3>
                <p class="modal-description">Thank you for subscribing to our newsletter.</p>
                <div class="success-icon">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: #2563EB;"></i>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <h3 class="modal-title">Note</h3>
                <p class="modal-description">${result.data.message || 'Subscription failed. Please try again.'}</p>
                <button class="btn btn-outline" onclick="location.reload()">Try Again</button>
            `;
        }
        setTimeout(() => {
            newsletterModal.style.display = 'none';
            localStorage.setItem('newsletterShown', 'true');
        }, 2500);
    })
    .catch(error => {
        console.error('Newsletter subscription error:', error);
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        alert('Network error. Please try again later.');
    });
});
// Close modal when clicking outside
newsletterModal.addEventListener('click', (e) => {
    if (e.target === newsletterModal) {
        newsletterModal.style.display = 'none';
        localStorage.setItem('newsletterShown', 'true');
    }
});
// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
// Form Validation (for contact forms on other pages)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}
// Add error styling
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #EF4444 !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
    }
    
    .error-message {
        color: #EF4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
`;
document.head.appendChild(style);
// Image Lazy Loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            const tooltipText = element.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
});
// Add tooltip styling
const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
    .tooltip {
        position: fixed;
        background-color: var(--dark);
        color: var(--white);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        z-index: 10000;
        pointer-events: none;
        white-space: nowrap;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: var(--dark) transparent transparent transparent;
    }
`;
document.head.appendChild(tooltipStyle);

