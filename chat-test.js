// Simplified chat test
console.log('chat-test.js loading...');

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Test chat DOM loaded');
    
    if (!currentUser) {
        console.log('No user found, redirecting...');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('User found:', currentUser.firstName);
    
    try {
        // Test basic DOM access
        const messagesArea = document.getElementById('messagesArea');
        const typingIndicator = document.getElementById('typingIndicator');
        const messageInput = document.getElementById('messageInput');
        
        if (messagesArea) {
            messagesArea.innerHTML = `<p>Chat loaded successfully for ${currentUser.firstName}!</p>`;
        }
        
        if (typingIndicator) {
            typingIndicator.textContent = 'Chat ready';
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const message = this.value.trim();
                    if (message) {
                        const messageEl = document.createElement('div');
                        messageEl.className = 'p-2 bg-blue-600 rounded mb-2';
                        messageEl.textContent = `${currentUser.firstName}: ${message}`;
                        messagesArea.appendChild(messageEl);
                        this.value = '';
                    }
                }
            });
        }
        
        console.log('Test chat initialized successfully');
        
    } catch (error) {
        console.error('Test chat initialization failed:', error);
    }
});
