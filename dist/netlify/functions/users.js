const { readDatabase, writeDatabase } = require('./database');

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
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        const db = readDatabase();
        const { httpMethod, path } = event;
        
        console.log(`${httpMethod} ${path}`);
        
        // GET /users - Get all users
        if (httpMethod === 'GET' && path === '/users') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    users: db.users.map(user => ({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        accountType: user.accountType,
                        classTrade: user.classTrade,
                        gender: user.gender,
                        accountDefinition: user.accountDefinition,
                        createdAt: user.createdAt
                    }))
                })
            };
        }
        
        // POST /users - Create new user (signup)
        if (httpMethod === 'POST' && path === '/users') {
            const userData = JSON.parse(event.body);
            
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'password', 'accountType', 'classTrade', 'gender', 'accountDefinition'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: `Missing required field: ${field}`
                        })
                    };
                }
            }
            
            // Validate email format
            if (!validateEmail(userData.email)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid email format'
                    })
                };
            }
            
            // Check if user already exists
            const existingUser = db.users.find(u => u.email === userData.email);
            if (existingUser) {
                return {
                    statusCode: 409,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User with this email already exists'
                    })
                };
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
            
            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            
            console.log(`User created: ${userData.email}`);
            
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: userWithoutPassword,
                    message: 'User created successfully'
                })
            };
        }
        
        // PUT /users/login - Login user
        if (httpMethod === 'PUT' && path === '/users/login') {
            const { email, password } = JSON.parse(event.body);
            
            // Validate input
            if (!email || !password) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Email and password are required'
                    })
                };
            }
            
            // Find user
            const user = db.users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid email or password'
                    })
                };
            }
            
            // Update last login
            user.lastLogin = new Date().toISOString();
            writeDatabase(db);
            
            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            
            console.log(`User logged in: ${email}`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: userWithoutPassword,
                    message: 'Login successful'
                })
            };
        }
        
        // GET /users/{id} - Get specific user
        if (httpMethod === 'GET' && path.startsWith('/users/')) {
            const userId = path.split('/users/')[1];
            const user = db.users.find(u => u.id === userId);
            
            if (!user) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User not found'
                    })
                };
            }
            
            // Return user without password
            const { password, ...userWithoutPassword } = user;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: userWithoutPassword
                })
            };
        }
        
        // PUT /users/{id} - Update user
        if (httpMethod === 'PUT' && path.startsWith('/users/')) {
            const userId = path.split('/users/')[1];
            const updateData = JSON.parse(event.body);
            
            const userIndex = db.users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User not found'
                    })
                };
            }
            
            // Update user (don't allow password change through this endpoint)
            const { password, ...allowedUpdates } = updateData;
            db.users[userIndex] = { ...db.users[userIndex], ...allowedUpdates };
            writeDatabase(db);
            
            // Return updated user without password
            const { password: _, ...userWithoutPassword } = db.users[userIndex];
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: userWithoutPassword,
                    message: 'User updated successfully'
                })
            };
        }
        
        // DELETE /users/{id} - Delete user
        if (httpMethod === 'DELETE' && path.startsWith('/users/')) {
            const userId = path.split('/users/')[1];
            const userIndex = db.users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'User not found'
                    })
                };
            }
            
            const deletedUser = db.users[userIndex];
            db.users.splice(userIndex, 1);
            writeDatabase(db);
            
            // Return deleted user without password
            const { password, ...userWithoutPassword } = deletedUser;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: userWithoutPassword,
                    message: 'User deleted successfully'
                })
            };
        }
        
        // Health check endpoint
        if (httpMethod === 'GET' && path === '/users/health') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    status: 'healthy',
                    message: 'Users API is working',
                    userCount: db.users.length
                })
            };
        }
        
        // Route not found
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Route not found'
            })
        };
        
    } catch (error) {
        console.error('Users API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
