const { readDatabase, writeDatabase } = require('./database');
const { generateToken, authenticate, getCorsHeaders, handleCorsPreflight, successResponse, errorResponse } = require('./auth');

// Helper function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper function to generate user ID
function generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Main handler
exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handleCorsPreflight();
    }

    try {
        const db = readDatabase();
        const { httpMethod, path } = event;
        
        console.log(`${httpMethod} ${path}`);
        
        // GET /users - Get all users (authenticated)
        if (httpMethod === 'GET' && path === '/users') {
            const user = authenticate(event);
            if (!user) {
                return errorResponse('Authentication required', 401);
            }
            
            return successResponse({
                users: db.users.map(u => ({
                    id: u.id,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    accountType: u.accountType,
                    classTrade: u.classTrade,
                    gender: u.gender,
                    accountDefinition: u.accountDefinition,
                    createdAt: u.createdAt,
                    lastLogin: u.lastLogin,
                    isActive: u.isActive
                }))
            });
        }
        
        // POST /users - Create new user (signup)
        if (httpMethod === 'POST' && path === '/users') {
            const userData = JSON.parse(event.body);
            
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'password', 'accountType', 'classTrade', 'gender', 'accountDefinition'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    return errorResponse(`Missing required field: ${field}`);
                }
            }
            
            // Validate email format
            if (!validateEmail(userData.email)) {
                return errorResponse('Invalid email format');
            }
            
            // Check if user already exists
            const existingUser = db.users.find(u => u.email === userData.email);
            if (existingUser) {
                return errorResponse('User with this email already exists', 409);
            }
            
            // Create new user
            const newUser = {
                id: generateUserId(),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password, // In production, this should be hashed
                accountType: userData.accountType,
                classTrade: userData.classTrade,
                gender: userData.gender,
                accountDefinition: userData.accountDefinition,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true
            };
            
            db.users.push(newUser);
            writeDatabase(db);
            
            // Generate JWT token
            const token = generateToken(newUser);
            
            // Return user without password and with token
            const { password, ...userWithoutPassword } = newUser;
            
            console.log(`User created: ${userData.email}`);
            
            return successResponse({
                user: userWithoutPassword,
                token,
                message: 'User created successfully'
            }, 201);
        }
        
        // PUT /users/login - Login user
        if (httpMethod === 'PUT' && path === '/users/login') {
            const { email, password } = JSON.parse(event.body);
            
            // Validate input
            if (!email || !password) {
                return errorResponse('Email and password are required');
            }
            
            // Find user
            const user = db.users.find(u => u.email === email && u.password === password && u.isActive);
            
            if (!user) {
                return errorResponse('Invalid email or password', 401);
            }
            
            // Update last login
            user.lastLogin = new Date().toISOString();
            writeDatabase(db);
            
            // Generate JWT token
            const token = generateToken(user);
            
            // Return user without password and with token
            const { password: _, ...userWithoutPassword } = user;
            
            console.log(`User logged in: ${email}`);
            
            return successResponse({
                user: userWithoutPassword,
                token,
                message: 'Login successful'
            });
        }
        
        // GET /users/me - Get current user profile
        if (httpMethod === 'GET' && path === '/users/me') {
            const authUser = authenticate(event);
            if (!authUser) {
                return errorResponse('Authentication required', 401);
            }
            
            const user = db.users.find(u => u.id === authUser.userId);
            if (!user) {
                return errorResponse('User not found', 404);
            }
            
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            
            return successResponse({
                user: userWithoutPassword
            });
        }
        
        // PUT /users/me - Update current user profile
        if (httpMethod === 'PUT' && path === '/users/me') {
            const authUser = authenticate(event);
            if (!authUser) {
                return errorResponse('Authentication required', 401);
            }
            
            const updateData = JSON.parse(event.body);
            const userIndex = db.users.findIndex(u => u.id === authUser.userId);
            
            if (userIndex === -1) {
                return errorResponse('User not found', 404);
            }
            
            // Update user (don't allow password change through this endpoint)
            const { password, id, email, createdAt, ...allowedUpdates } = updateData;
            db.users[userIndex] = { ...db.users[userIndex], ...allowedUpdates };
            writeDatabase(db);
            
            // Return updated user without password
            const { password: _, ...userWithoutPassword } = db.users[userIndex];
            
            return successResponse({
                user: userWithoutPassword,
                message: 'Profile updated successfully'
            });
        }
        
        // PUT /users/me/password - Change password
        if (httpMethod === 'PUT' && path === '/users/me/password') {
            const authUser = authenticate(event);
            if (!authUser) {
                return errorResponse('Authentication required', 401);
            }
            
            const { currentPassword, newPassword } = JSON.parse(event.body);
            
            if (!currentPassword || !newPassword) {
                return errorResponse('Current password and new password are required');
            }
            
            const userIndex = db.users.findIndex(u => u.id === authUser.userId);
            if (userIndex === -1) {
                return errorResponse('User not found', 404);
            }
            
            // Verify current password
            if (db.users[userIndex].password !== currentPassword) {
                return errorResponse('Current password is incorrect', 401);
            }
            
            // Update password
            db.users[userIndex].password = newPassword;
            writeDatabase(db);
            
            return successResponse({
                message: 'Password changed successfully'
            });
        }
        
        // GET /users/{id} - Get specific user (authenticated)
        if (httpMethod === 'GET' && path.startsWith('/users/') && !path.includes('/me')) {
            const authUser = authenticate(event);
            if (!authUser) {
                return errorResponse('Authentication required', 401);
            }
            
            const userId = path.split('/users/')[1];
            const user = db.users.find(u => u.id === userId);
            
            if (!user) {
                return errorResponse('User not found', 404);
            }
            
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            
            return successResponse({
                user: userWithoutPassword
            });
        }
        
        // Health check endpoint
        if (httpMethod === 'GET' && path === '/users/health') {
            return successResponse({
                status: 'healthy',
                message: 'Users API is working',
                userCount: db.users.length,
                timestamp: new Date().toISOString()
            });
        }
        
        // Route not found
        return errorResponse('Route not found', 404);
        
    } catch (error) {
        console.error('Users API Error:', error);
        return errorResponse('Internal server error', 500);
    }
};
