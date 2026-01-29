// Global variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let systemLogs = JSON.parse(localStorage.getItem('systemLogs')) || [];
let bannedUsers = JSON.parse(localStorage.getItem('bannedUsers')) || [];
let restrictedWords = JSON.parse(localStorage.getItem('restrictedWords')) || ['spam', 'abuse', 'violation'];
let moderatorLogs = JSON.parse(localStorage.getItem('moderatorLogs')) || [];
let channelRequests = JSON.parse(localStorage.getItem('channelRequests')) || [];
let moderatorApplications = JSON.parse(localStorage.getItem('moderatorApplications')) || [];
let unbanRequests = JSON.parse(localStorage.getItem('unbanRequests')) || [];
let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
let violationAlerts = JSON.parse(localStorage.getItem('violationAlerts')) || [];
let violationLogs = JSON.parse(localStorage.getItem('violationLogs')) || [];
let autoBanSettings = JSON.parse(localStorage.getItem('autoBanSettings')) || {
    enabled: false,
    firstViolationDuration: 24,
    secondViolationDuration: 72,
    thirdViolationDuration: 168,
    violationsThreshold: 3,
    timeWindow: 24
};
let violationTracking = JSON.parse(localStorage.getItem('violationTracking')) || {};
let autoBanHistory = JSON.parse(localStorage.getItem('autoBanHistory')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser || currentUser.accountType !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    
    initializeAdmin();
    loadDashboardData();
    showSection('dashboard');
});

// Initialize admin dashboard
function initializeAdmin() {
    // Initialize default data if not exists
    if (!localStorage.getItem('systemLogs')) {
        initializeSystemLogs();
    }
    if (!localStorage.getItem('bannedUsers')) {
        localStorage.setItem('bannedUsers', JSON.stringify([]));
    }
    if (!localStorage.getItem('restrictedWords')) {
        localStorage.setItem('restrictedWords', JSON.stringify(['spam', 'abuse', 'violation']));
    }
    if (!localStorage.getItem('moderatorLogs')) {
        localStorage.setItem('moderatorLogs', JSON.stringify([]));
    }
    if (!localStorage.getItem('channelRequests')) {
        localStorage.setItem('channelRequests', JSON.stringify([]));
    }
    if (!localStorage.getItem('moderatorApplications')) {
        localStorage.setItem('moderatorApplications', JSON.stringify([]));
    }
    if (!localStorage.getItem('unbanRequests')) {
        localStorage.setItem('unbanRequests', JSON.stringify([]));
    }
    if (!localStorage.getItem('uploadedFiles')) {
        localStorage.setItem('uploadedFiles', JSON.stringify([]));
    }
    if (!localStorage.getItem('violationAlerts')) {
        localStorage.setItem('violationAlerts', JSON.stringify([]));
    }
    if (!localStorage.getItem('violationLogs')) {
        localStorage.setItem('violationLogs', JSON.stringify([]));
    }
    if (!localStorage.getItem('autoBanSettings')) {
        localStorage.setItem('autoBanSettings', JSON.stringify(autoBanSettings));
    }
    if (!localStorage.getItem('violationTracking')) {
        localStorage.setItem('violationTracking', JSON.stringify({}));
    }
    if (!localStorage.getItem('autoBanHistory')) {
        localStorage.setItem('autoBanHistory', JSON.stringify([]));
    }
}

// Initialize system logs with sample data
function initializeSystemLogs() {
    const logs = [
        {
            id: Date.now(),
            type: 'registration',
            message: 'New user registered: john.doe@example.com',
            timestamp: new Date().toISOString(),
            user: 'john.doe@example.com'
        },
        {
            id: Date.now() + 1,
            type: 'login',
            message: 'User login: admin@example.com',
            timestamp: new Date().toISOString(),
            user: 'admin@example.com'
        }
    ];
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('bg-white/20'));
    
    // Load section-specific data
    loadSectionData(sectionId);
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'moderator':
            loadModeratorLogs();
            break;
        case 'users':
            loadUsers();
            break;
        case 'status':
            loadUserStatus();
            break;
        case 'requests':
            loadRequests();
            break;
        case 'files':
            loadFiles();
            break;
        case 'logs':
            loadSystemLogs();
            break;
        case 'violations':
            loadViolationAlerts();
            break;
        case 'message-violations':
            loadMessageViolations();
            break;
        case 'ban-system':
            loadBanSystem();
            break;
        case 'unban-requests':
            loadUnbanRequests();
            break;
        case 'violation-logs':
            loadViolationLogs();
            break;
        case 'auto-ban':
            loadAutoBanSystem();
            break;
        case 'user-search':
            loadUserSearch();
            break;
        case 'user-details':
            loadUserDetails();
            break;
        case 'settings':
            // Settings are loaded by admin-settings.js
            if (window.adminSettings) {
                window.adminSettings.loadCurrentSettings();
            }
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    // Update statistics
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('activeUsers').textContent = Math.floor(users.length * 0.7); // Simulate active users
    document.getElementById('bannedUsers').textContent = bannedUsers.length;
    document.getElementById('totalChannels').textContent = JSON.parse(localStorage.getItem('channels') || '[]').length;
    
    // Create user activity chart
    createUserActivityChart();
    
    // Create registration chart
    createRegistrationChart();
}

// Create user activity chart
function createUserActivityChart() {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Active Users',
                data: [65, 78, 90, 81, 56, 85, 95],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4
            }, {
                label: 'Inactive Users',
                data: [28, 32, 25, 35, 42, 28, 20],
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Create registration chart
function createRegistrationChart() {
    const ctx = document.getElementById('registrationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Registrations',
                data: [12, 19, 23, 15, 28, 32],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Load moderator logs
function loadModeratorLogs() {
    const logsContainer = document.getElementById('moderatorLogs');
    logsContainer.innerHTML = '';
    
    if (moderatorLogs.length === 0) {
        logsContainer.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-white/60">No moderator activity logs found</td></tr>';
        return;
    }
    
    moderatorLogs.forEach(log => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${log.moderator}</td>
            <td class="p-3">${log.action}</td>
            <td class="p-3">${log.target}</td>
            <td class="p-3">${formatDateTime(log.timestamp)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${log.status === 'success' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}">
                    ${log.status}
                </span>
            </td>
        `;
        logsContainer.appendChild(row);
    });
}

// Load users
function loadUsers() {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${user.firstName} ${user.lastName}</td>
            <td class="p-3">${user.email}</td>
            <td class="p-3">${user.classTrade}</td>
            <td class="p-3">${user.gender}</td>
            <td class="p-3">${user.accountType}</td>
            <td class="p-3">${formatDateTime(user.createdAt)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isUserBanned(user.email) ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isUserBanned(user.email) ? 'Banned' : 'Active'}
                </span>
            </td>
            <td class="p-3">
                <button onclick="viewUserDetails('${user.email}')" class="text-blue-300 hover:text-blue-200 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                ${isUserBanned(user.email) ? 
                    `<button onclick="unbanUser('${user.email}')" class="text-green-300 hover:text-green-200">
                        <i class="fas fa-undo"></i>
                    </button>` :
                    `<button onclick="banUserFromList('${user.email}')" class="text-red-300 hover:text-red-200">
                        <i class="fas fa-ban"></i>
                    </button>`
                }
            </td>
        `;
        usersTable.appendChild(row);
    });
}

// Load user status
function loadUserStatus() {
    const activeUsersList = document.getElementById('activeUsersList');
    const inactiveUsersList = document.getElementById('inactiveUsersList');
    
    activeUsersList.innerHTML = '';
    inactiveUsersList.innerHTML = '';
    
    // Simulate active/inactive status
    users.forEach(user => {
        if (!isUserBanned(user.email)) {
            const isActive = Math.random() > 0.3; // Simulate active status
            const userDiv = document.createElement('div');
            userDiv.className = 'glass p-3 rounded-lg flex items-center justify-between';
            userDiv.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm">
                        ${user.firstName.charAt(0)}
                    </div>
                    <div class="ml-3">
                        <p class="text-white text-sm font-medium">${user.firstName} ${user.lastName}</p>
                        <p class="text-white/60 text-xs">${user.email}</p>
                    </div>
                </div>
                <div class="w-3 h-3 ${isActive ? 'bg-green-500' : 'bg-gray-500'} rounded-full"></div>
            `;
            
            if (isActive) {
                activeUsersList.appendChild(userDiv);
            } else {
                inactiveUsersList.appendChild(userDiv);
            }
        }
    });
}

// Load requests
function loadRequests() {
    loadChannelRequests();
    loadModeratorApplications();
}

// Load channel requests
function loadChannelRequests() {
    const container = document.getElementById('channelRequests');
    container.innerHTML = '';
    
    if (channelRequests.length === 0) {
        container.innerHTML = '<p class="text-white/60">No channel creation requests</p>';
        return;
    }
    
    channelRequests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'glass p-4 rounded-lg';
        requestDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-white font-medium">${request.name}</h4>
                    <p class="text-white/60 text-sm">${request.description}</p>
                    <p class="text-white/60 text-xs">Requested by: ${request.requestedBy}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="approveChannelRequest('${request.id}')" class="bg-green-500/30 text-green-300 px-3 py-1 rounded hover:bg-green-500/40">
                        Approve
                    </button>
                    <button onclick="denyChannelRequest('${request.id}')" class="bg-red-500/30 text-red-300 px-3 py-1 rounded hover:bg-red-500/40">
                        Deny
                    </button>
                </div>
            </div>
        `;
        container.appendChild(requestDiv);
    });
}

// Load moderator applications
function loadModeratorApplications() {
    const container = document.getElementById('moderatorRequests');
    container.innerHTML = '';
    
    if (moderatorApplications.length === 0) {
        container.innerHTML = '<p class="text-white/60">No moderator applications</p>';
        return;
    }
    
    moderatorApplications.forEach(application => {
        const applicationDiv = document.createElement('div');
        applicationDiv.className = 'glass p-4 rounded-lg';
        applicationDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-white font-medium">${application.applicantName}</h4>
                    <p class="text-white/60 text-sm">${application.reason}</p>
                    <p class="text-white/60 text-xs">Applied: ${formatDateTime(application.timestamp)}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="approveModeratorApplication('${application.id}')" class="bg-green-500/30 text-green-300 px-3 py-1 rounded hover:bg-green-500/40">
                        Approve
                    </button>
                    <button onclick="denyModeratorApplication('${application.id}')" class="bg-red-500/30 text-red-300 px-3 py-1 rounded hover:bg-red-500/40">
                        Deny
                    </button>
                </div>
            </div>
        `;
        container.appendChild(applicationDiv);
    });
}

// Load files
function loadFiles() {
    const publicFiles = document.getElementById('publicFiles');
    const privateFiles = document.getElementById('privateFiles');
    
    publicFiles.innerHTML = '';
    privateFiles.innerHTML = '';
    
    uploadedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'glass p-3 rounded-lg flex items-center justify-between';
        fileDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-file text-white/60 mr-3"></i>
                <div>
                    <p class="text-white text-sm font-medium">${file.name}</p>
                    <p class="text-white/60 text-xs">${file.size} • ${formatDateTime(file.uploadDate)}</p>
                </div>
            </div>
            <button onclick="deleteFile('${file.id}')" class="text-red-300 hover:text-red-200">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        if (file.type === 'public') {
            publicFiles.appendChild(fileDiv);
        } else {
            privateFiles.appendChild(fileDiv);
        }
    });
}

// Load system logs
function loadSystemLogs() {
    const logsContainer = document.getElementById('systemLogs');
    logsContainer.innerHTML = '';
    
    const filter = document.getElementById('logFilter').value;
    const filteredLogs = filter === 'all' ? systemLogs : systemLogs.filter(log => log.type === filter);
    
    if (filteredLogs.length === 0) {
        logsContainer.innerHTML = '<p class="text-white/60 text-center py-4">No logs found</p>';
        return;
    }
    
    filteredLogs.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.className = 'glass p-3 rounded-lg';
        logDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-white text-sm">${log.message}</p>
                    <p class="text-white/60 text-xs">${log.user} • ${formatDateTime(log.timestamp)}</p>
                </div>
                <span class="px-2 py-1 rounded-full text-xs ${getLogTypeColor(log.type)}">
                    ${log.type}
                </span>
            </div>
        `;
        logsContainer.appendChild(logDiv);
    });
}

// Load violation alerts
function loadViolationAlerts() {
    const container = document.getElementById('violationAlerts');
    container.innerHTML = '';
    
    if (violationAlerts.length === 0) {
        container.innerHTML = '<p class="text-white/60">No violation alerts</p>';
        return;
    }
    
    violationAlerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'glass p-4 rounded-lg';
        alertDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-white font-medium">${alert.type}</h4>
                    <p class="text-white/60 text-sm">${alert.description}</p>
                    <p class="text-white/60 text-xs">Detected: ${formatDateTime(alert.timestamp)}</p>
                </div>
                <span class="px-2 py-1 rounded-full text-xs ${getSeverityColor(alert.severity)}">
                    ${alert.severity}
                </span>
            </div>
        `;
        container.appendChild(alertDiv);
    });
}

// Load message violations
function loadMessageViolations() {
    loadRestrictedWords();
    loadDetectedViolations();
}

// Load restricted words
function loadRestrictedWords() {
    const container = document.getElementById('restrictedWords');
    container.innerHTML = '';
    
    restrictedWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'glass px-3 py-1 rounded-full text-white text-sm flex items-center';
        wordDiv.innerHTML = `
            ${word}
            <button onclick="removeRestrictedWord(${index})" class="ml-2 text-red-300 hover:text-red-200">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(wordDiv);
    });
}

// Load detected violations
function loadDetectedViolations() {
    const container = document.getElementById('detectedViolations');
    container.innerHTML = '<p class="text-white/60">No message violations detected</p>';
    // This would be populated with actual detected violations
}

// Load ban system
function loadBanSystem() {
    const bannedUsersList = document.getElementById('bannedUsersList');
    bannedUsersList.innerHTML = '';
    
    if (bannedUsers.length === 0) {
        bannedUsersList.innerHTML = '<p class="text-white/60">No banned users</p>';
        return;
    }
    
    bannedUsers.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'glass p-3 rounded-lg';
        userDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-white font-medium">${user.email}</p>
                    <p class="text-white/60 text-sm">${user.reason}</p>
                    <p class="text-white/60 text-xs">Banned until: ${formatDateTime(user.banUntil)}</p>
                </div>
                <button onclick="unbanUser('${user.email}')" class="bg-green-500/30 text-green-300 px-3 py-1 rounded hover:bg-green-500/40">
                    Unban
                </button>
            </div>
        `;
        bannedUsersList.appendChild(userDiv);
    });
}

// Load unban requests
function loadUnbanRequests() {
    const container = document.getElementById('unbanRequestsList');
    container.innerHTML = '';
    
    if (unbanRequests.length === 0) {
        container.innerHTML = '<p class="text-white/60">No unban requests</p>';
        return;
    }
    
    unbanRequests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'glass p-4 rounded-lg';
        requestDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-white font-medium">${request.userEmail}</h4>
                    <p class="text-white/60 text-sm">${request.reason}</p>
                    <p class="text-white/60 text-xs">Requested: ${formatDateTime(request.timestamp)}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="approveUnbanRequest('${request.id}')" class="bg-green-500/30 text-green-300 px-3 py-1 rounded hover:bg-green-500/40">
                        Approve
                    </button>
                    <button onclick="denyUnbanRequest('${request.id}')" class="bg-red-500/30 text-red-300 px-3 py-1 rounded hover:bg-red-500/40">
                        Deny
                    </button>
                </div>
            </div>
        `;
        container.appendChild(requestDiv);
    });
}

// Helper functions
function isUserBanned(email) {
    return bannedUsers.some(user => user.email === email);
}

function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function getLogTypeColor(type) {
    const colors = {
        'login': 'bg-blue-500/30 text-blue-300',
        'registration': 'bg-green-500/30 text-green-300',
        'moderation': 'bg-yellow-500/30 text-yellow-300',
        'system': 'bg-purple-500/30 text-purple-300'
    };
    return colors[type] || 'bg-gray-500/30 text-gray-300';
}

function getSeverityColor(severity) {
    const colors = {
        'low': 'bg-green-500/30 text-green-300',
        'medium': 'bg-yellow-500/30 text-yellow-300',
        'high': 'bg-red-500/30 text-red-300'
    };
    return colors[severity] || 'bg-gray-500/30 text-gray-300';
}

// Modal functions
function showUploadModal() {
    document.getElementById('uploadModal').classList.remove('hidden');
    document.getElementById('uploadModal').classList.add('flex');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('uploadModal').classList.remove('flex');
}

function showAddViolationModal() {
    document.getElementById('addViolationModal').classList.remove('hidden');
    document.getElementById('addViolationModal').classList.add('flex');
}

function closeAddViolationModal() {
    document.getElementById('addViolationModal').classList.add('hidden');
    document.getElementById('addViolationModal').classList.remove('flex');
}

// Form handlers
function uploadFile(event) {
    event.preventDefault();
    const fileType = document.getElementById('fileType').value;
    const fileInput = document.getElementById('fileInput');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: fileType,
            size: formatFileSize(file.size),
            uploadDate: new Date().toISOString(),
            uploadedBy: currentUser.email
        };
        
        uploadedFiles.push(fileData);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        showMessage('File uploaded successfully!', 'success');
        closeUploadModal();
        loadFiles();
    }
}

function addRestrictedWord(event) {
    event.preventDefault();
    const word = document.getElementById('restrictedWord').value.toLowerCase();
    const severity = document.getElementById('violationSeverity').value;
    
    if (!restrictedWords.includes(word)) {
        restrictedWords.push(word);
        localStorage.setItem('restrictedWords', JSON.stringify(restrictedWords));
        
        showMessage('Restricted word added successfully!', 'success');
        closeAddViolationModal();
        loadMessageViolations();
    } else {
        showMessage('This word is already restricted!', 'error');
    }
}

function removeRestrictedWord(index) {
    restrictedWords.splice(index, 1);
    localStorage.setItem('restrictedWords', JSON.stringify(restrictedWords));
    loadMessageViolations();
    showMessage('Restricted word removed!', 'success');
}

function banUser(event) {
    event.preventDefault();
    const email = document.getElementById('banUserEmail').value;
    const reason = document.getElementById('banReason').value;
    const duration = document.getElementById('banDuration').value;
    
    const banData = {
        email: email,
        reason: reason,
        banDate: new Date().toISOString(),
        banUntil: duration,
        bannedBy: currentUser.email
    };
    
    bannedUsers.push(banData);
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Add to system logs
    addSystemLog('moderation', `User ${email} has been banned`, email);
    
    showMessage('User banned successfully!', 'success');
    event.target.reset();
    loadBanSystem();
}

function banUserFromList(email) {
    const reason = prompt('Enter ban reason:');
    if (reason) {
        const banData = {
            email: email,
            reason: reason,
            banDate: new Date().toISOString(),
            banUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            bannedBy: currentUser.email
        };
        
        bannedUsers.push(banData);
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        
        addSystemLog('moderation', `User ${email} has been banned`, email);
        
        showMessage('User banned successfully!', 'success');
        loadUsers();
        loadBanSystem();
    }
}

function unbanUser(email) {
    bannedUsers = bannedUsers.filter(user => user.email !== email);
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    addSystemLog('moderation', `User ${email} has been unbanned`, email);
    
    showMessage('User unbanned successfully!', 'success');
    loadUsers();
    loadBanSystem();
}

function deleteFile(fileId) {
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    
    showMessage('File deleted successfully!', 'success');
    loadFiles();
}

function approveChannelRequest(requestId) {
    channelRequests = channelRequests.filter(req => req.id !== requestId);
    localStorage.setItem('channelRequests', JSON.stringify(channelRequests));
    
    addSystemLog('moderation', `Channel request ${requestId} approved`, currentUser.email);
    
    showMessage('Channel request approved!', 'success');
    loadRequests();
}

function denyChannelRequest(requestId) {
    channelRequests = channelRequests.filter(req => req.id !== requestId);
    localStorage.setItem('channelRequests', JSON.stringify(channelRequests));
    
    addSystemLog('moderation', `Channel request ${requestId} denied`, currentUser.email);
    
    showMessage('Channel request denied!', 'success');
    loadRequests();
}

function approveModeratorApplication(applicationId) {
    moderatorApplications = moderatorApplications.filter(app => app.id !== applicationId);
    localStorage.setItem('moderatorApplications', JSON.stringify(moderatorApplications));
    
    addSystemLog('moderation', `Moderator application ${applicationId} approved`, currentUser.email);
    
    showMessage('Moderator application approved!', 'success');
    loadRequests();
}

function denyModeratorApplication(applicationId) {
    moderatorApplications = moderatorApplications.filter(app => app.id !== applicationId);
    localStorage.setItem('moderatorApplications', JSON.stringify(moderatorApplications));
    
    addSystemLog('moderation', `Moderator application ${applicationId} denied`, currentUser.email);
    
    showMessage('Moderator application denied!', 'success');
    loadRequests();
}

function approveUnbanRequest(requestId) {
    const request = unbanRequests.find(req => req.id === requestId);
    if (request) {
        unbanUser(request.userEmail);
        unbanRequests = unbanRequests.filter(req => req.id !== requestId);
        localStorage.setItem('unbanRequests', JSON.stringify(unbanRequests));
        
        showMessage('Unban request approved!', 'success');
        loadUnbanRequests();
    }
}

function denyUnbanRequest(requestId) {
    unbanRequests = unbanRequests.filter(req => req.id !== requestId);
    localStorage.setItem('unbanRequests', JSON.stringify(unbanRequests));
    
    showMessage('Unban request denied!', 'success');
    loadUnbanRequests();
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    
    // Update users table with filtered results
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${user.firstName} ${user.lastName}</td>
            <td class="p-3">${user.email}</td>
            <td class="p-3">${user.classTrade}</td>
            <td class="p-3">${user.gender}</td>
            <td class="p-3">${user.accountType}</td>
            <td class="p-3">${formatDateTime(user.createdAt)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isUserBanned(user.email) ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isUserBanned(user.email) ? 'Banned' : 'Active'}
                </span>
            </td>
            <td class="p-3">
                <button onclick="viewUserDetails('${user.email}')" class="text-blue-300 hover:text-blue-200 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                ${isUserBanned(user.email) ? 
                    `<button onclick="unbanUser('${user.email}')" class="text-green-300 hover:text-green-200">
                        <i class="fas fa-undo"></i>
                    </button>` :
                    `<button onclick="banUserFromList('${user.email}')" class="text-red-300 hover:text-red-200">
                        <i class="fas fa-ban"></i>
                    </button>`
                }
            </td>
        `;
        usersTable.appendChild(row);
    });
}

function filterLogs() {
    loadSystemLogs();
}

function viewUserDetails(email) {
    const user = users.find(u => u.email === email);
    if (user) {
        alert(`User Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nAccount Type: ${user.accountType}\nClass/Trade: ${user.classTrade}\nGender: ${user.gender}\nRegistration Date: ${formatDateTime(user.createdAt)}\nStatus: ${isUserBanned(email) ? 'Banned' : 'Active'}`);
    }
}

function addSystemLog(type, message, user) {
    const log = {
        id: Date.now(),
        type: type,
        message: message,
        timestamp: new Date().toISOString(),
        user: user || currentUser.email
    };
    
    systemLogs.push(log);
    localStorage.setItem('systemLogs', JSON.stringify(systemLogs));
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

function logout() {
    addSystemLog('login', 'Admin logout', currentUser.email);
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load user search
function loadUserSearch() {
    updateUserSearchStatistics();
    adminSearchUsers();
}

// Admin user search
function adminSearchUsers() {
    const searchTerm = document.getElementById('adminUserSearchInput').value.toLowerCase();
    const accountTypeFilter = document.getElementById('adminAccountTypeFilter').value;
    const classFilter = document.getElementById('adminClassFilter').value;
    const genderFilter = document.getElementById('adminGenderFilter').value;
    const accountDefinitionFilter = document.getElementById('adminAccountDefinitionFilter').value;
    const statusFilter = document.getElementById('adminStatusFilter').value;
    const registrationDateFilter = document.getElementById('adminRegistrationDateFilter').value;
    
    const table = document.getElementById('adminUserSearchResults');
    table.innerHTML = '';
    
    let filteredUsers = users.filter(user => {
        // Search term filter
        const matchesSearch = !searchTerm || 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.classTrade.toLowerCase().includes(searchTerm);
        
        // Account type filter
        const matchesAccountType = !accountTypeFilter || user.accountType === accountTypeFilter;
        
        // Class filter
        const matchesClass = !classFilter || user.classTrade === classFilter;
        
        // Gender filter
        const matchesGender = !genderFilter || user.gender === genderFilter;
        
        // Account definition filter
        const matchesAccountDefinition = !accountDefinitionFilter || user.accountDefinition === accountDefinitionFilter;
        
        // Status filter
        const isBanned = isUserBanned(user.email);
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = !isBanned;
        } else if (statusFilter === 'banned') {
            matchesStatus = isBanned;
        } else if (statusFilter === 'inactive') {
            // Simulate inactive status (users who haven't logged in recently)
            matchesStatus = Math.random() > 0.7; // 30% chance of being inactive
        }
        
        // Registration date filter
        let matchesRegistrationDate = true;
        if (registrationDateFilter) {
            const filterDate = new Date(registrationDateFilter);
            const userDate = new Date(user.createdAt);
            matchesRegistrationDate = userDate.toDateString() === filterDate.toDateString();
        }
        
        return matchesSearch && matchesAccountType && matchesClass && matchesGender && 
               matchesAccountDefinition && matchesStatus && matchesRegistrationDate;
    });
    
    // Update statistics
    document.getElementById('adminFilteredUsers').textContent = filteredUsers.length;
    
    if (filteredUsers.length === 0) {
        table.innerHTML = '<tr><td colspan="9" class="text-center p-4 text-white/60">No users found matching your criteria</td></tr>';
        document.getElementById('bulkActions').style.display = 'none';
        return;
    }
    
    filteredUsers.forEach(user => {
        const isBanned = isUserBanned(user.email);
        const violationCount = getUserViolationCount(user.email);
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">
                <input type="checkbox" class="user-checkbox mr-2" value="${user.email}" onchange="updateSelectedUsersCount()">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                        ${user.firstName.charAt(0)}
                    </div>
                    <div class="ml-3">
                        <p class="text-white font-medium">${user.firstName} ${user.lastName}</p>
                        <p class="text-white/60 text-sm">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getAccountTypeColor(user.accountType)}">
                    ${user.accountType}
                </span>
            </td>
            <td class="p-3">${user.classTrade}</td>
            <td class="p-3">${user.gender}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${user.accountDefinition === 'public' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'}">
                    ${user.accountDefinition}
                </span>
            </td>
            <td class="p-3">${formatDateTime(user.createdAt)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getUserStatusColor(user.email)}">
                    ${getUserStatus(user.email)}
                </span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${violationCount > 0 ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${violationCount}
                </span>
            </td>
            <td class="p-3">
                <div class="flex space-x-1">
                    <button onclick="viewUserDetails('${user.email}')" class="text-blue-300 hover:text-blue-200" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editUser('${user.email}')" class="text-yellow-300 hover:text-yellow-200" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${isBanned ? 
                        `<button onclick="unbanUser('${user.email}')" class="text-green-300 hover:text-green-200" title="Unban User">
                            <i class="fas fa-undo"></i>
                        </button>` :
                        `<button onclick="banUserFromSearch('${user.email}')" class="text-red-300 hover:text-red-200" title="Ban User">
                            <i class="fas fa-gavel"></i>
                        </button>`
                    }
                    <button onclick="deleteUser('${user.email}')" class="text-orange-300 hover:text-orange-200" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        table.appendChild(row);
    });
}

// Update user search statistics
function updateUserSearchStatistics() {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => !isUserBanned(user.email)).length;
    const bannedUsersCount = users.filter(user => isUserBanned(user.email)).length;
    
    document.getElementById('adminTotalUsers').textContent = totalUsers;
    document.getElementById('adminActiveUsers').textContent = activeUsers;
    document.getElementById('adminBannedUsers').textContent = bannedUsersCount;
    document.getElementById('adminFilteredUsers').textContent = totalUsers;
}

// Clear admin user search
function clearAdminUserSearch() {
    document.getElementById('adminUserSearchInput').value = '';
    document.getElementById('adminAccountTypeFilter').value = '';
    document.getElementById('adminClassFilter').value = '';
    document.getElementById('adminGenderFilter').value = '';
    document.getElementById('adminAccountDefinitionFilter').value = '';
    document.getElementById('adminStatusFilter').value = '';
    document.getElementById('adminRegistrationDateFilter').value = '';
    document.getElementById('selectAllUsers').checked = false;
    
    adminSearchUsers();
}

// Export user search results
function exportUserSearch() {
    const searchTerm = document.getElementById('adminUserSearchInput').value.toLowerCase();
    const accountTypeFilter = document.getElementById('adminAccountTypeFilter').value;
    const classFilter = document.getElementById('adminClassFilter').value;
    const genderFilter = document.getElementById('adminGenderFilter').value;
    const accountDefinitionFilter = document.getElementById('adminAccountDefinitionFilter').value;
    const statusFilter = document.getElementById('adminStatusFilter').value;
    const registrationDateFilter = document.getElementById('adminRegistrationDateFilter').value;
    
    let filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.classTrade.toLowerCase().includes(searchTerm);
        
        const matchesAccountType = !accountTypeFilter || user.accountType === accountTypeFilter;
        const matchesClass = !classFilter || user.classTrade === classFilter;
        const matchesGender = !genderFilter || user.gender === genderFilter;
        const matchesAccountDefinition = !accountDefinitionFilter || user.accountDefinition === accountDefinitionFilter;
        
        const isBanned = isUserBanned(user.email);
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = !isBanned;
        } else if (statusFilter === 'banned') {
            matchesStatus = isBanned;
        } else if (statusFilter === 'inactive') {
            matchesStatus = Math.random() > 0.7;
        }
        
        let matchesRegistrationDate = true;
        if (registrationDateFilter) {
            const filterDate = new Date(registrationDateFilter);
            const userDate = new Date(user.createdAt);
            matchesRegistrationDate = userDate.toDateString() === filterDate.toDateString();
        }
        
        return matchesSearch && matchesAccountType && matchesClass && matchesGender && 
               matchesAccountDefinition && matchesStatus && matchesRegistrationDate;
    });
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Account Type', 'Class/Trade', 'Gender', 'Account Definition', 'Registration Date', 'Status', 'Violations'];
    const csvContent = [
        headers.join(','),
        ...filteredUsers.map(user => [
            `"${user.firstName} ${user.lastName}"`,
            `"${user.email}"`,
            `"${user.accountType}"`,
            `"${user.classTrade}"`,
            `"${user.gender}"`,
            `"${user.accountDefinition}"`,
            `"${formatDateTime(user.createdAt)}"`,
            `"${getUserStatus(user.email)}"`,
            `"${getUserViolationCount(user.email)}"`
        ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_search_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('User search results exported successfully!', 'success');
}

// Toggle select all users
function toggleSelectAllUsers() {
    const selectAll = document.getElementById('selectAllUsers').checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    updateSelectedUsersCount();
}

// Update selected users count
function updateSelectedUsersCount() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const count = checkedBoxes.length;
    
    document.getElementById('selectedUsersCount').textContent = count;
    
    const bulkActions = document.getElementById('bulkActions');
    if (count > 0) {
        bulkActions.style.display = 'block';
    } else {
        bulkActions.style.display = 'none';
    }
}

// Bulk ban users
function bulkBanUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const selectedUsers = Array.from(checkedBoxes).map(cb => cb.value);
    
    if (selectedUsers.length === 0) {
        showMessage('No users selected for banning!', 'error');
        return;
    }
    
    const reason = prompt(`Enter ban reason for ${selectedUsers.length} user(s):`);
    if (!reason) return;
    
    const duration = prompt('Enter ban duration (hours):', '24');
    if (!duration) return;
    
    selectedUsers.forEach(email => {
        if (!isUserBanned(email)) {
            const banUntil = new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString();
            
            const banData = {
                email: email,
                reason: reason,
                banDate: new Date().toISOString(),
                banUntil: banUntil,
                bannedBy: currentUser.email,
                duration: parseInt(duration)
            };
            
            bannedUsers.push(banData);
            
            addSystemLog('moderation', `Bulk ban: ${email} banned for ${duration} hours`, email);
        }
    });
    
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    showMessage(`${selectedUsers.length} user(s) banned successfully!`, 'success');
    
    // Clear selection and reload
    document.getElementById('selectAllUsers').checked = false;
    adminSearchUsers();
    updateUserSearchStatistics();
}

// Bulk unban users
function bulkUnbanUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const selectedUsers = Array.from(checkedBoxes).map(cb => cb.value);
    
    if (selectedUsers.length === 0) {
        showMessage('No users selected for unbanning!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to unban ${selectedUsers.length} user(s)?`)) return;
    
    selectedUsers.forEach(email => {
        bannedUsers = bannedUsers.filter(user => user.email !== email);
        addSystemLog('moderation', `Bulk unban: ${email} unbanned`, email);
    });
    
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    showMessage(`${selectedUsers.length} user(s) unbanned successfully!`, 'success');
    
    // Clear selection and reload
    document.getElementById('selectAllUsers').checked = false;
    adminSearchUsers();
    updateUserSearchStatistics();
}

// Bulk delete users
function bulkDeleteUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const selectedUsers = Array.from(checkedBoxes).map(cb => cb.value);
    
    if (selectedUsers.length === 0) {
        showMessage('No users selected for deletion!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone!`)) return;
    
    selectedUsers.forEach(email => {
        users = users.filter(user => user.email !== email);
        bannedUsers = bannedUsers.filter(user => user.email !== email);
        addSystemLog('moderation', `Bulk delete: ${email} deleted`, email);
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    showMessage(`${selectedUsers.length} user(s) deleted successfully!`, 'success');
    
    // Clear selection and reload
    document.getElementById('selectAllUsers').checked = false;
    adminSearchUsers();
    updateUserSearchStatistics();
}

// Ban user from search
function banUserFromSearch(email) {
    const reason = prompt('Enter ban reason:');
    if (reason) {
        const duration = prompt('Enter ban duration (hours):', '24');
        if (duration) {
            const banUntil = new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString();
            
            const banData = {
                email: email,
                reason: reason,
                banDate: new Date().toISOString(),
                banUntil: banUntil,
                bannedBy: currentUser.email,
                duration: parseInt(duration)
            };
            
            bannedUsers.push(banData);
            localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
            
            addSystemLog('moderation', `User ${email} banned for ${duration} hours`, email);
            
            showMessage('User banned successfully!', 'success');
            adminSearchUsers();
            updateUserSearchStatistics();
        }
    }
}

// Edit user
function editUser(email) {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    alert(`Edit User:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nAccount Type: ${user.accountType}\nClass: ${user.classTrade}\n\nNote: Full user editing functionality would be implemented here with a modal form.`);
}

// Delete user
function deleteUser(email) {
    if (confirm(`Are you sure you want to delete user ${email}? This action cannot be undone!`)) {
        users = users.filter(user => user.email !== email);
        bannedUsers = bannedUsers.filter(user => user.email !== email);
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        
        addSystemLog('moderation', `User ${email} deleted`, email);
        
        showMessage('User deleted successfully!', 'success');
        adminSearchUsers();
        updateUserSearchStatistics();
    }
}

// Helper functions for user search
function getUserViolationCount(email) {
    return violationLogs.filter(log => log.userEmail === email).length;
}

function getUserStatus(email) {
    if (isUserBanned(email)) return 'Banned';
    if (Math.random() > 0.7) return 'Inactive';
    return 'Active';
}

function getUserStatusColor(email) {
    const status = getUserStatus(email);
    const colors = {
        'Active': 'bg-green-500/30 text-green-300',
        'Banned': 'bg-red-500/30 text-red-300',
        'Inactive': 'bg-gray-500/30 text-gray-300'
    };
    return colors[status] || 'bg-gray-500/30 text-gray-300';
}

// Load user details
function loadUserDetails() {
    updateUserDetailsStatistics();
    loadUserDetailsTable();
}

// Update user details statistics
function updateUserDetailsStatistics() {
    const totalUsers = users.length;
    const students = users.filter(user => user.accountType === 'student').length;
    const teachers = users.filter(user => user.accountType === 'teacher').length;
    const admins = users.filter(user => user.accountType === 'admin').length;
    const moderators = users.filter(user => user.accountType === 'moderator').length;
    
    document.getElementById('detailsTotalUsers').textContent = totalUsers;
    document.getElementById('detailsStudents').textContent = students;
    document.getElementById('detailsTeachers').textContent = teachers;
    document.getElementById('detailsAdmins').textContent = admins;
    document.getElementById('detailsModerators').textContent = moderators;
}

// Load user details table
function loadUserDetailsTable() {
    const table = document.getElementById('userDetailsTable');
    table.innerHTML = '';
    
    if (users.length === 0) {
        table.innerHTML = '<tr><td colspan="12" class="text-center p-4 text-white/60">No users found</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const isBanned = isUserBanned(user.email);
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10 hover:bg-white/10 transition-colors';
        
        // Mask password for security (show first 2 chars, rest asterisks)
        const maskedPassword = user.password ? 
            user.password.substring(0, 2) + '*'.repeat(user.password.length - 2) : 
            'N/A';
        
        row.innerHTML = `
            <td class="p-3">
                <span class="text-white/60 text-xs">#${index + 1}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.firstName}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.lastName}</span>
            </td>
            <td class="p-3">
                <span class="text-blue-300">${user.email}</span>
            </td>
            <td class="p-3">
                <span class="text-yellow-300 font-mono text-xs" title="Click to reveal password" onclick="revealPassword('${user.email}', this)">
                    ${maskedPassword}
                </span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getAccountTypeColor(user.accountType)}">
                    ${user.accountType}
                </span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.classTrade}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.gender}</span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${user.accountDefinition === 'public' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'}">
                    ${user.accountDefinition}
                </span>
            </td>
            <td class="p-3">
                <span class="text-white/80 text-xs">${formatDateTime(user.createdAt)}</span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isBanned ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isBanned ? 'Banned' : 'Active'}
                </span>
            </td>
            <td class="p-3">
                <div class="flex space-x-1">
                    <button onclick="viewFullUserDetails('${user.email}')" class="text-blue-300 hover:text-blue-200" title="View Full Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editUserDetails('${user.email}')" class="text-yellow-300 hover:text-yellow-200" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="resetUserPassword('${user.email}')" class="text-purple-300 hover:text-purple-200" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    ${isBanned ? 
                        `<button onclick="unbanUser('${user.email}')" class="text-green-300 hover:text-green-200" title="Unban User">
                            <i class="fas fa-undo"></i>
                        </button>` :
                        `<button onclick="banUserFromDetails('${user.email}')" class="text-red-300 hover:text-red-200" title="Ban User">
                            <i class="fas fa-gavel"></i>
                        </button>`
                    }
                    <button onclick="deleteUserFromDetails('${user.email}')" class="text-orange-300 hover:text-orange-200" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        table.appendChild(row);
    });
}

// Search user details
function searchUserDetails() {
    const searchTerm = document.getElementById('userDetailsSearch').value.toLowerCase();
    const table = document.getElementById('userDetailsTable');
    table.innerHTML = '';
    
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.classTrade.toLowerCase().includes(searchTerm) ||
        user.accountType.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        table.innerHTML = '<tr><td colspan="12" class="text-center p-4 text-white/60">No users found matching your search</td></tr>';
        return;
    }
    
    filteredUsers.forEach((user, index) => {
        const isBanned = isUserBanned(user.email);
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10 hover:bg-white/10 transition-colors';
        
        const maskedPassword = user.password ? 
            user.password.substring(0, 2) + '*'.repeat(user.password.length - 2) : 
            'N/A';
        
        row.innerHTML = `
            <td class="p-3">
                <span class="text-white/60 text-xs">#${index + 1}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.firstName}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.lastName}</span>
            </td>
            <td class="p-3">
                <span class="text-blue-300">${user.email}</span>
            </td>
            <td class="p-3">
                <span class="text-yellow-300 font-mono text-xs" title="Click to reveal password" onclick="revealPassword('${user.email}', this)">
                    ${maskedPassword}
                </span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getAccountTypeColor(user.accountType)}">
                    ${user.accountType}
                </span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.classTrade}</span>
            </td>
            <td class="p-3">
                <span class="text-white">${user.gender}</span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${user.accountDefinition === 'public' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'}">
                    ${user.accountDefinition}
                </span>
            </td>
            <td class="p-3">
                <span class="text-white/80 text-xs">${formatDateTime(user.createdAt)}</span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isBanned ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isBanned ? 'Banned' : 'Active'}
                </span>
            </td>
            <td class="p-3">
                <div class="flex space-x-1">
                    <button onclick="viewFullUserDetails('${user.email}')" class="text-blue-300 hover:text-blue-200" title="View Full Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editUserDetails('${user.email}')" class="text-yellow-300 hover:text-yellow-200" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="resetUserPassword('${user.email}')" class="text-purple-300 hover:text-purple-200" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    ${isBanned ? 
                        `<button onclick="unbanUser('${user.email}')" class="text-green-300 hover:text-green-200" title="Unban User">
                            <i class="fas fa-undo"></i>
                        </button>` :
                        `<button onclick="banUserFromDetails('${user.email}')" class="text-red-300 hover:text-red-200" title="Ban User">
                            <i class="fas fa-gavel"></i>
                        </button>`
                    }
                    <button onclick="deleteUserFromDetails('${user.email}')" class="text-orange-300 hover:text-orange-200" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        table.appendChild(row);
    });
}

// Export all user details
function exportAllUserDetails() {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Password', 'Account Type', 'Class/Trade', 'Gender', 'Account Definition', 'Registration Date', 'Status'];
    const csvContent = [
        headers.join(','),
        ...users.map((user, index) => [
            index + 1,
            `"${user.firstName}"`,
            `"${user.lastName}"`,
            `"${user.email}"`,
            `"${user.password}"`,
            `"${user.accountType}"`,
            `"${user.classTrade}"`,
            `"${user.gender}"`,
            `"${user.accountDefinition}"`,
            `"${formatDateTime(user.createdAt)}"`,
            `"${isUserBanned(user.email) ? 'Banned' : 'Active'}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_user_details_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('All user details exported successfully!', 'success');
}

// Reveal password (with confirmation)
function revealPassword(email, element) {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    showConfirm(`Are you sure you want to reveal the password for ${email}? This should only be done for legitimate administrative purposes.`, 'warning', 'Confirm Password Revelation').then((confirmed) => {
        if (confirmed) {
            element.textContent = user.password;
            element.classList.add('text-red-400');
            element.title = 'Password revealed - click to hide';
            element.onclick = function() {
                element.textContent = user.password.substring(0, 2) + '*'.repeat(user.password.length - 2);
                element.classList.remove('text-red-400');
                element.classList.add('text-yellow-300');
                element.title = 'Click to reveal password';
                element.onclick = function() { revealPassword(email, element); };
            };
            
            // Log password revelation for security
            addSystemLog('security', `Password revealed for user: ${email}`, currentUser.email);
        }
    });
}

// View full user details
function viewFullUserDetails(email) {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    const isBanned = isUserBanned(email);
    const violationCount = getUserViolationCount(email);
    
    const details = `
FULL USER DETAILS

Personal Information:
• Name: ${user.firstName} ${user.lastName}
• Email: ${user.email}
• Password: ${user.password}
• Account Type: ${user.accountType}
• Class/Trade: ${user.classTrade}
• Gender: ${user.gender}
• Account Definition: ${user.accountDefinition}

System Information:
• User ID: ${user.id || 'N/A'}
• Registration Date: ${formatDateTime(user.createdAt)}
• Account Status: ${isBanned ? 'Banned' : 'Active'}
• Violations: ${violationCount}

${isBanned ? `Ban Information:
• Ban Reason: ${bannedUsers.find(b => b.email === email)?.reason || 'N/A'}
• Ban Date: ${formatDateTime(bannedUsers.find(b => b.email === email)?.banDate || 'N/A')}
• Ban Until: ${bannedUsers.find(b => b.email === email)?.banUntil === 'permanent' ? 'Permanent' : formatDateTime(bannedUsers.find(b => b.email === email)?.banUntil || 'N/A')}
• Banned By: ${bannedUsers.find(b => b.email === email)?.bannedBy || 'N/A'}` : ''}
    `;
    
    showAlert(details, 'info', 'Complete User Details');
}

// Edit user details
function editUserDetails(email) {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    showPrompt('Enter new first name:', user.firstName, 'info', 'Edit User Details').then((newFirstName) => {
        if (newFirstName && newFirstName !== user.firstName) {
            user.firstName = newFirstName;
            localStorage.setItem('users', JSON.stringify(users));
            addSystemLog('user_management', `User details updated: ${email}`, email);
            showMessage('User details updated successfully!', 'success');
            loadUserDetails();
        }
    });
}

// Reset user password
function resetUserPassword(email) {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    showConfirm(`Are you sure you want to reset the password for ${email}?`, 'warning', 'Reset Password').then((confirmed) => {
        if (confirmed) {
            showPrompt('Enter new password:', 'temp123', 'info', 'New Password').then((newPassword) => {
                if (newPassword) {
                    user.password = newPassword;
                    localStorage.setItem('users', JSON.stringify(users));
                    addSystemLog('security', `Password reset for user: ${email}`, email);
                    showMessage('Password reset successfully!', 'success');
                    loadUserDetails();
                }
            });
        }
    });
}

// Ban user from details
function banUserFromDetails(email) {
    showPrompt('Enter ban reason:', '', 'warning', 'Ban Reason').then((reason) => {
        if (reason) {
            showPrompt('Enter ban duration (hours):', '24', 'warning', 'Ban Duration').then((duration) => {
                if (duration) {
                    const banUntil = new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString();
                    
                    const banData = {
                        email: email,
                        reason: reason,
                        banDate: new Date().toISOString(),
                        banUntil: banUntil,
                        bannedBy: currentUser.email,
                        duration: parseInt(duration)
                    };
                    
                    bannedUsers.push(banData);
                    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
                    
                    addSystemLog('moderation', `User ${email} banned for ${duration} hours`, email);
                    
                    showMessage('User banned successfully!', 'success');
                    loadUserDetails();
                }
            });
        }
    });
}

// Delete user from details
function deleteUserFromDetails(email) {
    showConfirm(`Are you sure you want to delete user ${email}? This action cannot be undone!`, 'error', 'Delete User').then((confirmed) => {
        if (confirmed) {
            users = users.filter(user => user.email !== email);
            bannedUsers = bannedUsers.filter(user => user.email !== email);
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
            
            addSystemLog('moderation', `User ${email} deleted`, email);
            
            showMessage('User deleted successfully!', 'success');
            loadUserDetails();
            updateUserDetailsStatistics();
        }
    });
}

// Load violation logs
function loadViolationLogs() {
    loadViolationSummary();
    loadRecentViolations();
    loadViolationLogsTable();
}

// Load violation summary
function loadViolationSummary() {
    const container = document.getElementById('violationSummary');
    container.innerHTML = '';
    
    // Group violations by user
    const userViolations = {};
    violationLogs.forEach(log => {
        if (!userViolations[log.userEmail]) {
            userViolations[log.userEmail] = {
                count: 0,
                lastViolation: null,
                violations: []
            };
        }
        userViolations[log.userEmail].count++;
        userViolations[log.userEmail].violations.push(log);
        if (!userViolations[log.userEmail].lastViolation || new Date(log.timestamp) > new Date(userViolations[log.userEmail].lastViolation)) {
            userViolations[log.userEmail].lastViolation = log.timestamp;
        }
    });
    
    // Sort users by violation count
    const sortedUsers = Object.entries(userViolations)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10);
    
    if (sortedUsers.length === 0) {
        container.innerHTML = '<p class="text-white/60">No violations recorded</p>';
        return;
    }
    
    sortedUsers.forEach(([email, data]) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'glass p-3 rounded-lg flex items-center justify-between';
        userDiv.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                    ${email.charAt(0).toUpperCase()}
                </div>
                <div class="ml-3">
                    <p class="text-white text-sm font-medium">${email}</p>
                    <p class="text-white/60 text-xs">Last: ${formatDateTime(data.lastViolation)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-white font-bold">${data.count}</p>
                <p class="text-white/60 text-xs">violations</p>
            </div>
        `;
        container.appendChild(userDiv);
    });
}

// Load recent violations
function loadRecentViolations() {
    const container = document.getElementById('recentViolations');
    container.innerHTML = '';
    
    const recentLogs = violationLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    
    if (recentLogs.length === 0) {
        container.innerHTML = '<p class="text-white/60">No recent violations</p>';
        return;
    }
    
    recentLogs.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.className = 'glass p-3 rounded-lg';
        logDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-white text-sm font-medium">${log.userEmail}</p>
                    <p class="text-white/60 text-sm">${log.content}</p>
                </div>
                <div class="text-right">
                    <span class="px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}">
                        ${log.severity}
                    </span>
                    <p class="text-white/40 text-xs mt-1">${formatDateTime(log.timestamp)}</p>
                </div>
            </div>
        `;
        container.appendChild(logDiv);
    });
}

// Load violation logs table
function loadViolationLogsTable() {
    const table = document.getElementById('violationLogsTable');
    table.innerHTML = '';
    
    const filter = document.getElementById('violationLogFilter').value;
    const searchTerm = document.getElementById('violationUserSearch').value.toLowerCase();
    
    let filteredLogs = violationLogs;
    
    if (filter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.type === filter);
    }
    
    if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
            log.userEmail.toLowerCase().includes(searchTerm)
        );
    }
    
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (filteredLogs.length === 0) {
        table.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-white/60">No violation logs found</td></tr>';
        return;
    }
    
    filteredLogs.forEach(log => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${log.userEmail}</td>
            <td class="p-3">${log.type}</td>
            <td class="p-3">${log.content.substring(0, 50)}${log.content.length > 50 ? '...' : ''}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}">
                    ${log.severity}
                </span>
            </td>
            <td class="p-3">${log.count || 1}</td>
            <td class="p-3">${formatDateTime(log.timestamp)}</td>
            <td class="p-3">
                <button onclick="viewViolationDetails('${log.id}')" class="text-blue-300 hover:text-blue-200 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="deleteViolationLog('${log.id}')" class="text-red-300 hover:text-red-200">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Filter violation logs
function filterViolationLogs() {
    loadViolationLogsTable();
}

// Load auto ban system
function loadAutoBanSystem() {
    loadAutoBanSettings();
    loadAutoBanStatistics();
    loadRecentAutoBans();
    loadViolationTracking();
}

// Load auto ban settings
function loadAutoBanSettings() {
    document.getElementById('firstViolationDuration').value = autoBanSettings.firstViolationDuration;
    document.getElementById('secondViolationDuration').value = autoBanSettings.secondViolationDuration;
    document.getElementById('thirdViolationDuration').value = autoBanSettings.thirdViolationDuration;
    document.getElementById('violationsThreshold').value = autoBanSettings.violationsThreshold;
    document.getElementById('timeWindow').value = autoBanSettings.timeWindow;
    
    const toggle = document.getElementById('autoBanToggle');
    if (autoBanSettings.enabled) {
        toggle.innerHTML = '<i class="fas fa-power-off mr-2"></i>Disable Auto Ban';
        toggle.classList.add('bg-red-500/80');
    } else {
        toggle.innerHTML = '<i class="fas fa-power-off mr-2"></i>Enable Auto Ban';
        toggle.classList.remove('bg-red-500/80');
    }
}

// Load auto ban statistics
function loadAutoBanStatistics() {
    const totalAutoBans = autoBanHistory.length;
    const activeAutoBans = bannedUsers.filter(user => user.autoBan).length;
    
    document.getElementById('totalAutoBans').textContent = totalAutoBans;
    document.getElementById('activeAutoBans').textContent = activeAutoBans;
}

// Load recent auto bans
function loadRecentAutoBans() {
    const container = document.getElementById('recentAutoBans');
    container.innerHTML = '';
    
    const recentBans = autoBanHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    
    if (recentBans.length === 0) {
        container.innerHTML = '<p class="text-white/60">No auto bans recorded</p>';
        return;
    }
    
    recentBans.forEach(ban => {
        const banDiv = document.createElement('div');
        banDiv.className = 'glass p-3 rounded-lg';
        banDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-white text-sm font-medium">${ban.userEmail}</p>
                    <p class="text-white/60 text-sm">${ban.reason}</p>
                    <p class="text-white/60 text-xs">Level: ${ban.level}</p>
                </div>
                <div class="text-right">
                    <p class="text-white/40 text-xs">${formatDateTime(ban.timestamp)}</p>
                    <p class="text-white/60 text-xs">${ban.duration}h</p>
                </div>
            </div>
        `;
        container.appendChild(banDiv);
    });
}

// Load violation tracking
function loadViolationTracking() {
    const table = document.getElementById('violationTrackingTable');
    table.innerHTML = '';
    
    const trackingEntries = Object.entries(violationTracking)
        .filter(([, data]) => data.count > 0)
        .sort(([,a], [,b]) => b.count - a.count);
    
    if (trackingEntries.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-white/60">No users with violations</td></tr>';
        return;
    }
    
    trackingEntries.forEach(([email, data]) => {
        const nextBanLevel = getNextBanLevel(data.count);
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${email}</td>
            <td class="p-3">${data.count}</td>
            <td class="p-3">${formatDateTime(data.lastViolation)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${getBanLevelColor(nextBanLevel)}">
                    ${nextBanLevel}
                </span>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isUserBanned(email) ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isUserBanned(email) ? 'Banned' : 'Active'}
                </span>
            </td>
        `;
        table.appendChild(row);
    });
}

// Toggle auto ban system
function toggleAutoBan() {
    autoBanSettings.enabled = !autoBanSettings.enabled;
    localStorage.setItem('autoBanSettings', JSON.stringify(autoBanSettings));
    
    addSystemLog('system', `Auto ban system ${autoBanSettings.enabled ? 'enabled' : 'disabled'}`, currentUser.email);
    
    showMessage(`Auto ban system ${autoBanSettings.enabled ? 'enabled' : 'disabled'}!`, 'success');
    loadAutoBanSettings();
}

// Update auto ban settings
function updateAutoBanSettings(event) {
    event.preventDefault();
    
    autoBanSettings.firstViolationDuration = parseInt(document.getElementById('firstViolationDuration').value);
    autoBanSettings.secondViolationDuration = parseInt(document.getElementById('secondViolationDuration').value);
    autoBanSettings.thirdViolationDuration = parseInt(document.getElementById('thirdViolationDuration').value);
    autoBanSettings.violationsThreshold = parseInt(document.getElementById('violationsThreshold').value);
    autoBanSettings.timeWindow = parseInt(document.getElementById('timeWindow').value);
    
    localStorage.setItem('autoBanSettings', JSON.stringify(autoBanSettings));
    
    addSystemLog('system', 'Auto ban settings updated', currentUser.email);
    
    showMessage('Auto ban settings updated successfully!', 'success');
}

// Add violation log
function addViolationLog(userEmail, type, content, severity) {
    const violation = {
        id: Date.now().toString(),
        userEmail: userEmail,
        type: type,
        content: content,
        severity: severity,
        timestamp: new Date().toISOString(),
        count: 1
    };
    
    violationLogs.push(violation);
    localStorage.setItem('violationLogs', JSON.stringify(violationLogs));
    
    // Update violation tracking
    updateViolationTracking(userEmail);
    
    // Check for auto ban
    if (autoBanSettings.enabled) {
        checkAutoBan(userEmail);
    }
    
    // Add to violation alerts
    addViolationAlert(type, content, severity);
}

// Update violation tracking
function updateViolationTracking(userEmail) {
    if (!violationTracking[userEmail]) {
        violationTracking[userEmail] = {
            count: 0,
            lastViolation: null,
            violations: []
        };
    }
    
    violationTracking[userEmail].count++;
    violationTracking[userEmail].lastViolation = new Date().toISOString();
    violationTracking[userEmail].violations.push({
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('violationTracking', JSON.stringify(violationTracking));
}

// Check auto ban
function checkAutoBan(userEmail) {
    const tracking = violationTracking[userEmail];
    if (!tracking) return;
    
    // Count violations within time window
    const timeWindowMs = autoBanSettings.timeWindow * 60 * 60 * 1000;
    const now = new Date();
    const recentViolations = tracking.violations.filter(v => 
        new Date(v.timestamp) > new Date(now.getTime() - timeWindowMs)
    );
    
    if (recentViolations.length >= autoBanSettings.violationsThreshold) {
        performAutoBan(userEmail, recentViolations.length);
    }
}

// Perform auto ban
function performAutoBan(userEmail, violationCount) {
    const banLevel = getBanLevel(violationCount);
    let duration;
    
    switch (banLevel) {
        case 'First':
            duration = autoBanSettings.firstViolationDuration;
            break;
        case 'Second':
            duration = autoBanSettings.secondViolationDuration;
            break;
        case 'Third':
            duration = autoBanSettings.thirdViolationDuration;
            break;
        default:
            duration = autoBanSettings.thirdViolationDuration;
    }
    
    const banUntil = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
    
    const banData = {
        email: userEmail,
        reason: `Automatic ban - ${violationCount} violations detected`,
        banDate: new Date().toISOString(),
        banUntil: banUntil,
        bannedBy: 'System',
        autoBan: true,
        level: banLevel,
        duration: duration
    };
    
    bannedUsers.push(banData);
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Add to auto ban history
    const autoBanRecord = {
        id: Date.now().toString(),
        userEmail: userEmail,
        reason: banData.reason,
        timestamp: banData.banDate,
        banUntil: banUntil,
        level: banLevel,
        duration: duration,
        violationCount: violationCount
    };
    
    autoBanHistory.push(autoBanRecord);
    localStorage.setItem('autoBanHistory', JSON.stringify(autoBanHistory));
    
    // Add to system logs
    addSystemLog('moderation', `Auto ban: ${userEmail} banned for ${duration} hours (${banLevel} level)`, userEmail);
    
    // Reset violation tracking for this user
    violationTracking[userEmail] = {
        count: 0,
        lastViolation: null,
        violations: []
    };
    localStorage.setItem('violationTracking', JSON.stringify(violationTracking));
    
    showMessage(`User ${userEmail} has been automatically banned for ${duration} hours!`, 'warning');
}

// Get ban level
function getBanLevel(violationCount) {
    if (violationCount <= autoBanSettings.violationsThreshold) {
        return 'First';
    } else if (violationCount <= autoBanSettings.violationsThreshold * 2) {
        return 'Second';
    } else {
        return 'Third';
    }
}

// Get next ban level
function getNextBanLevel(violationCount) {
    if (violationCount < autoBanSettings.violationsThreshold) {
        return 'First';
    } else if (violationCount < autoBanSettings.violationsThreshold * 2) {
        return 'Second';
    } else {
        return 'Third';
    }
}

// Get ban level color
function getBanLevelColor(level) {
    const colors = {
        'First': 'bg-yellow-500/30 text-yellow-300',
        'Second': 'bg-orange-500/30 text-orange-300',
        'Third': 'bg-red-500/30 text-red-300'
    };
    return colors[level] || 'bg-gray-500/30 text-gray-300';
}

// View violation details
function viewViolationDetails(violationId) {
    const violation = violationLogs.find(v => v.id === violationId);
    if (violation) {
        alert(`Violation Details:\n\nUser: ${violation.userEmail}\nType: ${violation.type}\nContent: ${violation.content}\nSeverity: ${violation.severity}\nTimestamp: ${formatDateTime(violation.timestamp)}`);
    }
}

// Delete violation log
function deleteViolationLog(violationId) {
    if (confirm('Are you sure you want to delete this violation log?')) {
        violationLogs = violationLogs.filter(v => v.id !== violationId);
        localStorage.setItem('violationLogs', JSON.stringify(violationLogs));
        
        showMessage('Violation log deleted successfully!', 'success');
        loadViolationLogs();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const uploadModal = document.getElementById('uploadModal');
    const addViolationModal = document.getElementById('addViolationModal');
    
    if (event.target === uploadModal) {
        closeUploadModal();
    }
    if (event.target === addViolationModal) {
        closeAddViolationModal();
    }
}
