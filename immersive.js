// Immersive Website Experience JavaScript

// Initialize immersive effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeImmersiveEffects();
    initializeMagneticButtons();
    initializeRippleEffects();
    initializeScrollEffects();
    initializeParallaxEffects();
});

// Initialize all immersive effects
function initializeImmersiveEffects() {
    // Add stagger animation to elements
    const staggerElements = document.querySelectorAll('.stagger-animation > *');
    staggerElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    // Add page transition animation
    const pageContent = document.querySelector('.page-transition');
    if (pageContent) {
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            pageContent.style.transition = 'all 0.6s ease-out';
            pageContent.style.opacity = '1';
            pageContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.interactive-hover');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Magnetic button effect
function initializeMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.magnetic-button');
    
    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = x * 0.3;
            const moveY = y * 0.3;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });
}

// Ripple effect for buttons
function initializeRippleEffects() {
    const rippleButtons = document.querySelectorAll('.ripple');
    
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Scroll effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        
        // Add parallax effect to floating elements
        const floatingElements = document.querySelectorAll('.float-animation');
        floatingElements.forEach(el => {
            const speed = 0.5;
            const yPos = -(scrollTop * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        // Add fade-in effect to elements as they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.stagger-animation > *').forEach(el => {
            observer.observe(el);
        });
        
        lastScrollTop = scrollTop;
    });
}

// Parallax background effects
function initializeParallaxEffects() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.particles-container .particle');
        
        parallaxElements.forEach((el, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Enhanced tab switching with animation
function switchTab(tabName) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Add transition effect
    const forms = [loginForm, signupForm];
    forms.forEach(form => {
        form.style.opacity = '0';
        form.style.transform = 'translateX(-20px)';
    });
    
    setTimeout(() => {
        if (tabName === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
        
        // Fade in new form
        const activeForm = tabName === 'login' ? loginForm : signupForm;
        activeForm.style.opacity = '1';
        activeForm.style.transform = 'translateX(0)';
    }, 200);
}

// Enhanced password toggle with animation
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target;
    
    // Add rotation animation to icon
    icon.style.transition = 'transform 0.3s ease';
    icon.style.transform = 'rotateY(180deg)';
    
    setTimeout(() => {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
        
        icon.style.transform = 'rotateY(0deg)';
    }, 150);
}

// Enhanced form submission with loading state
function handleLogin(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Add loading state
    submitButton.innerHTML = '<div class="immersive-loader inline-block mr-2"></div> Signing in...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Your existing login logic here
        console.log('Login submitted');
        
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function handleSignup(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Add loading state
    submitButton.innerHTML = '<div class="immersive-loader inline-block mr-2"></div> Creating account...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Your existing signup logic here
        console.log('Signup submitted');
        
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Enhanced forgot password with animation
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.transition = 'all 0.3s ease';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.transition = 'all 0.3s ease';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Add loading state
    submitButton.innerHTML = '<div class="immersive-loader inline-block mr-2"></div> Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Your existing forgot password logic here
        console.log('Password reset submitted');
        
        // Show success message
        showMessage('Password reset link sent to your email!', 'success');
        
        // Close modal
        closeForgotPassword();
        
        // Reset button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Enhanced message display with animation
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    const messageContent = document.getElementById('messageContent');
    
    messageContent.textContent = message;
    messageContent.className = `p-4 rounded-md immersive-glass text-white`;
    
    // Add type-specific styling
    if (type === 'success') {
        messageContent.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))';
        messageContent.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    } else if (type === 'error') {
        messageContent.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))';
        messageContent.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    } else {
        messageContent.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))';
        messageContent.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    }
    
    messageContainer.classList.remove('hidden');
    messageContainer.style.opacity = '0';
    messageContainer.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        messageContainer.style.transition = 'all 0.3s ease';
        messageContainer.style.opacity = '1';
        messageContainer.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 300);
    }, 5000);
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Press 'Escape' to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Press 'Tab' to navigate through form fields
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll('input, button, select, textarea, a[href]');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Performance optimization - throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-based animations here
}, 100));

// Add resize handler for responsive adjustments
window.addEventListener('resize', debounce(function() {
    // Handle responsive adjustments
    adjustLayoutForScreenSize();
}, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function adjustLayoutForScreenSize() {
    const width = window.innerWidth;
    
    // Adjust particle system for mobile
    const particles = document.querySelectorAll('.particle');
    if (width < 768) {
        particles.forEach(particle => {
            particle.style.display = 'none';
        });
    } else {
        particles.forEach(particle => {
            particle.style.display = 'block';
        });
    }
    
    // Adjust font sizes for different screen sizes
    const titles = document.querySelectorAll('.immersive-title');
    if (width < 768) {
        titles.forEach(title => {
            title.style.fontSize = '2.5rem';
        });
    } else if (width < 1024) {
        titles.forEach(title => {
            title.style.fontSize = '3.5rem';
        });
    } else {
        titles.forEach(title => {
            title.style.fontSize = '4rem';
        });
    }
}

// Initialize responsive adjustments
adjustLayoutForScreenSize();
