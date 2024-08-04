
import { IRestData, IWebSocketData } from '@web-mock/common/src/def'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import ws = require('ws')

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:3010', 'my-roomname', doc, { WebSocketPolyfill: ws as any })

let websockets = doc.getArray('websockets1')

wsProvider.on('status', (event: { status: 'connected' | 'disconnected' }) => {
    console.log(event.status) // logs "connected" or "disconnected"
    // websockets.push([{t:1}])
})
wsProvider.on('synced', (isSynced: boolean) => {
    console.log({isSynced})
    if (isSynced) {
        console.log({ isSynced: websockets.toArray(), length: websockets.length })
    }
})
websockets.observe(e => console.log({ observe: websockets.toArray(), length: websockets.length }))

