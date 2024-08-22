
export type MessageType = 'sent' | 'received'
export type HistoryMessageItem = {
    message: string
    type: MessageType
    time: number
}
export type InputMessageItem = {
    message: string
}
export type SharedOptionalData = {
    lastConnectTime: number
    autoRespondMessage: string
    sending: string
    inputMessages: {
        limit: number
        list: InputMessageItem[]
    }
    historyMessages: {
        limit: number
        list: HistoryMessageItem[]
    }
}

export type SharedData = {
    id: string
    url: string
}

type WebsocketOptionalData = {
    type: 'websocket'
    initMessage: string
}

export type IWebSocketDataCreate = SharedData
export type IWebSocketData = IWebSocketDataCreate & SharedOptionalData & WebsocketOptionalData

type RestOptionalData = {
    type: 'rest'
    detain: boolean
    json: boolean
}

export type IRestDataCreate = SharedData
export type IRestData = IRestDataCreate & SharedOptionalData & RestOptionalData

export type TableTypeMap = {
    websocket: {
        omit: IWebSocketDataCreate,
        full: IWebSocketData
    }
    rest: {
        omit: IRestDataCreate,
        full: IRestData
    }
}