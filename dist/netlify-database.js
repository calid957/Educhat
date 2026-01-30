// Netlify Database Service
class NetlifyDatabaseService {
    constructor() {
        this.baseURL = '/.netlify/functions';
        this.token = localStorage.getItem('authToken') || null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
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

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            console.log(`API call: ${config.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log('API response:', data);
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            // Store token if returned
            if (data.token) {
                this.setToken(data.token);
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

    async getCurrentUser() {
        const data = await this.apiCall('/users/me');
        return data.user;
    }

    async updateCurrentUser(updateData) {
        const data = await this.apiCall('/users/me', {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        return data.user;
    }

    async changePassword(currentPassword, newPassword) {
        const data = await this.apiCall('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return data;
    }

    async logout() {
        this.clearToken();
        // In a real implementation, you might want to invalidate the token on the server
        return { success: true, message: 'Logged out successfully' };
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
