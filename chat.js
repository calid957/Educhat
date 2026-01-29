// Global variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentChat = { type: 'public', name: 'Public Chat' };
let messages = [];
let channels = [];
let privateChats = [];
let onlineUsers = [];
let db = null;

// Initialize database for chat
async function initializeChatDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ImmersiveAppDB', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains('messages')) {
                const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                messagesStore.createIndex('chatId', 'chatId', { unique: false });
                messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('users')) {
                const usersStore = db.createObjectStore('users', { keyPath: 'email' });
                usersStore.createIndex('accountType', 'accountType', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('channels')) {
                const channelsStore = db.createObjectStore('channels', { keyPath: 'id', autoIncrement: true });
                channelsStore.createIndex('type', 'type', { unique: false });
                channelsStore.createIndex('createdBy', 'createdBy', { unique: false });
            }
            
            console.log('Database schema created');
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('Chat database initialized');
            resolve(db);
        };
    });
}

// Load messages from database
async function loadMessagesFromDatabase() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const request = store.getAll();
        
        request.onsuccess = () => {
            messages = request.result;
            console.log('Messages loaded from database:', messages.length);
            resolve(messages);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Save message to database
async function saveMessageToDatabase(message) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const request = store.add(message);
        
        request.onsuccess = () => {
            console.log('Message saved to database');
            resolve(request.result);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Load channels from database
async function loadChannelsFromDatabase() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['channels'], 'readonly');
        const store = transaction.objectStore('channels');
        const request = store.getAll();
        
        request.onsuccess = () => {
            channels = request.result;
            console.log('Channels loaded from database:', channels.length);
            resolve(channels);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Save channel to database
async function saveChannelToDatabase(channel) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['channels'], 'readwrite');
        const store = transaction.objectStore('channels');
        const request = store.put(channel);
        
        request.onsuccess = () => {
            console.log('Channel saved to database');
            resolve(request.result);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Initialize database with timeout
        const dbPromise = initializeChatDatabase();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
        );
        
        await Promise.race([dbPromise, timeoutPromise]);
        
        // Load data from database with fallback
        try {
            await loadMessagesFromDatabase();
        } catch (error) {
            console.warn('Failed to load messages from database, using empty array:', error);
            messages = { public: [], private: {}, groups: {} };
        }
        
        loadChannels(); // Changed from loadChannelsFromDatabase()
        
        initializeChat();
        
        // Load online users with error handling
        try {
            await loadOnlineUsers();
        } catch (error) {
            console.warn('Failed to load online users:', error);
        }
        
        setupRealtimeListeners();
        setupTypingIndicator();
        
        console.log('Chat initialized successfully');
        
        // Hide any loading messages
        const loadingElements = document.querySelectorAll('.loading-message');
        loadingElements.forEach(el => el.style.display = 'none');
        
    } catch (error) {
        console.error('Chat initialization failed:', error);
        
        // Fallback initialization
        try {
            messages = { public: [], private: {}, groups: {} };
            channels = [];
            onlineUsers = [];
            initializeChat();
            setupTypingIndicator();
            console.log('Chat initialized with fallback mode');
            
            // Hide loading messages
            const loadingElements = document.querySelectorAll('.loading-message');
            loadingElements.forEach(el => el.style.display = 'none');
            
        } catch (fallbackError) {
            console.error('Fallback initialization also failed:', fallbackError);
            showMessage('Failed to initialize chat. Please refresh the page.', 'error');
        }
    }
});

// Initialize chat
function initializeChat() {
    // Initialize message storage for different chat types
    if (!messages.public) {
        messages.public = [];
    }
    if (!messages.private) {
        messages.private = {};
    }
    if (!messages.groups) {
        messages.groups = {};
    }
    
    // Set initial chat
    selectChat('public', 'Public Chat');
}

// Switch between chat types
function switchChatType(type) {
    // Update tab styles
    const tabs = ['public', 'private', 'groups'];
    tabs.forEach(tab => {
        const tabElement = document.getElementById(tab + 'Tab');
        if (tab === type) {
            tabElement.classList.add('bg-white/20');
            tabElement.classList.remove('hover:bg-white/10');
        } else {
            tabElement.classList.remove('bg-white/20');
            tabElement.classList.add('hover:bg-white/10');
        }
    });
    
    // Update chat list
    updateChatList(type);
}

// Update chat list based on type
function updateChatList(type) {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';
    
    if (type === 'public') {
        // Public chat
        chatList.innerHTML = `
            <div onclick="selectChat('public', 'Public Chat')" class="chat-item glass p-3 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        <i class="fas fa-globe"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-white font-medium">Public Chat</h3>
                        <p class="text-white/60 text-sm">All users</p>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'private') {
        // Private chats
        const users = getOtherUsers();
        users.forEach(user => {
            const chatId = getPrivateChatId(currentUser.email, user.email);
            const lastMessage = messages.private[chatId] && messages.private[chatId].length > 0 
                ? messages.private[chatId][messages.private[chatId].length - 1] 
                : null;
            
            chatList.innerHTML += `
                <div onclick="selectChat('private', '${user.email}', '${user.firstName} ${user.lastName}')" class="chat-item glass p-3 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <h3 class="text-white font-medium">${user.firstName} ${user.lastName}</h3>
                            <p class="text-white/60 text-sm truncate">${lastMessage ? lastMessage.text : 'No messages yet'}</p>
                        </div>
                        ${lastMessage ? `<span class="text-white/40 text-xs">${formatTime(lastMessage.timestamp)}</span>` : ''}
                    </div>
                </div>
            `;
        });
    } else if (type === 'groups') {
        // Group channels
        channels.forEach(channel => {
            const lastMessage = messages.groups[channel.id] && messages.groups[channel.id].length > 0 
                ? messages.groups[channel.id][messages.groups[channel.id].length - 1] 
                : null;
            
            chatList.innerHTML += `
                <div onclick="selectChat('groups', '${channel.id}', '${channel.name}')" class="chat-item glass p-3 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-${channel.type === 'public' ? 'globe' : 'lock'}"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <h3 class="text-white font-medium">${channel.name}</h3>
                            <p class="text-white/60 text-sm truncate">${lastMessage ? lastMessage.text : channel.description}</p>
                        </div>
                        ${lastMessage ? `<span class="text-white/40 text-xs">${formatTime(lastMessage.timestamp)}</span>` : ''}
                    </div>
                </div>
            `;
        });
    }
}

// Select a chat
function selectChat(type, id, name = null) {
    currentChat = { type, id, name: name || id };
    
    // Update chat header
    const chatName = document.getElementById('chatName');
    const chatStatus = document.getElementById('chatStatus');
    const chatAvatar = document.getElementById('chatAvatar');
    
    chatName.textContent = name || id;
    
    if (type === 'public') {
        chatStatus.textContent = 'All users • ' + onlineUsers.length + ' online';
        chatAvatar.innerHTML = '<i class="fas fa-globe"></i>';
        chatAvatar.className = 'w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white';
    } else if (type === 'private') {
        chatStatus.textContent = 'Private conversation';
        chatAvatar.innerHTML = '<i class="fas fa-user"></i>';
        chatAvatar.className = 'w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white';
    } else if (type === 'groups') {
        const channel = channels.find(c => c.id === id);
        chatStatus.textContent = channel.type === 'public' ? 'Public group' : 'Private group';
        chatAvatar.innerHTML = '<i class="fas fa-' + (channel.type === 'public' ? 'globe' : 'lock') + '"></i>';
        chatAvatar.className = 'w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white';
    }
    
    // Load messages
    loadMessages();
}

// Load messages for current chat
function loadMessages() {
    const messagesArea = document.getElementById('messagesArea');
    let chatMessages = [];
    
    if (currentChat.type === 'public') {
        chatMessages = messages.public || [];
    } else if (currentChat.type === 'private') {
        const chatId = getPrivateChatId(currentUser.email, currentChat.id);
        chatMessages = messages.private[chatId] || [];
    } else if (currentChat.type === 'groups') {
        chatMessages = messages.groups[currentChat.id] || [];
    }
    
    if (chatMessages.length === 0) {
        messagesArea.innerHTML = `
            <div class="text-center text-white/60 py-8">
                <i class="fas fa-comments text-4xl mb-4"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    messagesArea.innerHTML = '';
    chatMessages.forEach(message => {
        addMessageToUI(message);
    });
    
    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send message
async function sendMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        id: Date.now(),
        senderId: currentUser.email,
        senderName: currentUser.firstName + ' ' + currentUser.lastName,
        message: text,
        timestamp: Date.now(),
        messageType: 'text'
    };
    
    // Add message to appropriate storage
    if (currentChat.type === 'public') {
        message.chatId = 'public';
    } else if (currentChat.type === 'private') {
        message.chatId = getPrivateChatId(currentUser.email, currentChat.id);
    } else if (currentChat.type === 'groups') {
        message.chatId = currentChat.id;
    }
    
    try {
        // Save to database
        await saveMessageToDatabase(message);
        
        // Send via real-time manager
        if (window.realtimeManager) {
            window.realtimeManager.sendRealtimeMessage({
                type: 'message',
                chatId: message.chatId,
                message: message.message,
                senderId: message.senderId,
                senderName: message.senderName,
                timestamp: message.timestamp,
                messageType: message.messageType
            });
        }
        
        // Add to UI
        addMessageToUI(message);
        
        // Clear input
        input.value = '';
        
        // Scroll to bottom
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    }
}

// Add message to UI
function addMessageToUI(message) {
    const messagesArea = document.getElementById('messagesArea');
    const isOwnMessage = message.senderId === currentUser.email;
    
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`;
    
    messageElement.innerHTML = `
        <div class="max-w-xs lg:max-w-md">
            <div class="immersive-glass p-3 rounded-2xl ${isOwnMessage ? 'bg-blue-500/30' : 'bg-white/20'}">
                ${!isOwnMessage ? `<p class="text-white/80 text-xs mb-1">${message.senderName}</p>` : ''}
                <p class="text-white">${message.message || message.text}</p>
            </div>
            <p class="text-white/40 text-xs mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}">${formatTime(message.timestamp)}</p>
        </div>
    `;
    
    messagesArea.appendChild(messageElement);
}

// Display message (for real-time messages)
function displayMessage(messageData) {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;
    
    const isOwnMessage = messageData.senderId === currentUser.email;
    
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`;
    
    messageElement.innerHTML = `
        <div class="max-w-xs lg:max-w-md">
            <div class="immersive-glass p-3 rounded-2xl ${isOwnMessage ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : ''}">
                ${!isOwnMessage ? `<div class="text-xs text-white/70 mb-1">${messageData.senderName}</div>` : ''}
                <div class="text-white">${messageData.message}</div>
                <div class="text-xs text-white/50 mt-1">${formatTime(messageData.timestamp)}</div>
            </div>
        </div>
    `;
    
    messagesArea.appendChild(messageElement);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    
    return date.toLocaleDateString();
}

// Get private chat ID
function getPrivateChatId(email1, email2) {
    return [email1, email2].sort().join('-');
}

// Get other users
function getOtherUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.filter(user => user.email !== currentUser.email);
}

// Load online users
async function loadOnlineUsers() {
    try {
        // Load users from database
        const allUsers = await loadUsersFromDatabase();
        const users = allUsers.filter(user => user.email !== currentUser.email);
        const onlineUsersDiv = document.getElementById('onlineUsers');
        
        onlineUsersDiv.innerHTML = '';
        
        // Get online users from real-time manager if available
        let realOnlineUsers = [];
        if (window.realtimeManager && window.realtimeManager.onlineUsers) {
            realOnlineUsers = Array.from(window.realtimeManager.onlineUsers.values());
        }
        
        // Display users who are actually online
        users.forEach(user => {
            const isOnline = realOnlineUsers.some(onlineUser => onlineUser.email === user.email);
            
            if (isOnline) {
                onlineUsersDiv.innerHTML += `
                    <div class="flex items-center p-2 glass rounded-lg cursor-pointer hover:bg-white/30 transition-colors" data-user-id="${user.email}" onclick="startPrivateChat('${user.email}', '${user.firstName} ${user.lastName}')">
                        <div class="relative">
                            <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm">
                                ${user.firstName.charAt(0)}
                            </div>
                            <div class="status-indicator absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white/20"></div>
                        </div>
                        <div class="ml-2 flex-1">
                            <p class="text-white text-sm font-medium">${user.firstName} ${user.lastName}</p>
                            <p class="text-white/60 text-xs">Online</p>
                        </div>
                    </div>
                `;
            }
        });
        
        // Update online users array
        onlineUsers = users.filter(user => 
            realOnlineUsers.some(onlineUser => onlineUser.email === user.email)
        );
    } catch (error) {
        console.error('Error loading online users:', error);
    }
}

// Load users from database (reuse from script.js)
async function loadUsersFromDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ImmersiveAppDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
            
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Update online users list (called by real-time manager)
function updateOnlineUsersList() {
    loadOnlineUsers();
}

// Start private chat
function startPrivateChat(email, name) {
    switchChatType('private');
    selectChat('private', email, name);
}

// Show create channel modal
function showCreateChannelModal() {
    const modal = document.getElementById('createChannelModal');
    const membersSelect = document.getElementById('channelMembers');
    
    // Populate members dropdown
    const users = getOtherUsers();
    membersSelect.innerHTML = '';
    users.forEach(user => {
        membersSelect.innerHTML += `<option value="${user.email}">${user.firstName} ${user.lastName}</option>`;
    });
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Close create channel modal
function closeCreateChannelModal() {
    const modal = document.getElementById('createChannelModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Clear form
    document.getElementById('channelName').value = '';
    document.getElementById('channelDescription').value = '';
    document.getElementById('channelMembers').selectedIndex = -1;
}

// Create channel
function createChannel(event) {
    event.preventDefault();
    
    const name = document.getElementById('channelName').value;
    const description = document.getElementById('channelDescription').value;
    const type = document.querySelector('input[name="channelType"]:checked').value;
    const membersSelect = document.getElementById('channelMembers');
    const selectedMembers = Array.from(membersSelect.selectedOptions).map(option => option.value);
    
    const channel = {
        id: Date.now().toString(),
        name: name,
        description: description,
        type: type,
        createdBy: currentUser.email,
        members: [currentUser.email, ...selectedMembers],
        createdAt: new Date().toISOString()
    };
    
    channels.push(channel);
    localStorage.setItem('channels', JSON.stringify(channels));
    
    showMessage('Channel created successfully!', 'success');
    closeCreateChannelModal();
    
    // Switch to groups tab and select the new channel
    switchChatType('groups');
    selectChat('groups', channel.id, channel.name);
}

// Load channels
function loadChannels() {
    channels = JSON.parse(localStorage.getItem('channels')) || [];
}

// Show message
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageContent = document.getElementById('messageContent');
    
    messageContainer.classList.remove('hidden');
    messageContent.className = 'p-4 rounded-md animate-slide-in';
    messageContent.classList.add('message-' + type);
    messageContent.textContent = message;
    
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 3000);
}

// Setup real-time listeners
function setupRealtimeListeners() {
    // Listen for new messages
    document.addEventListener('newMessage', (event) => {
        const messageData = event.detail;
        if (messageData.chatId === currentChat.type || 
            (currentChat.type === 'private' && messageData.chatId === getPrivateChatId(currentUser.email, currentChat.id))) {
            displayMessage(messageData);
        }
    });
    
    // Listen for user status updates
    document.addEventListener('userStatusUpdate', (event) => {
        const user = event.detail;
        updateUserStatus(user);
    });
    
    // Listen for user list updates
    document.addEventListener('userListUpdate', (event) => {
        const users = event.detail;
        onlineUsers = users;
        updateOnlineUsersList();
    });
    
    // Listen for typing indicators
    document.addEventListener('typingIndicator', (event) => {
        const typingData = event.detail;
        handleTypingIndicator(typingData);
    });
}

// Handle typing indicator
function handleTypingIndicator(data) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (!typingIndicator) return;
    
    const chatId = data.chatId || 'public';
    const isRelevantChat = 
        (currentChat.type === 'public' && chatId === 'public') ||
        (currentChat.type === 'private' && chatId === getPrivateChatId(currentUser.email, currentChat.id));
    
    if (isRelevantChat && data.isTyping && data.userId !== currentUser.email) {
        typingIndicator.innerHTML = `
            <div class="text-white/60 text-sm italic">
                ${data.userName} is typing...
            </div>
        `;
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
            typingIndicator.innerHTML = '';
        }, 3000);
    } else if (!data.isTyping) {
        typingIndicator.innerHTML = '';
    }
}

// Setup typing indicator for message input
function setupTypingIndicator() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    let typingTimeout;
    
    messageInput.addEventListener('input', () => {
        // Send typing indicator
        if (window.realtimeManager) {
            window.realtimeManager.sendRealtimeMessage({
                type: 'typing',
                chatId: currentChat.type === 'public' ? 'public' : 
                       currentChat.type === 'private' ? getPrivateChatId(currentUser.email, currentChat.id) : 
                       currentChat.id,
                userId: currentUser.email,
                userName: currentUser.firstName + ' ' + currentUser.lastName,
                isTyping: true
            });
        }
        
        // Clear existing timeout
        clearTimeout(typingTimeout);
        
        // Send stop typing after 1 second of inactivity
        typingTimeout = setTimeout(() => {
            if (window.realtimeManager) {
                window.realtimeManager.sendRealtimeMessage({
                    type: 'typing',
                    chatId: currentChat.type === 'public' ? 'public' : 
                           currentChat.type === 'private' ? getPrivateChatId(currentUser.email, currentChat.id) : 
                           currentChat.id,
                    userId: currentUser.email,
                    userName: currentUser.firstName + ' ' + currentUser.lastName,
                    isTyping: false
                });
            }
        }, 1000);
    });
}

// Update user status in UI
function updateUserStatus(user) {
    const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
    if (userElement) {
        const statusIndicator = userElement.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`;
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createChannelModal');
    if (event.target === modal) {
        closeCreateChannelModal();
    }
}
