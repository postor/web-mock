import { useRecoilValue } from "recoil"
import { selectedId } from "../tools/store"
import { parseMessages, restapis, websockets } from "@web-mock/common/src/client"
import { useCell } from 'tinybase/ui-react'
import { useTinyBase } from "../tools/TinyBaseProvider"

export default () => {
    let id = useRecoilValue(selectedId)
    let item = restapis.get(id) || websockets.get(id)

    let { store } = useTinyBase()
    let [inputMessages, historyMessages] = [
        useCell(item?.type, item?.id, 'inputMessagesJson', store),
        useCell(item?.type, item?.id, 'historyMessagesJson', store),
    ].map(x => x ? JSON.parse(x as string) : parseMessages())

    if (!id || !item) return <ChooseFromLeftNav />

    return <div>
        <h4>{item.url}</h4>
        <div>
            <h5>
                <span>input messages, slots={inputMessages.limit}</span>
                <input
                    value={inputMessages.limit}
                    onChange={e => {
                        inputMessages.limit = parseInt(e.target.value)
                        while (inputMessages.list.length < inputMessages.limit) {
                            inputMessages.list.push({ type: 'sent', msg: '', time: 0 })
                        }
                        inputMessages.list.length = inputMessages.limit
                        store.setCell(item.type, item.id, 'inputMessagesJson', JSON.stringify(inputMessages))
                    }}
                    min={1} max={10} step={1}
                    type='range' />
            </h5>

            <div>
                {inputMessages.list.map((x, i) => <div key={i}>
                    <textarea value={x.msg} onChange={e => {
                        x.msg = e.target.value
                        store.setCell(item.type, item.id, 'inputMessagesJson', JSON.stringify(inputMessages))
                    }} />
                    <button onClick={e => {
                        item.sending = x.msg
                        store.setCell(item.type, item.id, 'inputMessagesJson', JSON.stringify(inputMessages))
                    }}>send</button>
                </div>)}
            </div>

        </div>
        <div>
            <h5>
                <span>history messages, limit={historyMessages.limit}</span>
                <input
                    value={historyMessages.limit}
                    onChange={e => {
                        historyMessages.limit = parseInt(e.target.value)
                        historyMessages.list.length = historyMessages.limit
                        store.setCell(item.type, item.id, 'historyMessagesJson', JSON.stringify(historyMessages))
                    }}
                    min={1} max={10} step={1}
                    type='range' />
            </h5>
            <div>
                {historyMessages.list.map((x, i) => x
                    ? <div key={i}>
                        <div>{x.msg}</div>
                        <div>
                            <span>{x.type}</span>
                            <span>{new Date(x.time).toUTCString()}</span>
                        </div>
                    </div>
                    : <div key={i} />)}
                {historyMessages.list.length < historyMessages.limit
                    ? new Array(historyMessages.limit - historyMessages.list.length)
                        .fill(0).map((_, i) => <div key={i} />)
                    : null}
            </div>
        </div>
    </div>
}


function ChooseFromLeftNav() {
    return <div>
        Choose one from left
    </div>
}