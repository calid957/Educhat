// Global variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let bannedUsers = JSON.parse(localStorage.getItem('bannedUsers')) || [];
let moderatorLogs = JSON.parse(localStorage.getItem('moderatorLogs')) || [];
let banHistory = JSON.parse(localStorage.getItem('banHistory')) || [];
let violationLogs = JSON.parse(localStorage.getItem('violationLogs')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser || (currentUser.accountType !== 'moderator' && currentUser.accountType !== 'admin')) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeModerator();
    loadBannedUsers();
    showSection('banned-users');
});

// Initialize moderator
function initializeModerator() {
    // Initialize data if not exists
    if (!localStorage.getItem('banHistory')) {
        localStorage.setItem('banHistory', JSON.stringify([]));
    }
    
    updateActiveBansCount();
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
        case 'banned-users':
            loadBannedUsers();
            break;
        case 'ban-management':
            loadBanManagement();
            break;
        case 'user-search':
            loadUserSearch();
            break;
        case 'ban-history':
            loadBanHistory();
            break;
    }
}

// Load banned users
function loadBannedUsers() {
    const grid = document.getElementById('bannedUsersGrid');
    grid.innerHTML = '';
    
    if (bannedUsers.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-white/60 py-8">No banned users found</div>';
        return;
    }
    
    bannedUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'glass p-4 rounded-lg';
        
        const isExpired = new Date(user.banUntil) < new Date();
        const remainingTime = isExpired ? 'Expired' : getTimeRemaining(user.banUntil);
        
        userCard.innerHTML = `
            <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-user-slash"></i>
                </div>
                <div class="ml-3">
                    <h4 class="text-white font-medium">${user.email}</h4>
                    <p class="text-white/60 text-sm">Banned by ${user.bannedBy}</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Reason:</span>
                    <span class="text-white">${user.reason}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Duration:</span>
                    <span class="text-white">${user.duration}h</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Status:</span>
                    <span class="px-2 py-1 rounded-full text-xs ${isExpired ? 'bg-gray-500/30 text-gray-300' : 'bg-red-500/30 text-red-300'}">
                        ${isExpired ? 'Expired' : 'Active'}
                    </span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Time Left:</span>
                    <span class="text-white">${remainingTime}</span>
                </div>
            </div>
            <div class="flex space-x-2 mt-4">
                <button onclick="viewBanDetails('${user.email}')" class="flex-1 bg-blue-500/30 text-blue-300 py-1 px-2 rounded hover:bg-blue-500/40 transition-colors text-sm">
                    <i class="fas fa-eye mr-1"></i>Details
                </button>
                <button onclick="editBan('${user.email}')" class="flex-1 bg-yellow-500/30 text-yellow-300 py-1 px-2 rounded hover:bg-yellow-500/40 transition-colors text-sm">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button onclick="unbanUser('${user.email}')" class="flex-1 bg-green-500/30 text-green-300 py-1 px-2 rounded hover:bg-green-500/40 transition-colors text-sm">
                    <i class="fas fa-undo mr-1"></i>Unban
                </button>
            </div>
        `;
        
        grid.appendChild(userCard);
    });
}

// Load ban management
function loadBanManagement() {
    loadRecentViolations();
    loadBanStatistics();
}

// Load recent violations
function loadRecentViolations() {
    const container = document.getElementById('recentViolations');
    container.innerHTML = '';
    
    const recentViolations = violationLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (recentViolations.length === 0) {
        container.innerHTML = '<p class="text-white/60 text-sm">No recent violations</p>';
        return;
    }
    
    recentViolations.forEach(violation => {
        const violationDiv = document.createElement('div');
        violationDiv.className = 'flex justify-between items-center p-2 bg-white/10 rounded cursor-pointer hover:bg-white/20 transition-colors';
        violationDiv.innerHTML = `
            <div class="flex-1">
                <p class="text-white text-sm font-medium">${violation.userEmail}</p>
                                        <p class="text-white/60 text-xs">${violation.type}</p>
                                    </div>
                                    <button onclick="quickBan('${violation.userEmail}')" class="bg-red-500/30 text-red-300 px-2 py-1 rounded text-xs hover:bg-red-500/40 transition-colors">
                                        <i class="fas fa-gavel"></i>
                                    </button>
                                `;
        container.appendChild(violationDiv);
    });
}

// Load ban statistics
function loadBanStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayBans = banHistory.filter(ban => new Date(ban.banDate) >= today).length;
    const weekBans = banHistory.filter(ban => new Date(ban.banDate) >= weekAgo).length;
    const monthBans = banHistory.filter(ban => new Date(ban.banDate) >= monthAgo).length;
    const totalBans = banHistory.length;
    
    document.getElementById('todayBans').textContent = todayBans;
    document.getElementById('weekBans').textContent = weekBans;
    document.getElementById('monthBans').textContent = monthBans;
    document.getElementById('totalBans').textContent = totalBans;
}

// Load user search
function loadUserSearch() {
    const table = document.getElementById('userSearchResults');
    table.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-white/60">Search for users above</td></tr>';
}

// Load ban history
function loadBanHistory() {
    const table = document.getElementById('banHistoryTable');
    table.innerHTML = '';
    
    if (banHistory.length === 0) {
        table.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-white/60">No ban history found</td></tr>';
        return;
    }
    
    banHistory.sort((a, b) => new Date(b.banDate) - new Date(a.banDate));
    
    banHistory.forEach(ban => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${ban.userEmail}</td>
            <td class="p-3">${ban.reason}</td>
            <td class="p-3">${ban.duration}h</td>
            <td class="p-3">${ban.bannedBy}</td>
            <td class="p-3">${formatDateTime(ban.banDate)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${ban.status === 'active' ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${ban.status}
                </span>
            </td>
            <td class="p-3">
                <button onclick="viewBanHistoryDetails('${ban.id}')" class="text-blue-300 hover:text-blue-200 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Ban user
function banUser(event) {
    event.preventDefault();
    
    const email = document.getElementById('banUserEmail').value;
    const reason = document.getElementById('banReason').value;
    const duration = document.getElementById('banDuration').value;
    
    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
        showMessage('User not found!', 'error');
        return;
    }
    
    // Check if user is already banned
    if (isUserBanned(email)) {
        showMessage('User is already banned!', 'error');
        return;
    }
    
    const banUntil = duration === 'permanent' ? 'permanent' : new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
    
    const banData = {
        email: email,
        reason: reason,
        banDate: new Date().toISOString(),
        banUntil: banUntil,
        bannedBy: currentUser.email,
        duration: duration === 'permanent' ? 'permanent' : parseInt(duration)
    };
    
    // Add to banned users
    bannedUsers.push(banData);
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Add to ban history
    const historyEntry = {
        id: Date.now().toString(),
        userEmail: email,
        reason: reason,
        duration: duration === 'permanent' ? 'permanent' : parseInt(duration),
        bannedBy: currentUser.email,
        banDate: banData.banDate,
        status: 'active'
    };
    banHistory.push(historyEntry);
    localStorage.setItem('banHistory', JSON.stringify(banHistory));
    
    // Add to moderator logs
    addModeratorLog('ban', email, reason, 'success');
    
    showMessage('User banned successfully!', 'success');
    
    // Clear form
    event.target.reset();
    
    // Reload data
    loadBannedUsers();
    loadBanManagement();
    updateActiveBansCount();
}

// Unban user
function unbanUser(email) {
    if (confirm(`Are you sure you want to unban ${email}?`)) {
        // Remove from banned users
        bannedUsers = bannedUsers.filter(user => user.email !== email);
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        
        // Update ban history
        const historyEntry = banHistory.find(ban => ban.userEmail === email && ban.status === 'active');
        if (historyEntry) {
            historyEntry.status = 'unbanned';
            historyEntry.unbannedBy = currentUser.email;
            historyEntry.unbannedDate = new Date().toISOString();
        }
        localStorage.setItem('banHistory', JSON.stringify(banHistory));
        
        // Add to moderator logs
        addModeratorLog('unban', email, 'User unbanned', 'success');
        
        showMessage('User unbanned successfully!', 'success');
        
        // Reload data
        loadBannedUsers();
        loadBanHistory();
        updateActiveBansCount();
    }
}

// Edit ban
function editBan(email) {
    const bannedUser = bannedUsers.find(user => user.email === email);
    if (!bannedUser) return;
    
    document.getElementById('editBanUserId').value = email;
    document.getElementById('editBanEmail').value = email;
    document.getElementById('editBanReason').value = bannedUser.reason;
    document.getElementById('editBanDuration').value = bannedUser.duration === 'permanent' ? 'permanent' : bannedUser.duration.toString();
    
    document.getElementById('editBanModal').classList.remove('hidden');
    document.getElementById('editBanModal').classList.add('flex');
}

// Update ban
function updateBan(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editBanUserId').value;
    const newReason = document.getElementById('editBanReason').value;
    const newDuration = document.getElementById('editBanDuration').value;
    
    const bannedUserIndex = bannedUsers.findIndex(user => user.email === userId);
    if (bannedUserIndex === -1) return;
    
    const oldDuration = bannedUsers[bannedUserIndex].duration;
    
    // Update ban
    bannedUsers[bannedUserIndex].reason = newReason;
    bannedUsers[bannedUserIndex].duration = newDuration === 'permanent' ? 'permanent' : parseInt(newDuration);
    bannedUsers[bannedUserIndex].banUntil = newDuration === 'permanent' ? 'permanent' : new Date(Date.now() + newDuration * 60 * 60 * 1000).toISOString();
    bannedUsers[bannedUserIndex].lastModifiedBy = currentUser.email;
    bannedUsers[bannedUserIndex].lastModifiedDate = new Date().toISOString();
    
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Add to moderator logs
    const action = newDuration > oldDuration ? 'increased' : newDuration < oldDuration ? 'decreased' : 'updated';
    addModeratorLog('edit-ban', userId, `Ban ${action}: ${oldDuration}h → ${newDuration}h`, 'success');
    
    showMessage('Ban updated successfully!', 'success');
    closeEditBanModal();
    
    // Reload data
    loadBannedUsers();
}

// View ban details
function viewBanDetails(email) {
    const bannedUser = bannedUsers.find(user => user.email === email);
    if (!bannedUser) return;
    
    const content = document.getElementById('banDetailsContent');
    const isExpired = new Date(bannedUser.banUntil) < new Date();
    
    content.innerHTML = `
        <div class="space-y-3">
            <div>
                <p class="text-gray-600 text-sm">User Email</p>
                <p class="text-gray-800 font-medium">${bannedUser.email}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Ban Reason</p>
                <p class="text-gray-800">${bannedUser.reason}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Duration</p>
                <p class="text-gray-800">${bannedUser.duration === 'permanent' ? 'Permanent' : bannedUser.duration + ' hours'}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Banned By</p>
                <p class="text-gray-800">${bannedUser.bannedBy}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Ban Date</p>
                <p class="text-gray-800">${formatDateTime(bannedUser.banDate)}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Ban Until</p>
                <p class="text-gray-800">${bannedUser.banUntil === 'permanent' ? 'Permanent' : formatDateTime(bannedUser.banUntil)}</p>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Status</p>
                <span class="px-2 py-1 rounded-full text-xs ${isExpired ? 'bg-gray-500/30 text-gray-300' : 'bg-red-500/30 text-red-300'}">
                    ${isExpired ? 'Expired' : 'Active'}
                </span>
            </div>
            <div>
                <p class="text-gray-600 text-sm">Time Remaining</p>
                <p class="text-gray-800">${isExpired ? 'Expired' : getTimeRemaining(bannedUser.banUntil)}</p>
            </div>
        </div>
    `;
function viewBanHistoryDetails(banId) {
    const ban = banHistory.find(b => b.id === banId);
    if (ban) {
        showAlert(`Ban History Details:\n\nUser: ${ban.userEmail}\nReason: ${ban.reason}\nDuration: ${ban.duration}h\nBanned By: ${ban.bannedBy}\nBan Date: ${formatDateTime(ban.banDate)}\nStatus: ${ban.status}${ban.unbannedDate ? `\nUnbanned By: ${ban.unbannedBy}\nUnbanned Date: ${formatDateTime(ban.unbannedDate)}` : ''}`, 'info', 'Ban History Details');
    }
}

// Quick ban from violations
function quickBan(email) {
    const reason = prompt('Enter ban reason:');
    if (reason) {
        document.getElementById('banUserEmail').value = email;
        document.getElementById('banReason').value = reason;
        showSection('ban-management');
    }
}

// Search banned users
function searchBannedUsers() {
    const searchTerm = document.getElementById('bannedUsersSearch').value.toLowerCase();
    const grid = document.getElementById('bannedUsersGrid');
    grid.innerHTML = '';
    
    const filteredUsers = bannedUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.reason.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-white/60 py-8">No banned users found</div>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'glass p-4 rounded-lg';
        
        const isExpired = new Date(user.banUntil) < new Date();
        const remainingTime = isExpired ? 'Expired' : getTimeRemaining(user.banUntil);
        
        userCard.innerHTML = `
            <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-user-slash"></i>
                </div>
                <div class="ml-3">
                    <h4 class="text-white font-medium">${user.email}</h4>
                    <p class="text-white/60 text-sm">Banned by ${user.bannedBy}</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Reason:</span>
                    <span class="text-white">${user.reason}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Duration:</span>
                    <span class="text-white">${user.duration}h</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Status:</span>
                    <span class="px-2 py-1 rounded-full text-xs ${isExpired ? 'bg-gray-500/30 text-gray-300' : 'bg-red-500/30 text-red-300'}">
                        ${isExpired ? 'Expired' : 'Active'}
                    </span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-white/60">Time Left:</span>
                    <span class="text-white">${remainingTime}</span>
                </div>
            </div>
            <div class="flex space-x-2 mt-4">
                <button onclick="viewBanDetails('${user.email}')" class="flex-1 bg-blue-500/30 text-blue-300 py-1 px-2 rounded hover:bg-blue-500/40 transition-colors text-sm">
                    <i class="fas fa-eye mr-1"></i>Details
                </button>
                <button onclick="editBan('${user.email}')" class="flex-1 bg-yellow-500/30 text-yellow-300 py-1 px-2 rounded hover:bg-yellow-500/40 transition-colors text-sm">
                    <i class="fas fa-edit mr-1"></i>Edit
                </button>
                <button onclick="unbanUser('${user.email}')" class="flex-1 bg-green-500/30 text-green-300 py-1 px-2 rounded hover:bg-green-500/40 transition-colors text-sm">
                    <i class="fas fa-undo mr-1"></i>Unban
                </button>
            </div>
        `;
        
        grid.appendChild(userCard);
    });
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    const accountTypeFilter = document.getElementById('accountTypeFilter').value;
    const classFilter = document.getElementById('classFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const table = document.getElementById('userSearchResults');
    table.innerHTML = '';
    
    let filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.email.toLowerCase().includes(searchTerm) ||
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm);
        
        const matchesAccountType = !accountTypeFilter || user.accountType === accountTypeFilter;
        const matchesClass = !classFilter || user.classTrade === classFilter;
        const matchesStatus = !statusFilter || 
            (statusFilter === 'banned' && isUserBanned(user.email)) ||
            (statusFilter === 'active' && !isUserBanned(user.email));
        
        return matchesSearch && matchesAccountType && matchesClass && matchesStatus;
    });
    
    if (filteredUsers.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-white/60">No users found</td></tr>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const isBanned = isUserBanned(user.email);
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">
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
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${isBanned ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${isBanned ? 'Banned' : 'Active'}
                </span>
            </td>
            <td class="p-3">
                ${isBanned ? 
                    `<button onclick="unbanUser('${user.email}')" class="bg-green-500/30 text-green-300 px-3 py-1 rounded hover:bg-green-500/40 transition-colors text-sm">
                        <i class="fas fa-undo mr-1"></i>Unban
                    </button>` :
                    `<button onclick="banUserFromSearch('${user.email}')" class="bg-red-500/30 text-red-300 px-3 py-1 rounded hover:bg-red-500/40 transition-colors text-sm">
                        <i class="fas fa-gavel mr-1"></i>Ban
                    </button>`
                }
            </td>
        `;
        table.appendChild(row);
    });
}

// Ban user from search
function banUserFromSearch(email) {
    document.getElementById('banUserEmail').value = email;
    showSection('ban-management');
}

// Search ban history
function searchBanHistory() {
    const searchTerm = document.getElementById('banHistorySearch').value.toLowerCase();
    const table = document.getElementById('banHistoryTable');
    table.innerHTML = '';
    
    const filteredHistory = banHistory.filter(ban => 
        ban.userEmail.toLowerCase().includes(searchTerm) ||
        ban.reason.toLowerCase().includes(searchTerm) ||
        ban.bannedBy.toLowerCase().includes(searchTerm)
    );
    
    if (filteredHistory.length === 0) {
        table.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-white/60">No ban history found</td></tr>';
        return;
    }
    
    filteredHistory.forEach(ban => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/10';
        row.innerHTML = `
            <td class="p-3">${ban.userEmail}</td>
            <td class="p-3">${ban.reason}</td>
            <td class="p-3">${ban.duration}h</td>
            <td class="p-3">${ban.bannedBy}</td>
            <td class="p-3">${formatDateTime(ban.banDate)}</td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs ${ban.status === 'active' ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}">
                    ${ban.status}
                </span>
            </td>
            <td class="p-3">
                <button onclick="viewBanHistoryDetails('${ban.id}')" class="text-blue-300 hover:text-blue-200 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Helper functions
function isUserBanned(email) {
    return bannedUsers.some(user => user.email === email && new Date(user.banUntil) > new Date());
}

function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function getTimeRemaining(banUntil) {
    if (banUntil === 'permanent') return 'Permanent';
    
    const now = new Date();
    const banDate = new Date(banUntil);
    const diff = banDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getAccountTypeColor(accountType) {
    const colors = {
        'student': 'bg-blue-500/30 text-blue-300',
        'teacher': 'bg-green-500/30 text-green-300',
        'admin': 'bg-purple-500/30 text-purple-300',
        'moderator': 'bg-yellow-500/30 text-yellow-300'
    };
    return colors[accountType] || 'bg-gray-500/30 text-gray-300';
}

function updateActiveBansCount() {
    const activeBans = bannedUsers.filter(user => new Date(user.banUntil) > new Date()).length;
    document.getElementById('activeBansCount').textContent = activeBans;
}

function addModeratorLog(action, target, details, status) {
    const log = {
        id: Date.now(),
        moderator: currentUser.email,
        action: action,
        target: target,
        details: details,
        status: status,
        timestamp: new Date().toISOString()
    };
    
    moderatorLogs.push(log);
    localStorage.setItem('moderatorLogs', JSON.stringify(moderatorLogs));
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

// Modal functions
function closeBanDetailsModal() {
    document.getElementById('banDetailsModal').classList.add('hidden');
    document.getElementById('banDetailsModal').classList.remove('flex');
}

function closeEditBanModal() {
    document.getElementById('editBanModal').classList.add('hidden');
    document.getElementById('editBanModal').classList.remove('flex');
}

function logout() {
    addModeratorLog('logout', currentUser.email, 'Moderator logout', 'success');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const banDetailsModal = document.getElementById('banDetailsModal');
    const editBanModal = document.getElementById('editBanModal');
    
    if (event.target === banDetailsModal) {
        closeBanDetailsModal();
    }
    if (event.target === editBanModal) {
        closeEditBanModal();
    }
}
