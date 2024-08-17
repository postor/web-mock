
export type SharedOptionalData = {
    lastConnectTime: number
    autoRespondMessage: string
    sending: string
    inputMessages: {
        limit: number
        list: {
            message: string
        }[]
    }
    historyMessages: {
        limit: number
        list: {
            message: string
            type: 'sent' | 'received'
            time: number
        }[]
    }
}

export type SharedData = {
    id: string
    url: string
}

type WebsocketOptionalData = {
    type: 'websocket'
    initRespondMessage: string
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