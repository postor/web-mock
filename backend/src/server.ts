import express = require('express')
import { createServer } from 'node:http'
import ws = require('ws')
import WebSocketJSONStream = require('@teamwork/websocket-json-stream')

export const app = express()
export const server = createServer(app)
export const wss = new ws.Server({ server })


// Middleware to parse JSON
app.use(express.json())


// Universal route handler for '/'
app.use('/', (req, res, next) => {
    // Check if it's a WebSocket upgrade request
    if (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket') {
        return next(); // Let the `upgrade` event handler take over
    }

    // Handle REST request
    res.json({ message: 'This is a REST response from /' });
})

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
    console.log(request.url)
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send('Hello from the WebSocket server');
    });

    ws.send('Welcome to the WebSocket server');
})

server.listen(3000)