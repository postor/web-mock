import express = require('express')
import { convertJsonToYjs, getTable, init } from '@web-mock/common'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { setTimeout } from 'node:timers/promises'
import { filter, fromEvent, fromEventPattern, interval, map, merge, of, switchMap, takeUntil, tap, throttle } from 'rxjs'
import ws = require('ws')

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
        row.set('detaining', true)
        const cb = event => {
            const sending = row.get('sending')
            if (sending) {
                restapis.pushHistoryMessage(req.url, sending, 'sent')
                row.set('sending', '')
                row.set('detaining', false)
                row.unobserveDeep(cb)
                console.log(`[mock][msg]:${sending}`)
                if (row.get('json')) {
                    console.log(`res.json`, JSON.parse(sending))
                    res.json(JSON.parse(sending))
                } else {
                    res.send(sending)
                }
            }
        }
        row.observeDeep(cb)
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
        websockets.create({ id: req.url, url: req.url, }, id)
        row = websockets.get(req.url)
    } else {
        if (!row.get('connections').get(id))
            websockets.addConnection(req.url, id)
    }

    of(null).pipe(
        // init message 
        tap(() => {
            const initMessage = row.get('initMessage')
            if (initMessage) {
                ws.send(initMessage)
                console.log(`[mock][msg]:${initMessage}`)
                websockets.pushHistoryMessage(req.url, initMessage, 'sent', id)
            }
        }),
        switchMap(() => merge(
            // receive message
            fromEvent(ws, 'message').pipe(
                map((x: MessageEvent) => x.data as string),
                tap(msg => console.log(`[client][msg]:${req.url}:${msg}`)),
                tap(msg => {
                    console.log(`[mock][msg][receive]:${msg}`)
                    websockets.pushHistoryMessage(req.url, msg, 'received', id)
                })
            ),
            // send message
            of(row.get('connections').get(id)).pipe(
                // tap(row => console.log(row.toJSON())),
                switchMap((row) => fromEventPattern(
                    handler => row.observeDeep(handler),
                    handler => row.unobserveDeep(handler)
                ).pipe(
                    // tap(_ => console.log(row.toJSON())),
                    map(_ => row.get('sending')),
                    filter(sending => !!sending),
                    throttle(() => interval(500)),
                    tap(sending => {
                        console.log(`[mock][msg]:${req.url}:${sending}`)
                        ws.send(sending)
                        row.set('sending', '')
                        console.log(`[mock][msg]:${sending}`)
                        websockets.pushHistoryMessage(req.url, sending, 'sent', id)
                    }),
                ),
                )
            )
        )),
        takeUntil(
            merge(
                fromEvent(ws, 'close'),
                fromEvent(ws, 'error'),
            ).pipe(tap(() => {
                websockets.removeConnection(req.url, id)
            }))
        ),
    ).subscribe()

})

main()

async function main() {
    console.log('backend init...')
    await init()
    await setTimeout(2000)
    getTable('websocket').list().forEach(x => convertJsonToYjs({}, x, 'connections'))
    server.listen(PORT, () => console.log(`backend server started on ${PORT}`))
}

