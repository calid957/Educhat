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

// Messages API
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
                if (path === '/.netlify/functions/messages') {
                    // Get all messages or filter by chatId
                    const { chatId } = event.queryStringParameters || {};
                    let messages = db.messages;
                    
                    if (chatId) {
                        messages = messages.filter(m => m.chatId === chatId);
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ messages })
                    };
                }
                break;

            case 'POST':
                if (path === '/.netlify/functions/messages') {
                    // Create new message
                    const messageData = JSON.parse(body);
                    
                    const newMessage = {
                        id: Date.now(),
                        ...messageData,
                        timestamp: messageData.timestamp || Date.now()
                    };
                    
                    db.messages.push(newMessage);
                    writeDatabase(db);

                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ message: newMessage })
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
        console.error('Messages function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
