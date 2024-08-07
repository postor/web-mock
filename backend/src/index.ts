import express = require('express')
import { createServer } from 'node:http'
import ws = require('ws')
import { init, websockets, restapis } from '@web-mock/common/src/client-backend'
import { fromEvent, map, of, switchMap, takeUntil, tap } from 'rxjs'
import { randomUUID } from 'node:crypto'

const app = express()
const server = createServer(app)
const wss = new ws.Server({ server })



// Middleware to parse JSON
app.use(express.json())


// Universal route handler for '/'
app.use('/', (req, res, next) => {
    if (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket') {
        return next(); // Let the `upgrade` event handler take over
    }

    // Handle REST request
    res.json({ message: 'This is a REST response from /' });
})

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
    let id = randomUUID()

    of(null).pipe(
        tap(() => {
            let row = websockets.get(ws.url)
            if (!row) {
                websockets.set({ id, url: request.url, type: 'websocket', connectTime: new Date().getTime() })
            }
        }),
        map(() => websockets.get(id)),
        tap((row) => (row.initRespondMessage && ws.send(row.initRespondMessage))),
        switchMap(row => fromEvent(ws, 'message').pipe(
            tap((msg: string) => websockets.pushHistory({ msg, type: 'received' }, websockets.get(id)))
        )),
        takeUntil(fromEvent(ws, 'close')),
        takeUntil(fromEvent(ws, 'error')),
    ).subscribe()

    
})

async function main() {
    await init()
    server.listen(3000)
}
