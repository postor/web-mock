import { getTable, JsonToYjs } from '@web-mock/common/src/client';
import { HistoryMessageItem, InputMessageItem, IRestData, IWebSocketData } from "@web-mock/common/src/def";
import { useEffect, useMemo } from "react";
import TimeAgo from 'react-timeago';
import { useRecoilState, useRecoilValue } from "recoil";
import { useDbJson } from "../tools/DbProvider";
import { selectedId, selectedWsConn } from "../tools/store";

type LayoutSlots = { url: string, topFlags: any, inputs: any, histories: any }

export default function ItemDetails() {
    const { id, table } = useRecoilValue(selectedId);
    const websoceketId = useRecoilValue(selectedWsConn);
    const rests = getTable('rest')
    const websockets = getTable('websocket')
    const slots: LayoutSlots = useMemo(() => {
        if (!id || !table) return null
        if (table === 'rest') {
            const item = rests.get(id)
            return {
                url: item.get('url'),
                topFlags: <TopFlags item={item} />,
                inputs: <InputMessages
                    item={item} />,
                histories: <Histories
                    historyMessages={item.get('historyMessages').get('list')} />
            }
        } else if (table === 'websocket') {
            const item = websockets.get(id)
            return {
                url: item.get('url'),
                topFlags: <TopFlagsWs item={item as any} />,
                inputs: <InputMessages item={item as any} />,
                histories: (!item || !item.get('connections').get(websoceketId))
                    ? null
                    : <Histories historyMessages={item.get('connections').get(websoceketId).get('historyMessages').get('list')} />
            }
        } else {
            alert('error')
            throw ('error')
        }
    }, [id, table, websoceketId])
    const item = table === 'rest'
        ? rests.get(id)
        : table === 'websocket'
            ? websockets.get(id)
            : null

    if (!item) return <ChooseFromLeftNav />;

    return <Layout {...slots} />;
}

function TopFlags({ item }: { item: JsonToYjs<(IRestData)> }) {
    const [row, yRow] = useDbJson(item, null)
    return <>
        <div className="flex items-center space-x-2">
            <label>Detain:</label>
            <input type="checkbox" checked={row?.detain} onChange={
                () => yRow.set('detain', !row?.detain)
            } />
        </div>
        <div className="flex items-center space-x-2">
            <label>JSON:</label>
            <input type="checkbox" checked={row?.json} onChange={
                () => item.set('json', !row?.json)
            } />
        </div>
    </>
}

function TopFlagsWs({ item }: { item: JsonToYjs<(IWebSocketData)> }) {
    const [row, yRow] = useDbJson(item, null)
    const [conn, setConn] = useRecoilState(selectedWsConn)
    useEffect(() => {
        if (conn && !(conn in row.connections)) {
            setConn('')
        }
    }, [row, conn, setConn])
    return <>
        <div className="flex items-center space-x-2">
            <label>connection:</label>
            <select onChange={e => setConn(e.target.value)} value={conn}>
                <option value={''}>-</option>
                {Object.keys(row?.connections || {}).map(x => (
                    <option value={x} key={x}>
                        {x}
                    </option>
                ))}
            </select>
            <span className='text-gray-500'>(total:{Object.keys(row?.connections || {}).length})</span>
        </div>
    </>
}

const Histories = ({ historyMessages }: { historyMessages: JsonToYjs<HistoryMessageItem[]> }) => {
    const [histories, yArr] = useDbJson(historyMessages, [])
    console.log({ histories })
    // return null
    return <>
        {histories.map((x, i) => (
            <div key={i} className={`flex ${x.type === 'received' ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-64 p-4 rounded-md shadow ${x.type === 'received' ? 'bg-gray-200' : 'bg-blue-600 text-white'}`}>
                    <div>{x.message}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        <span>
                            <TimeAgo date={x.time} />
                        </span>
                    </div>
                </div>
            </div>
        ))}
    </>
}

function ChooseFromLeftNav() {
    return (
        <div className="p-6 text-center text-gray-500">
            Choose an item from the left to view details.
        </div>
    );
}

/**
 * tricky item can be JsonToYjs<(IWebsocketData)>
 * @param param0 
 * @returns 
 */
function InputMessages({ item }: { item: JsonToYjs<(IRestData)> }) {
    const websoceketId = useRecoilValue(selectedWsConn);
    const [row, yRow] = useDbJson(item, null)
    const list = row?.inputMessages?.list
    const yList = yRow?.get('inputMessages')?.get('list')
    return <>
        {list
            ? list.map((x, i) => (
                <div key={i} className="flex flex-col w-64 space-y-2 flex-1">
                    <textarea
                        value={x.message}
                        onChange={e => yList.get(i).set('message', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter message"
                    />
                    <p>{JSON.stringify({ sending: (row as any as IWebSocketData).connections?.[websoceketId]?.sending })}</p>
                    <button
                        disabled={!x.message || !(row.type === 'rest' ? row.detain && row.detaining : true)}
                        onClick={() => {
                            if (row.detaining) {
                                yRow.set('sending', x.message)
                            } else if (websoceketId) {
                                (yRow as any as JsonToYjs<IWebSocketData>).get('connections').get(websoceketId).set('sending', x.message)
                            }
                        }}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50`}
                    >
                        Send
                    </button>
                </div>
            ))
            : null}
    </>
}

function Layout({ url, topFlags, inputs, histories }: LayoutSlots) {
    return (
        <div className="p-6 space-y-8">
            <h4 className="text-2xl font-semibold text-gray-800">{url}</h4>
            <div className='border rounded-lg p-4'>{histories}</div>
            <div className="flex space-x-4">
                {topFlags}
            </div>
            <div className="flex space-x-4 overflow-x-auto p-2">
                {inputs}
            </div>
        </div>
    )
}
