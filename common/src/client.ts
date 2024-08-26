import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { WebSocket } from 'ws'
import { HistoryMessageItem, MessageType, TableTypeMap } from './def'

const { WS_TINYBASE = 'ws://localhost:1234' } = process.env

export type TableName = keyof TableTypeMap

export const store = new Y.Doc()

export async function init() {
    await new Promise(resolve => {
        const wsProvider = new WebsocketProvider(WS_TINYBASE, 'default-room', store, {
            WebSocketPolyfill: WebSocket as any
        })
        let cb = () => {
            let root = store.getMap()

            // init tables
            if (!root.get('tables')) {
                convertJsonToYjs({
                    rest: [],
                    websocket: [],
                }, root, 'tables')
            }
            // unregister
            wsProvider.off('sync', cb)
            resolve(null)
        }
        wsProvider.on('sync', cb)
    })
}

export function getTable<T extends TableName>(name: T) {

    const inputMessages = {
        limit: 3,
        list: new Array(3).fill(0).map(() => ({
            message: ''
        }))
    }

    let tables = store.getMap().get('tables') as JsonToYjs<{
        rest: TableTypeMap['rest']['full'][],
        websocket: TableTypeMap['websocket']['full'][],
    }>

    return {
        list,
        create,
        get,
        pushHistoryMessage,
        addConnection,
        removeConnection,
    }



    function get(id: string) {
        // @ts-ignore
        return list().toArray().find((x) => x.get('id') === id) as JsonToYjs<TableTypeMap[T]['full']>
    }

    function list() {
        return tables.get(name)
    }

    function pushHistoryMessage(...args: T extends 'rest'
        ? [id: string, msg: string, type: MessageType]
        : [id: string, msg: string, type: MessageType, websocketId: string]
    ) {
        const [id, msg, type, websocketId = undefined] = args
        const row = get(id)
        const historyMessages: JsonToYjs<{
            limit: number
            list: HistoryMessageItem[]
        }> = (name === 'rest')
                ? (row as JsonToYjs<TableTypeMap['rest']['full']>).get('historyMessages')
                : (row as JsonToYjs<TableTypeMap['websocket']['full']>).get('connections').get(websocketId).get('historyMessages')

        const msgs = historyMessages.get('list')
        convertJsonToYjs({
            message: msg,
            type,
            time: new Date().getTime()
        } satisfies HistoryMessageItem, msgs)
        if (msgs.length > historyMessages.get('limit')) {
            msgs.delete(0, msgs.length - historyMessages.get('limit'))
        }
        row.set('lastConnectTime', new Date().getTime())
    }

    function addConnection(id: string, websocketId: string) {
        let row = get(id) as T extends 'websocket' ? ReturnType<typeof get> : never
        convertJsonToYjs({
            historyMessages: { limit: 20, list: [] },
            inputMessages,
            lastConnectTime: new Date().getTime(),
            sending: '',
            autoRespondMessage: '',
        }, row.get('connections'), websocketId)
    }

    function removeConnection(id: string, websocketId: string) {
        let row = get(id) as T extends 'websocket' ? ReturnType<typeof get> : never
        row.get('connections').delete(websocketId)
    }

    function create(...args: T extends 'rest'
        ? [val: TableTypeMap[T]['omit']]
        : [val: TableTypeMap[T]['omit'], socketId: string]
    ) {
        const [val, socketId = undefined] = args
        let parent = list()
        if (name === 'rest') {
            let full: TableTypeMap['rest']['full'] = {
                ...val,
                historyMessages: { limit: 20, list: [] },
                inputMessages,
                lastConnectTime: new Date().getTime(),
                sending: '',
                autoRespondMessage: '',
                detain: false,
                json: true,
                type: name,
                detaining: false,
            }
            const ymap = convertJsonToYjs(full, parent)
            return ymap as JsonToYjs<TableTypeMap[T]['full']>
        } else if (name === 'websocket') {
            let full: TableTypeMap['websocket']['full'] = {
                ...val,
                historyMessages: { limit: 20, list: [] },
                inputMessages,
                lastConnectTime: new Date().getTime(),
                sending: '',
                autoRespondMessage: '',
                initMessage: '',
                type: name as 'websocket',
                connections: {},
            }
            const ymap = convertJsonToYjs(full, parent)
            addConnection(val.id, socketId)
            return ymap as JsonToYjs<TableTypeMap[T]['full']>
        } else {
            const error: never = name;
            throw new Error('Unhandled table name: ' + error);
        }

    }
}


export type JsonToYjs<T> =
    T extends string | number | boolean ? T :
    T extends Array<infer U> ? Y.Array<JsonToYjs<U>> & { __typing: T } :
    T extends Record<string, any> ? ({
        get: <K extends keyof T>(str: K) => JsonToYjs<T[K]>,
        __typing: T,
    }) & Omit<Y.Map<any>, 'get'> :
    never;

export type YjsToJson<T extends JsonToYjs<any>> =
    T extends string | number | boolean ? T :
    T extends { __typing: infer U } ? U :
    never;

export function convertJsonToYjs<T>(value: T, parent: Y.Array<any> | JsonToYjs<any>): JsonToYjs<T>;
export function convertJsonToYjs<T>(value: T, parent: Y.Map<any> | JsonToYjs<any>, key: string): JsonToYjs<T>;
export function convertJsonToYjs<T>(value: T, parent: Y.Map<any> | JsonToYjs<any>, key?: string, unshift?: boolean): JsonToYjs<T>;
export function convertJsonToYjs<T>(value: T, parent: Y.Map<any> | Y.Array<any> | JsonToYjs<any>, key?: string, unshift = false): JsonToYjs<T> {
    if (Array.isArray(value)) {
        const yArray = new Y.Array<JsonToYjs<any>>();
        addToParent(yArray);
        (value as Array<any>).forEach((item) => {
            convertJsonToYjs(item, yArray)
        });
        return yArray as JsonToYjs<T>;
    } else if (typeof value === 'object' && value !== null) {
        const yMap = new Y.Map<{ [K in keyof T]: JsonToYjs<T[K]> }>();
        addToParent(yMap)
        Object.entries(value as Record<string, any>).forEach(([key, val]) => {
            convertJsonToYjs(val, yMap, key)
        });
        return yMap as unknown as JsonToYjs<T>;
    } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
        addToParent(value)
        return value as JsonToYjs<T>;
    } else {
        throw new Error(`Unsupported JSON value type: ${typeof value}`);
    }

    function addToParent(item: any) {
        if (parent instanceof Y.Array) {
            if (unshift)
                parent.unshift([item])
            else
                parent.push([item])
        } else if (parent instanceof Y.Map) {
            if (key) parent.set(key, item)
            else {
                console.log({ parent, key, item })
                throw `parent is YMap but missing key`
            }
        } else {
            console.log({ parent, key, item })
            throw `parent not YMap or YArray`
        }
    }
}
