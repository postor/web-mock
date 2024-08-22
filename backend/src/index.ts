import express = require('express')
import { init, getTable, store } from '@web-mock/common/src/client'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { filter, find, fromEvent, fromEventPattern, interval, map, merge, of, switchMap, takeUntil, tap, throttle } from 'rxjs'
import ws = require('ws')
import { setTimeout } from 'node:timers/promises'

const app = express()
const server = createServer(app)
const wss = new ws.Server({ server })

const { PORT = 3000 } = process.env

// Middleware to parse JSON
app.use(express.json())


// Universal route handler for '/'
app.use('/', (req, res, next) => {
    const restapis = getTable('rest')
    if (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket') {
        return next(); // Let the `upgrade` event handler take over
    }
    console.log(`[client][msg][req]:${req.url}:${JSON.stringify(req.body)}`)
    let row = restapis.get(req.url)
    if (!row) {
        restapis.create({
            id: req.url, url: req.url
        })
        row = restapis.get(req.url)
    }
    restapis.pushHistoryMessage(req.url, JSON.stringify(req.body, null, 2), 'received')
    let autoResponse = row.get('autoRespondMessage')
    if (autoResponse) {
        console.log(`[mock][msg]:${autoResponse}`)
        if (row.get('json')) {
            res.json(JSON.parse(autoResponse))
        } else {
            res.send(autoResponse)
        }
        row = restapis.get(req.url)
        restapis.pushHistoryMessage(req.url, autoResponse, 'sent')
    } else if (row.get('detain')) {
        const cb = event => {
            event.changes.keys.forEach((change, key) => {
                const sending = row.get('sending')
                if (sending) {
                    restapis.pushHistoryMessage(req.url, sending, 'sent')
                    row.set('sending', '')
                    row.unobserve(cb)
                    console.log(`[mock][msg]:${sending}`)
                    if (row.get('json')) {
                        res.json(JSON.parse(sending))
                    } else {
                        res.send(sending)
                    }
                }
            })
        }
        row.observe(cb)
    } else {
        let rtn = { message: 'Mock response' }
        restapis.pushHistoryMessage(req.url, JSON.stringify(rtn), 'sent')
        console.log(`[mock][msg]:${JSON.stringify(rtn)}`)
        res.json(rtn);
    }
})

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const websockets = getTable('websocket')
    const id = randomUUID()
    let row = websockets.get(req.url)
    if (!row) {
        websockets.create({ id, url: req.url, })
        row = websockets.get(id)
    }

    of(null).pipe(
        // init message 
        tap(() => {
            const initMessage = row.get('initMessage')
            if (initMessage) {
                ws.send(initMessage)
                console.log(`[mock][msg]:${initMessage}`)
                websockets.pushHistoryMessage(req.url, initMessage, 'sent')
            }
        }),
        switchMap(() => merge(
            // receive message
            fromEvent(ws, 'message').pipe(
                map((x: MessageEvent) => x.data as string),
                tap(msg => console.log(`[client][msg]:${req.url}:${msg}`)),
                tap(msg => {
                    console.log(`[mock][msg][receive]:${msg}`)
                    websockets.pushHistoryMessage(id, msg, 'received')
                })
            ),
            // send message
            fromEventPattern(
                handler => row.observe(handler),
                handler => row.unobserve(handler)
            ).pipe(
                map(_ => row.get('sending')),
                filter(sending => !!sending),
                throttle(() => interval(500)),
                tap(sending => {
                    console.log(`[mock][msg]:${req.url}:${sending}`)
                    ws.send(sending)
                    row = websockets.get(id)
                    row.set('sending', '')
                    console.log(`[mock][msg]:${sending}`)
                    websockets.pushHistoryMessage(id, sending, 'sent')
                }),
            )
        )),
        takeUntil(merge(
            fromEvent(ws, 'close'),
            fromEvent(ws, 'error'),
        )),
    ).subscribe()

})

main()

async function main() {
    console.log('backend init...')
    await init()
    await setTimeout(2000)
    server.listen(PORT, () => console.log(`backend server started on ${PORT}`))
}

