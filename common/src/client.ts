// On the first client machine:
import { TableTypeMap } from 'def'
import { useTable } from 'tinybase/ui-react'
import { createMergeableStore, Cell } from 'tinybase'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import { WebSocket as WS } from 'ws'
import { fromEventPattern, Observable } from 'rxjs'

type MessageItem = {
    type: 'sent' | 'received',
    msg: string,
    time: number,
}

type MessagesObject = {
    limit: number,
    list: MessageItem[]
}

const WebSocket = typeof window === 'undefined' ? WS : window.WebSocket

const { WS_TINYBASE = 'ws://localhost:8050' } = process.env
export const store = createMergeableStore()

export async function init() {
    const synchronizer = await createWsSynchronizer(
        store,
        new WebSocket(WS_TINYBASE),
    )
    await synchronizer.startAutoSave()
    await synchronizer.startAutoLoad()
    await synchronizer.startSync()
}

export const websockets = getTable('websocket')
export const restapis = getTable('rest')


type TableName = keyof TableTypeMap
type TFull<T extends TableName> = TableTypeMap[T]['full']['row']
type TPartial<T extends TableName> = TableTypeMap[T]['partial']['row']
type TSet<T extends TableName> = TPartial<T>
type TFullData<T extends TableName> = TableTypeMap[T]['full']['data']

export function getTable<T extends TableName>(name: T) {
    return {
        set: (val: TSet<T>) => {
            let v = getRawData(val)
            console.log(name, v.id, v)
            store.setRow(name, v.id, v)
        },
        get: (id: string) => {
            let row = store.getRow(name, id) as TFull<T>
            if (!row || !row.id) return
            return getExtendedData(row, name)
        },
        useList: () => {
            const table = useTable(name, store)
            console.log(table)
            return Object.values(table)
                .map(row => getExtendedData(row as TFull<T>, name))
                .sort((a, b) => {
                    if (a.url < b.url) {
                        return -1;
                    }
                    if (a.url > b.url) {
                        return 1;
                    }
                    return 0;
                })
        }
    }

    function getRawData(val: TSet<T>): TFull<T> {
        let { historyMessages, inputMessages } = val
        let v = { ...val } as any as TFull<T>
        for (const k in v) {
            if (!['string', 'number'].includes(typeof v[k])) delete v[k]
        }
        v.historyMessagesJson = JSON.stringify(historyMessages || parseMessages())
        v.inputMessagesJson = JSON.stringify(inputMessages || parseMessages())
        v.autoRespondMessage = v.autoRespondMessage || ''
        v.initRespondMessage = v.initRespondMessage || ''
        v.connectTime = v.connectTime || new Date().getTime()
        return v
    }
}

export function getExtendedData<T extends TableName>(row: TFull<T>, table: T) {
    let rtn = {
        ...row,
        historyMessages: {
            ...parseMessages(row.historyMessagesJson),
            unshift: (msg: Omit<MessageItem, 'time'>) => {
                rtn.historyMessages.list.unshift({
                    msg: row.autoRespondMessage,
                    type: 'sent',
                    time: new Date().getTime()
                })
                rtn.historyMessages.list.length = rtn.historyMessages.limit
            }
        },
        inputMessages: parseMessages(row.inputMessagesJson),
        getObservable: <T1 extends keyof TFullData<T>>(cellName: T1): Observable<TFullData<T>[T1]> => fromEventPattern(
            (handler) => store.addCellListener(
                table, row.id, cellName as string,
                (_0, _1, _2, _3, newCell) => handler(newCell)
            ),
            (_, listenerId) => store.delListener(listenerId)
        ),
        updateCell: <T1 extends keyof TFullData<T> & string>(cellName: T1, value: TFullData<T>[T1] & Cell) => {
            store.setCell(table, row.id, cellName, value)
        },
        save: () => {
            getTable(table).set(rtn)
        }
    }
    return rtn
}


export function parseMessages(str?: string): MessagesObject {
    if (str) return JSON.parse(str)
    return {
        limit: 3,
        list: [],
    }
}
