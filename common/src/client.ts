import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { WebSocket } from 'ws'
import { TableTypeMap } from './def'

const { WS_TINYBASE = 'ws://localhost:1234' } = process.env

type TableName = keyof TableTypeMap

export const store = new Y.Doc()

export async function init() {
    await new Promise(resolve => {
        const wsProvider = new WebsocketProvider(WS_TINYBASE, 'default-room', store, {
            WebSocketPolyfill: WebSocket as any
        })
        let cb = () => {
            let root = store.getMap()
            if (true) {
                convertJsonToYjs({
                    rest: [],
                    websocket: [],
                }, root, 'tables')
            }
            wsProvider.off('sync', cb)
            resolve(null)
        }
        wsProvider.on('sync', cb)
    })
}

export function getTable<T extends TableName>(name: T) {
    let tables = store.getMap().get('tables') as JsonToYjs<{
        rest: TableTypeMap['rest']['full'][],
        websocket: TableTypeMap['websocket']['full'][],
    }>
    return {
        list,
        create: (val: TableTypeMap[T]['omit']) => {
            let parent = list()
            if (name === 'rest') {
                let full: TableTypeMap['rest']['full'] = {
                    ...val,
                    historyMessages: { limit: 20, list: [] },
                    inputMessages: { limit: 1, list: [] },
                    lastConnectTime: new Date().getTime(),
                    sending: '',
                    autoRespondMessage: '',
                    detain: false,
                    json: true,
                    type: name,
                }

                const ymap = convertJsonToYjs(full, parent)
                return ymap
            } else if (name === 'websocket') {
                let full: TableTypeMap['websocket']['full'] = {
                    ...val,
                    historyMessages: { limit: 20, list: [] },
                    inputMessages: { limit: 1, list: [] },
                    lastConnectTime: new Date().getTime(),
                    sending: '',
                    autoRespondMessage: '',
                    initRespondMessage: '',
                    type: name as 'websocket',
                }
                const ymap = convertJsonToYjs(full, parent)
                return ymap
            } else {
                const error: never = name;
                throw new Error('Unhandled table name: ' + error);
            }
        }
    }
    function list() {
        return tables.get(name)
    }
}


type JsonToYjs<T> =
    T extends string ? Y.Text :
    T extends number | boolean ? T :
    T extends Array<infer U> ? Y.Array<JsonToYjs<U>> :
    T extends Record<string, any> ? ({
        get: <K extends keyof T>(str: K) => JsonToYjs<T[K]>
    }) & Omit<Y.Map<any>, 'get'> :
    never;

function convertJsonToYjs<T>(value: T, parent: Y.Map<any> | Y.Array<any>, key = ''): JsonToYjs<T> {

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
    } else if (typeof value === 'string') {
        let txt = new Y.Text(value) as JsonToYjs<T>;
        addToParent(txt)
        return txt
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        addToParent(value)
        return value as JsonToYjs<T>;
    } else {
        throw new Error(`Unsupported JSON value type: ${typeof value}`);
    }

    function addToParent(item: any) {
        if (parent instanceof Y.Array) {
            parent.push([item])
        } else {
            parent.set(key, item)
        }
    }
}
