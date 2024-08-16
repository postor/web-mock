import express = require('express')
import { init, restapis, websockets, store } from '@web-mock/common/src/client'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { filter, find, fromEvent, interval, map, merge, of, switchMap, takeUntil, tap, throttle } from 'rxjs'
import ws = require('ws')

const app = express()
const server = createServer(app)
const wss = new ws.Server({ server })

const { PORT = 3000 } = process.env

// Middleware to parse JSON
app.use(express.json())


// Universal route handler for '/'
app.use('/', (req, res, next) => {
    if (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket') {
        return next(); // Let the `upgrade` event handler take over
    }
    console.log(`[client][msg]:${req.url}:${JSON.stringify(req.body)}`)
    let row = restapis.get(req.url)
    if (!row) {
        restapis.set({
            id: req.url, url: req.url, type: 'rest', sending: '',
            sendInput: '', initRespondMessage: '', autoRespondMessage: '',
            inputMessagesJson: '', historyMessagesJson: '', detain: false,
            json: true,
        })
        row = restapis.get(req.url)
    }
    row.historyMessages.unshift({
        msg: JSON.stringify(req.body, null, 2),
        type: 'received',
    })
    row.save()
    if (row.autoRespondMessage) {
        console.log(`[mock][msg]:${row.autoRespondMessage}`)
        if (row.json) {
            res.json(JSON.parse(row.autoRespondMessage))
        } else {
            res.send(row.autoRespondMessage)
        }
        row = restapis.get(req.url)
        row.historyMessages.unshift({
            msg: row.autoRespondMessage,
            type: 'sent',
        })
        row.save()
    } else if (row.detain) {
        let listenerId = store.addCellListener(row.type, row.id, 'sending', (
            _0, _1, _2, _3, sendingJson: string
        ) => {
            if (!sendingJson) return
            const { msg: sending } = JSON.parse(sendingJson)
            row = restapis.get(req.url)
            console.log(`[mock][msg]:${sending}`)
            row.sending = ''
            row.historyMessages.unshift({
                msg: sending,
                type: 'sent',
            })
            row.save()
            store.delListener(listenerId)
            if (row.json) {
                console.log({ sending })
                res.json(JSON.parse(sending))
            } else {
                res.send(sending)
            }
        })
    } else {
        let rtn = { message: 'Mock response' }
        row.historyMessages.unshift({
            msg: JSON.stringify(rtn),
            type: 'sent',
        })
        row.save()
        // Handle REST request
        res.json(rtn);
    }
})

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const id = randomUUID()
    let row = websockets.get(req.url)
    if (!row) {
        websockets.set({
            id, url: req.url, type: 'websocket', sending: '',
            sendInput: '', initRespondMessage: '', autoRespondMessage: '',
            inputMessagesJson: '', historyMessagesJson: '',
        })
        row = websockets.get(req.url)
    }

    of(null).pipe(
        // init message 
        tap(() => (row.initRespondMessage && ws.send(row.initRespondMessage))),
        switchMap(() => merge(
            // receive message
            fromEvent(ws, 'message').pipe(
                map((x: MessageEvent) => x.data as string),
                tap(msg => console.log(`[client][msg]:${req.url}:${msg}`)),
                tap(msg => {
                    let row = websockets.get(ws.url)
                    row.historyMessages.unshift({ msg, type: 'received' })
                    row.save()
                })
            ),
            // send message
            row.getObservable('sending').pipe(
                filter(sending => !!sending),
                throttle(() => interval(500)),
                tap(sending => {
                    console.log(`[mock][msg]:${req.url}:${sending}`)
                    ws.send(sending)
                    row = websockets.get(req.url)
                    row.sending = ''
                    row.historyMessages.unshift({
                        msg: sending,
                        type: 'sent',
                    })
                    row.save()
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
    await init()
    server.listen(PORT, () => console.log(`backend server started on ${PORT}`))
}

