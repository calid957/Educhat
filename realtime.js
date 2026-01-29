// Real-time Functionality for All Features

class RealtimeManager {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.onlineUsers = new Map();
        this.activeChats = new Map();
        this.notifications = [];
        this.typingUsers = new Map();
        this.messageQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.initializeWebSocket();
        this.initializeEventListeners();
        this.startHeartbeat();
    }

    // Initialize WebSocket connection
    initializeWebSocket() {
        try {
            // Use localStorage events for cross-tab real-time communication
            // In production, replace with actual WebSocket URL
            this.initializeLocalStorageEvents();
            
            // Real WebSocket implementation (uncomment for production)
            // this.socket = new WebSocket('wss://your-websocket-server.com');
            // this.setupWebSocketListeners();
            
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
            this.initializeLocalStorageEvents();
        }
    }

    // Initialize localStorage events for real-time communication
    initializeLocalStorageEvents() {
        console.log('Initializing real-time connection with localStorage events...');
        
        // Listen for storage events (cross-tab communication)
        window.addEventListener('storage', (e) => {
            this.handleStorageEvent(e);
        });
        
        // Initialize current user in online users
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.addUserToOnlineList(currentUser);
            this.broadcastUserJoin(currentUser);
        }
    }

    // Add user to online list
    addUserToOnlineList(user) {
        const onlineUser = {
            id: user.email || user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
            email: user.email,
            role: user.accountType || user.role,
            status: 'online',
            avatar: user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U'),
            timestamp: Date.now()
        };
        
        this.onlineUsers.set(onlineUser.id, onlineUser);
        this.updateOnlineUsersList();
    }

    // Broadcast user join
    broadcastUserJoin(user) {
        this.sendRealtimeMessage({
            type: 'user_status',
            user: {
                id: user.email || user.id,
                name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
                email: user.email,
                role: user.accountType || user.role,
                status: 'online',
                avatar: user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : 'U')
            }
        });
    }

    // Setup real WebSocket events
    setupWebSocketEvents() {
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.authenticate();
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.attemptReconnection();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    // Attempt to reconnect WebSocket
    attemptReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.showNotification('Connection lost. Please refresh the page.', 'error');
        }
    }

    // Authenticate user
    authenticate() {
        const user = this.getCurrentUser();
        if (user) {
            this.sendRealtimeMessage({
                type: 'auth',
                userId: user.id,
                token: user.token
            });
        }
    }

    // Send real-time message
    sendRealtimeMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Fallback to local storage for demo
            this.sendLocalStorageMessage(message);
        }
    }

    // Send message via local storage (demo fallback)
    sendLocalStorageMessage(message) {
        const key = `realtime_${Date.now()}_${Math.random()}`;
        localStorage.setItem(key, JSON.stringify(message));
        
        // Clean up after sending
        setTimeout(() => {
            localStorage.removeItem(key);
        }, 1000);
    }

    // Handle storage events (cross-tab communication)
    handleStorageEvent(event) {
        if (event.key && event.key.startsWith('realtime_')) {
            try {
                const message = JSON.parse(event.newValue);
                this.handleRealtimeMessage(message);
            } catch (error) {
                console.error('Error parsing storage event:', error);
            }
        }
    }

    // Handle incoming real-time messages
    handleRealtimeMessage(data) {
        switch (data.type) {
            case 'message':
                this.handleNewMessage(data);
                break;
            case 'user_status':
                this.handleUserStatusUpdate(data);
                break;
            case 'typing':
                this.handleTypingIndicator(data);
                break;
            case 'notification':
                this.handleNotification(data);
                break;
            case 'user_list':
                this.handleUserListUpdate(data);
                break;
            case 'channel_update':
                this.handleChannelUpdate(data);
                break;
            case 'system_message':
                this.handleSystemMessage(data);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // Handle new message
    handleNewMessage(data) {
        const chatId = data.chatId || 'public';
        
        // Add message to chat
        this.addMessageToChat(chatId, data);
        
        // Update chat list
        this.updateChatListItem(chatId, data);
        
        // Show notification if not in active chat
        if (this.getActiveChatId() !== chatId) {
            this.showNotification(`${data.senderName}: ${data.message}`, 'message');
            this.incrementUnreadCount(chatId);
        }
        
        // Play notification sound
        this.playNotificationSound();
        
        // Trigger UI update
        this.triggerEvent('newMessage', data);
    }

    // Handle user status update
    handleUserStatusUpdate(data) {
        const user = data.user;
        
        if (user.status === 'offline') {
            // Remove user from online users
            this.onlineUsers.delete(user.id);
            this.showNotification(`${user.name} left the chat`, 'info');
        } else {
            // Add or update user in online users
            this.onlineUsers.set(user.id, user);
            if (user.status === 'online') {
                this.showNotification(`${user.name} joined the chat`, 'info');
            }
        }
        
        // Update online users list
        this.updateOnlineUsersList();
        
        // Update chat user status
        this.updateUserStatusInChat(user);
        
        // Trigger UI update
        this.triggerEvent('userStatusUpdate', user);
    }

    // Handle typing indicator
    handleTypingIndicator(data) {
        const chatId = data.chatId || 'public';
        const userId = data.userId;
        const isTyping = data.isTyping;
        
        if (isTyping) {
            this.typingUsers.set(userId, {
                name: data.userName,
                timestamp: Date.now()
            });
        } else {
            this.typingUsers.delete(userId);
        }
        
        // Update typing indicator UI
        this.updateTypingIndicator(chatId);
        
        // Clear typing indicator after timeout
        setTimeout(() => {
            if (this.typingUsers.has(userId)) {
                this.typingUsers.delete(userId);
                this.updateTypingIndicator(chatId);
            }
        }, 3000);
    }

    // Handle notification
    handleNotification(data) {
        this.showNotification(data.message, data.type || 'info');
        this.notifications.push(data);
        
        // Update notification badge
        this.updateNotificationBadge();
        
        // Trigger UI update
        this.triggerEvent('notification', data);
    }

    // Handle user list update
    handleUserListUpdate(data) {
        data.users.forEach(user => {
            this.onlineUsers.set(user.id, user);
        });
        
        this.updateOnlineUsersList();
        this.triggerEvent('userListUpdate', data.users);
    }

    // Handle channel update
    handleChannelUpdate(data) {
        const channel = data.channel;
        this.activeChats.set(channel.id, channel);
        
        this.updateChannelInList(channel);
        this.triggerEvent('channelUpdate', channel);
    }

    // Handle system message
    handleSystemMessage(data) {
        this.showNotification(data.message, 'system');
        this.addSystemMessageToChat(data.chatId, data.message);
    }

    // Send message to chat
    sendMessage(chatId, message, type = 'text') {
        const user = this.getCurrentUser();
        if (!user) return;

        const messageData = {
            type: 'message',
            chatId: chatId,
            message: message,
            senderId: user.id,
            senderName: user.name,
            timestamp: Date.now(),
            messageType: type
        };

        // Send to server
        this.sendRealtimeMessage(messageData);
        
        // Add to local chat immediately
        this.addMessageToChat(chatId, messageData);
        
        // Update typing indicator
        this.sendTypingIndicator(chatId, false);
    }

    // Send typing indicator
    sendTypingIndicator(chatId, isTyping) {
        const user = this.getCurrentUser();
        if (!user) return;

        this.sendRealtimeMessage({
            type: 'typing',
            chatId: chatId,
            userId: user.id,
            userName: user.name,
            isTyping: isTyping
        });
    }

    // Add message to chat UI
    addMessageToChat(chatId, messageData) {
        const messagesArea = document.getElementById('messagesArea');
        if (!messagesArea) return;

        const messageElement = this.createMessageElement(messageData);
        messagesArea.appendChild(messageElement);
        
        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Add animation
        messageElement.classList.add('message-appear');
    }

    // Create message element
    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.senderId === this.getCurrentUser()?.id ? 'sent' : 'received'} mb-4 animate-fade-in`;
        
        const isOwn = messageData.senderId === this.getCurrentUser()?.id;
        
        messageDiv.innerHTML = `
            <div class="flex ${isOwn ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs lg:max-w-md">
                    <div class="immersive-glass rounded-2xl p-3 ${isOwn ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : ''}">
                        ${!isOwn ? `<div class="text-xs text-white/70 mb-1">${messageData.senderName}</div>` : ''}
                        <div class="text-white">${this.formatMessage(messageData.message, messageData.messageType)}</div>
                        <div class="text-xs text-white/50 mt-1">${this.formatTime(messageData.timestamp)}</div>
                    </div>
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    // Format message content
    formatMessage(message, type) {
        switch (type) {
            case 'image':
                return `<img src="${message}" alt="Image" class="rounded-lg max-w-full">`;
            case 'file':
                return `<div class="flex items-center"><i class="fas fa-file mr-2"></i>${message}</div>`;
            case 'emoji':
                return message;
            default:
                return this.escapeHtml(message);
        }
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format timestamp
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Update online users list
    updateOnlineUsersList() {
        const onlineUsersContainer = document.getElementById('onlineUsers');
        if (!onlineUsersContainer) return;

        onlineUsersContainer.innerHTML = '';
        
        this.onlineUsers.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'flex items-center p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors interactive-hover';
            userElement.innerHTML = `
                <div class="relative">
                    <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div class="ml-3">
                    <div class="text-white text-sm font-medium">${user.name}</div>
                    <div class="text-white/60 text-xs">${user.status || 'Online'}</div>
                </div>
            `;
            
            userElement.onclick = () => this.startPrivateChat(user);
            onlineUsersContainer.appendChild(userElement);
        });
    }

    // Update typing indicator
    updateTypingIndicator(chatId) {
        const typingContainer = document.getElementById('typingIndicator');
        if (!typingContainer) return;

        if (this.typingUsers.size > 0) {
            const names = Array.from(this.typingUsers.values()).map(u => u.name);
            const text = names.length === 1 ? `${names[0]} is typing...` : `${names.join(', ')} are typing...`;
            
            typingContainer.innerHTML = `
                <div class="text-white/60 text-sm italic flex items-center">
                    <div class="typing-dots mr-2">
                        <span></span><span></span><span></span>
                    </div>
                    ${text}
                </div>
            `;
            typingContainer.style.display = 'block';
        } else {
            typingContainer.style.display = 'none';
        }
    }

    // Start private chat
    startPrivateChat(user) {
        const chatId = `private_${user.id}`;
        this.selectChat(chatId, user.name);
        
        // Add to chat list if not exists
        if (!this.activeChats.has(chatId)) {
            this.activeChats.set(chatId, {
                id: chatId,
                name: user.name,
                type: 'private',
                user: user
            });
            this.updateChatList();
        }
    }

    // Select chat
    selectChat(chatId, chatName) {
        // Update UI
        document.getElementById('chatName').textContent = chatName;
        document.getElementById('chatStatus').textContent = 'Active now';
        
        // Clear messages
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.innerHTML = '';
        
        // Load chat history
        this.loadChatHistory(chatId);
        
        // Mark as read
        this.markChatAsRead(chatId);
        
        // Update active state
        this.updateActiveChatState(chatId);
    }

    // Load chat history
    loadChatHistory(chatId) {
        const history = this.getChatHistory(chatId);
        history.forEach(message => {
            this.addMessageToChat(chatId, message);
        });
    }

    // Get chat history from localStorage
    getChatHistory(chatId) {
        const key = `chat_history_${chatId}`;
        const history = localStorage.getItem(key);
        return history ? JSON.parse(history) : [];
    }

    // Save message to history
    saveMessageToHistory(chatId, message) {
        const history = this.getChatHistory(chatId);
        history.push(message);
        
        // Keep only last 100 messages
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem(`chat_history_${chatId}`, JSON.stringify(history));
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `immersive-glass p-4 mb-2 text-white animate-slide-in ${
            type === 'error' ? 'border-red-500/30' : 
            type === 'success' ? 'border-green-500/30' : 
            'border-blue-500/30'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'success' ? 'fa-check-circle' : 
                    'fa-info-circle'
                } mr-3"></i>
                <div class="flex-1">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/70 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to notification container
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'fixed top-4 right-4 z-50 max-w-sm';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Play notification sound
    playNotificationSound() {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Get current user
    getCurrentUser() {
        if (!this.currentUser) {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        }
        return this.currentUser;
    }

    // Get active chat ID
    getActiveChatId() {
        return localStorage.getItem('activeChatId') || 'public';
    }

    // Increment unread count
    incrementUnreadCount(chatId) {
        const key = `unread_${chatId}`;
        const count = parseInt(localStorage.getItem(key) || '0');
        localStorage.setItem(key, (count + 1).toString());
        this.updateUnreadBadges();
    }

    // Update unread badges
    updateUnreadBadges() {
        // Update chat list badges
        document.querySelectorAll('.chat-item').forEach(item => {
            const chatId = item.dataset.chatId;
            const count = parseInt(localStorage.getItem(`unread_${chatId}`) || '0');
            const badge = item.querySelector('.unread-badge');
            
            if (count > 0) {
                if (!badge) {
                    const badgeElement = document.createElement('span');
                    badgeElement.className = 'unread-badge bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2';
                    badgeElement.textContent = count;
                    item.querySelector('.flex').appendChild(badgeElement);
                } else {
                    badge.textContent = count;
                }
            } else if (badge) {
                badge.remove();
            }
        });
    }

    // Mark chat as read
    markChatAsRead(chatId) {
        localStorage.setItem('activeChatId', chatId);
        localStorage.removeItem(`unread_${chatId}`);
        this.updateUnreadBadges();
    }

    // Start heartbeat
    startHeartbeat() {
        setInterval(() => {
            this.sendRealtimeMessage({
                type: 'heartbeat',
                timestamp: Date.now()
            });
        }, 30000); // Every 30 seconds
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            let typingTimeout;
            
            messageInput.addEventListener('input', () => {
                clearTimeout(typingTimeout);
                this.sendTypingIndicator(this.getActiveChatId(), true);
                
                typingTimeout = setTimeout(() => {
                    this.sendTypingIndicator(this.getActiveChatId(), false);
                }, 1000);
            });
            
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(this.getActiveChatId(), messageInput.value);
                    messageInput.value = '';
                }
            });
        }
        
        // Window focus/blur
        window.addEventListener('focus', () => {
            this.markChatAsRead(this.getActiveChatId());
        });
        
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.broadcastUserLeave();
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.broadcastUserStatus('away');
            } else {
                this.broadcastUserStatus('online');
            }
        });
    }

    // Broadcast user leave
    broadcastUserLeave() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.sendRealtimeMessage({
                type: 'user_status',
                user: {
                    id: currentUser.email || currentUser.id,
                    name: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name,
                    email: currentUser.email,
                    status: 'offline'
                }
            });
        }
    }

    // Broadcast user status change
    broadcastUserStatus(status) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.sendRealtimeMessage({
                type: 'user_status',
                user: {
                    id: currentUser.email || currentUser.id,
                    name: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.name,
                    email: currentUser.email,
                    status: status
                }
            });
        }
    }

    // Trigger custom event
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
}

// Initialize real-time manager
let realtimeManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    realtimeManager = new RealtimeManager();
    
    // Make it globally available
    window.realtimeManager = realtimeManager;
    
    // Initialize chat functionality
    initializeChatRealtime();
});

// Initialize chat real-time functionality
function initializeChatRealtime() {
    // Override existing chat functions to use real-time
    if (typeof sendMessage === 'function') {
        const originalSendMessage = sendMessage;
        window.sendMessage = function(event) {
            event.preventDefault();
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (message) {
                realtimeManager.sendMessage(realtimeManager.getActiveChatId(), message);
                messageInput.value = '';
            }
        };
    }
    
    // Override selectChat function
    if (typeof selectChat === 'function') {
        const originalSelectChat = selectChat;
        window.selectChat = function(chatType, chatName) {
            const chatId = chatType === 'public' ? 'public' : `${chatType}_${chatName}`;
            realtimeManager.selectChat(chatId, chatName);
            
            // Update tab states
            document.querySelectorAll('[id$="Tab"]').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`${chatType}Tab`).classList.add('active');
        };
    }
}

// Export for use in other files
window.RealtimeManager = RealtimeManager;
