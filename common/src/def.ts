import { Row } from "tinybase/store"

interface OptionalData {
    historyMessagesJson: string
    inputMessagesJson: string
    connectTime: number
    autoRespondMessage: string
    sending: string
    sendInput: string
}

type PartialOrFull = {
    partial: Partial<OptionalData>
    full: OptionalData,
    omit: {},
}


export type SharedData<T extends keyof PartialOrFull> = {
    id: string
    url: string
} & PartialOrFull[T]

export type IWebSocketData<T extends keyof PartialOrFull = 'full'> = SharedData<T> & {
    type: 'websocket'
    initRespondMessage: string
};

export type IRestData<T extends keyof PartialOrFull = 'full'> = SharedData<T> & {
    type: 'rest'
    detain: boolean
    json: boolean
}

export type TableTypeMap = {
    websocket: {
        [T in keyof PartialOrFull]: {
            data: IWebSocketData<T>
            row: IWebSocketData<T> & Row
        }
    }
    rest: {
        [T in keyof PartialOrFull]: {
            data: IRestData<T>
            row: IRestData<T> & Row
        }
    }
}

export enum MockEventType {
    connect = 'connect',
    disconnect = 'disconnect',
    request = 'request',
    send = 'send',
    update = 'send',
}