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

// Channels API
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
                if (path === '/.netlify/functions/channels') {
                    // Get all channels
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ channels: db.channels })
                    };
                }
                break;

            case 'POST':
                if (path === '/.netlify/functions/channels') {
                    // Create new channel
                    const channelData = JSON.parse(body);
                    
                    const newChannel = {
                        id: Date.now(),
                        ...channelData,
                        createdAt: new Date().toISOString()
                    };
                    
                    db.channels.push(newChannel);
                    writeDatabase(db);

                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ channel: newChannel })
                    };
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
        console.error('Channels function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
