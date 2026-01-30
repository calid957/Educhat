const fs = require('fs');
const path = require('path');

// Simple file-based database for Netlify Functions
const DB_PATH = path.join(__dirname, '../data/database.json');

// Initialize database file if it doesn't exist
function initDatabase() {
    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    }
    
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({
            users: [],
            messages: [],
            channels: []
        }, null, 2));
    }
}

// Read database
function readDatabase() {
    initDatabase();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
}

// Write database
function writeDatabase(data) {
    initDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Get all users
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
        const { httpMethod, body, path } = event;
        const db = readDatabase();

        switch (httpMethod) {
            case 'GET':
                if (path === '/.netlify/functions/users') {
                    // Get all users
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ users: db.users })
                    };
                }
                break;

            case 'POST':
                if (path === '/.netlify/functions/users') {
                    // Create new user
                    const userData = JSON.parse(body);
                    
                    // Check if user already exists
                    if (db.users.find(u => u.email === userData.email)) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'User already exists' })
                        };
                    }

                    // Add new user
                    const newUser = {
                        id: Date.now(),
                        ...userData,
                        createdAt: new Date().toISOString()
                    };
                    
                    db.users.push(newUser);
                    writeDatabase(db);

                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ user: newUser })
                    };
                }
                break;

            case 'PUT':
                if (path === '/.netlify/functions/users/login') {
                    // Login user
                    const { email, password } = JSON.parse(body);
                    const user = db.users.find(u => u.email === email && u.password === password);
                    
                    if (user) {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ user })
                        };
                    } else {
                        return {
                            statusCode: 401,
                            headers,
                            body: JSON.stringify({ error: 'Invalid credentials' })
                        };
                    }
                }
                break;

            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint not found' })
        };

    } catch (error) {
        console.error('Database function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Export helper functions for use in other functions
module.exports = {
    readDatabase,
    writeDatabase,
    initDatabase
};
