// Authentication middleware for Netlify Functions
const jwt = require('jsonwebtoken');

// In production, use a proper secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { 
            userId: user.id, 
            email: user.email,
            accountType: user.accountType 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Authentication middleware
function authenticate(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    return verifyToken(token);
}

// CORS headers
function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };
}

// Handle CORS preflight
function handleCorsPreflight() {
    return {
        statusCode: 200,
        headers: getCorsHeaders()
    };
}

// Success response
function successResponse(data, statusCode = 200) {
    return {
        statusCode,
        headers: getCorsHeaders(),
        body: JSON.stringify({
            success: true,
            ...data
        })
    };
}

// Error response
function errorResponse(message, statusCode = 400) {
    return {
        statusCode,
        headers: getCorsHeaders(),
        body: JSON.stringify({
            success: false,
            error: message
        })
    };
}

module.exports = {
    generateToken,
    verifyToken,
    authenticate,
    getCorsHeaders,
    handleCorsPreflight,
    successResponse,
    errorResponse
};
