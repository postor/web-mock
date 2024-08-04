
type SharedData = {
    path: string
    lastMessage: any
    inputMessage: any
}

export interface IWebSocketData extends SharedData {
}

export interface IRestData extends SharedData {    
}

export const Y_ROOM = 'app_data'
