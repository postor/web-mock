import { Row } from "tinybase/store"


export interface SharedData extends Row {
    id: string
    url: string
    historyMessagesJson: string
    inputMessagesJson: string
    connectTime: number
    autoRespondMessage: string
}

export interface IWebSocketData extends SharedData {
    type: 'websocket'
    initRespondMessage: string
}

export interface IRestData extends SharedData {
    type: 'rest'
}

export enum MockEventType {
    connect = 'connect',
    disconnect = 'disconnect',
    request = 'request',
    send = 'send',
    update = 'send',
}