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
        const data = await this.apiCall('/users');
        return data.users || [];
    }

    async createUser(userData) {
        const data = await this.apiCall('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return data.user;
    }

    async loginUser(email, password) {
        const data = await this.apiCall('/users/login', {
            method: 'PUT',
            body: JSON.stringify({ email, password })
        });
        return data.user;
    }

    // Message operations
    async getMessages(chatId = null) {
        const url = chatId ? `/messages?chatId=${encodeURIComponent(chatId)}` : '/messages';
        const data = await this.apiCall(url);
        return data.messages || [];
    }

    async createMessage(messageData) {
        const data = await this.apiCall('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
        return data.message;
    }

    // Channel operations
    async getChannels() {
        const data = await this.apiCall('/channels');
        return data.channels || [];
    }

    async createChannel(channelData) {
        const data = await this.apiCall('/channels', {
            method: 'POST',
            body: JSON.stringify(channelData)
        });
        return data.channel;
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

// Export singleton instance
window.netlifyDB = new NetlifyDatabaseService();
