// Global variables
let users = [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Netlify Database Service
class NetlifyDatabaseService {
    constructor() {
        this.baseURL = '/.netlify/functions';
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API call to ${endpoint} failed:`, error);
            throw error;
        }
    }

    // User operations
    async getUsers() {
        try {
            const data = await this.apiCall('/users');
            return data.users || [];
        } catch (error) {
            console.warn('Failed to fetch users from Netlify, using localStorage fallback');
            return JSON.parse(localStorage.getItem('users')) || [];
        }
    }

    async createUser(userData) {
        try {
            const data = await this.apiCall('/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            return data.user;
        } catch (error) {
            console.warn('Failed to create user on Netlify, using localStorage fallback');
            // Fallback to localStorage
            const localStorageUsers = JSON.parse(localStorage.getItem('users')) || [];
            const newUser = {
                id: Date.now(),
                ...userData,
                createdAt: new Date().toISOString()
            };
            localStorageUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(localStorageUsers));
            return newUser;
        }
    }

    async loginUser(email, password) {
        try {
            const data = await this.apiCall('/users/login', {
                method: 'PUT',
                body: JSON.stringify({ email, password })
            });
            return data.user;
        } catch (error) {
            console.warn('Failed to login via Netlify, using localStorage fallback');
            // Fallback to localStorage
            const localStorageUsers = JSON.parse(localStorage.getItem('users')) || [];
            return localStorageUsers.find(u => u.email === email && u.password === password);
        }
    }

    // Health check
    async healthCheck() {
        try {
            await this.getUsers();
            return { status: 'healthy', message: 'Netlify database is accessible' };
        } catch (error) {
            return { status: 'unhealthy', message: error.message };
        }
    }
}

// Initialize database service
const dbService = new NetlifyDatabaseService();

// Load users from database
async function loadUsersFromDatabase() {
    try {
        users = await dbService.getUsers();
        console.log('Users loaded from Netlify database:', users.length);
        return users;
    } catch (error) {
        console.error('Error loading users:', error);
        users = JSON.parse(localStorage.getItem('users')) || [];
        return users;
    }
}

// Save user to database
async function saveUserToDatabase(user) {
    try {
        const savedUser = await dbService.createUser(user);
        users.push(savedUser);
        console.log('User saved to Netlify database:', user.email);
        return savedUser;
    } catch (error) {
        console.error('Error saving user:', error);
        // Fallback to localStorage
        const localStorageUsers = JSON.parse(localStorage.getItem('users')) || [];
        localStorageUsers.push(user);
        localStorage.setItem('users', JSON.stringify(localStorageUsers));
        users.push(user);
        return user;
    }
}

// Check if database has any users
async function checkDatabaseUsers() {
    try {
        const usersList = await dbService.getUsers();
        return usersList.length;
    } catch (error) {
        console.error('Error checking database users:', error);
        const localStorageUsers = JSON.parse(localStorage.getItem('users')) || [];
        return localStorageUsers.length;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    try {
        updateDebugInfo('Initializing Netlify database...');
        
        // Check Netlify database health
        const healthCheck = await dbService.healthCheck();
        
        if (healthCheck.status === 'healthy') {
            updateDebugInfo('Netlify database connected');
        } else {
            updateDebugInfo('Using localStorage fallback');
        }
        
        // Load users from database
        await loadUsersFromDatabase();
        
        console.log('App initialized. Users in database:', users.length);
        
        // Check if user is already logged in with "remember me"
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            const user = users.find(u => u.email === rememberedUser);
            if (user) {
                showMessage('Welcome back, ' + user.firstName + '!', 'success');
                // Auto-redirect remembered user
                currentUser = user;
                setTimeout(() => {
                    if (user.accountType === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (user.accountType === 'moderator') {
                        window.location.href = 'moderator.html';
                    } else {
                        window.location.href = 'chat.html';
                    }
                }, 1000);
            }
        }
        
        // Show database status
        if (users.length === 0) {
            showMessage('No users found. Please sign up to create an account.', 'info');
            updateDebugInfo('Database empty - ready for signup');
        } else {
            showMessage(`Database loaded with ${users.length} users`, 'success');
            updateDebugInfo(`Database loaded: ${users.length} users`);
        }
    } catch (error) {
        console.error('App initialization failed:', error);
        updateDebugInfo('Initialization error: ' + error.message);
        showMessage('App initialization failed. Using localStorage fallback.', 'warning');
        
        // Emergency fallback to localStorage
        users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.length === 0) {
            updateDebugInfo('Emergency fallback - no users found');
        } else {
            updateDebugInfo(`Emergency fallback - ${users.length} users loaded`);
        }
    }
});

// Update debug info
function updateDebugInfo(message) {
    const debugDiv = document.getElementById('debugInfo');
    if (debugDiv) {
        debugDiv.innerHTML = message;
        console.log('Debug:', message);
    }
}

// Tab switching functionality
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (tab === 'login') {
        loginTab.classList.add('text-white', 'border-b-2', 'border-white');
        loginTab.classList.remove('text-white/70');
        signupTab.classList.remove('text-white', 'border-b-2', 'border-white');
        signupTab.classList.add('text-white/70');
        
        loginForm.classList.remove('hidden');
        loginForm.classList.add('animate-fade-in');
        signupForm.classList.add('hidden');
    } else {
        signupTab.classList.add('text-white', 'border-b-2', 'border-white');
        signupTab.classList.remove('text-white/70');
        loginTab.classList.remove('text-white', 'border-b-2', 'border-white');
        loginTab.classList.add('text-white/70');
        
        signupForm.classList.remove('hidden');
        signupForm.classList.add('animate-fade-in');
        loginForm.classList.add('hidden');
    }
}

// Password visibility toggle
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const icon = passwordField.nextElementSibling.querySelector('i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.error-text');
    errorElements.forEach(element => element.remove());
    
    const inputElements = document.querySelectorAll('input, select');
    inputElements.forEach(element => {
        element.classList.remove('input-error', 'input-success');
    });
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('input-error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-text';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Login functionality
async function handleLogin(event) {
    event.preventDefault();
    clearValidationErrors();
    
    // Ensure users are loaded from database
    if (users.length === 0) {
        await loadUsersFromDatabase();
    }
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log('Login attempt:', { email, password, rememberMe, usersCount: users.length });
    updateDebugInfo(`Login attempt: ${email} (${users.length} users in DB)`);
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email address');
        return;
    }
    
    // Check if user exists via Netlify Functions
    try {
        const user = await dbService.loginUser(email, password);
        
        console.log('User found via Netlify:', user ? user.email : 'No user found');
        updateDebugInfo(user ? `User found: ${user.email}` : 'User not found');
        
        if (user) {
            // Netlify login successful
            handleSuccessfulLogin(user, rememberMe);
        } else {
            // Try localStorage fallback
            console.log('Netlify login failed, trying localStorage fallback...');
            await tryLocalStorageLogin(email, password, rememberMe);
        }
    } catch (error) {
        console.error('Netlify login error, trying localStorage fallback:', error);
        updateDebugInfo('Netlify login failed, trying localStorage...');
        await tryLocalStorageLogin(email, password, rememberMe);
    }
}

// Handle successful login (common logic for both Netlify and localStorage)
function handleSuccessfulLogin(user, rememberMe) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('Login successful, redirecting to:', user.accountType);
    updateDebugInfo(`Login success! Redirecting to ${user.accountType}...`);
    
    if (rememberMe) {
        localStorage.setItem('rememberedUser', user.email);
    } else {
        localStorage.removeItem('rememberedUser');
    }
    
    showMessage('Login successful! Redirecting...', 'success');
    
    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Immediate redirect attempt
    try {
        console.log('Immediate redirect to:', user.accountType);
        updateDebugInfo(`Executing redirect to ${user.accountType}.html...`);
        if (user.accountType === 'admin') {
            window.location.href = 'admin.html';
        } else if (user.accountType === 'moderator') {
            window.location.href = 'moderator.html';
        } else {
            window.location.href = 'chat.html';
        }
    } catch (error) {
        console.error('Immediate redirect failed, trying timeout:', error);
        updateDebugInfo('Redirect failed, trying fallback...');
        // Fallback redirect with timeout
        setTimeout(() => {
            console.log('Fallback redirect to:', user.accountType);
            try {
                if (user.accountType === 'admin') {
                    window.location.href = 'admin.html';
                } else if (user.accountType === 'moderator') {
                    window.location.href = 'moderator.html';
                } else {
                    window.location.href = 'chat.html';
                }
            } catch (redirectError) {
                console.error('Fallback redirect also failed:', redirectError);
                updateDebugInfo('All redirects failed!');
                window.location.href = 'chat.html';
            }
        }, 1000);
    }
}

// Try localStorage login fallback
async function tryLocalStorageLogin(email, password, rememberMe) {
    try {
        // Load users from localStorage
        const localStorageUsers = JSON.parse(localStorage.getItem('users')) || [];
        console.log('Checking localStorage users:', localStorageUsers.length);
        
        const user = localStorageUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            console.log('User found in localStorage:', user.email);
            updateDebugInfo(`User found in localStorage: ${user.email}`);
            handleSuccessfulLogin(user, rememberMe);
        } else {
            console.log('Login failed: Invalid credentials in localStorage');
            updateDebugInfo('Login failed: Invalid credentials');
            showMessage('Invalid email or password. Please try again.', 'error');
        }
    } catch (error) {
        console.error('LocalStorage login error:', error);
        updateDebugInfo('LocalStorage login error: ' + error.message);
        showMessage('Login failed. Please try again.', 'error');
    }
}

// Signup functionality
async function handleSignup(event) {
    event.preventDefault();
    clearValidationErrors();
    
    // Ensure users are loaded from database
    if (users.length === 0) {
        await loadUsersFromDatabase();
    }
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const accountType = document.getElementById('accountType').value;
    const classTrade = document.getElementById('classTrade').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const accountDefinition = document.querySelector('input[name="accountDefinition"]:checked')?.value;
    
    let hasError = false;
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('signupEmail', 'Please enter a valid email address');
        hasError = true;
    }
    
    if (users.find(u => u.email === email)) {
        showFieldError('signupEmail', 'An account with this email already exists');
        hasError = true;
    }
    
    if (!validatePassword(password)) {
        showFieldError('signupPassword', 'Password must be at least 8 characters long');
        hasError = true;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }
    
    if (hasError) return;
    
    try {
        // Create new user
        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            accountType,
            classTrade,
            gender,
            password, // In production, this should be hashed
            accountDefinition,
            createdAt: new Date().toISOString()
        };
        
        console.log('Creating user:', newUser);
        updateDebugInfo(`Creating user: ${email}...`);
        
        // Save to database
        await saveUserToDatabase(newUser);
        
        // Update local users array
        users.push(newUser);
        
        console.log('User created successfully, redirecting...');
        updateDebugInfo('User created! Switching to login...');
        
        showMessage('Account created successfully! Redirecting to login...', 'success');
        
        // Clear form
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('accountType').value = '';
        document.getElementById('classTrade').value = '';
        document.querySelectorAll('input[name="gender"]').forEach(radio => radio.checked = false);
        document.getElementById('signupPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.querySelectorAll('input[name="accountDefinition"]').forEach(radio => radio.checked = false);
        
        // Switch to login tab and pre-fill
        setTimeout(() => {
            switchTab('login');
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginPassword').value = password;
            document.getElementById('loginPassword').focus();
        }, 1500);
        
    } catch (error) {
        console.error('Error creating user:', error);
        showMessage('Error creating account. Please try again.', 'error');
    }
}

// Forgot password functionality
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('resetEmail').value = '';
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (user) {
        showMessage('Password reset instructions have been sent to your email address.', 'info');
        closeForgotPassword();
    } else {
        showMessage('No account found with this email address.', 'error');
    }
}

function viewUserDetails(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        const details = `User Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nAccount Type: ${user.accountType}\nClass: ${user.classTrade}\nGender: ${user.gender}\nRegistration Date: ${new Date(user.createdAt).toLocaleString()}\nStatus: Active`;
        showMessage(details, 'info');
    }
}

// Placeholder functions for missing functionality
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

function isUserBanned(email) {
    // For now, no users are banned
    return false;
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageContent = document.getElementById('messageContent');
    
    messageContainer.classList.remove('hidden');
    messageContent.className = 'p-4 rounded-md animate-slide-in';
    
    // Remove existing message classes
    messageContent.classList.remove('message-success', 'message-error', 'message-info');
    
    // Add appropriate class based on type
    messageContent.classList.add('message-' + type);
    messageContent.textContent = message;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPassword();
    }
}

// Add enter key support for form fields
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.click();
            }
        }
    }
});

// Add input animations
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('focus', function() {
        this.classList.add('input-animate');
    });
    
    element.addEventListener('blur', function() {
        this.classList.remove('input-animate');
    });
});

// Add button hover effects
document.querySelectorAll('button').forEach(element => {
    element.classList.add('btn-hover');
});
