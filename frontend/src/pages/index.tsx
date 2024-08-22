import { getTable, JsonToYjs } from '@web-mock/common/src/client';
import { HistoryMessageItem, InputMessageItem } from "@web-mock/common/src/def";
import { useMemo } from "react";
import TimeAgo from 'react-timeago';
import { useRecoilValue } from "recoil";
import { useDbJson } from "../tools/DbProvider";
import { selectedId } from "../tools/store";

type LayoutSlots = { url: string, topFlags: any, inputs: any, histories: any }

export default function ItemDetails() {
    const { id, table } = useRecoilValue(selectedId);
    const rests = getTable('rest')
    const websockets = getTable('websocket')
    const slots: LayoutSlots = useMemo(() => {
        if (!id || !table) return null
        if (table === 'rest') {
            const item = rests.get(id)
            return {
                url: item.get('url'),
                topFlags: <>
                    <div className="flex items-center space-x-2">
                        <label>Detain:</label>
                        <input type="checkbox" checked={item.get('detain')} onChange={
                            () => item.set('detain', !item.get('detain'))
                        } />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label>JSON:</label>
                        <input type="checkbox" checked={item.get('json')} onChange={
                            () => item.set('json', !item.get('json'))
                        } />
                    </div>
                </>,
                inputs: <InputMessages
                    inputMesssages={item.get('inputMessages').get('list')} />,
                histories: <Histories
                    historyMessages={item.get('historyMessages').get('list')} />
            }
        } else if (table === 'websocket') {
            const item = websockets.get(id)
            return {
                url: item.get('url'),
                topFlags: null,
                inputs: <InputMessages
                    inputMesssages={item.get('inputMessages').get('list')} />,
                histories: <Histories
                    historyMessages={item.get('historyMessages').get('list')} />
            }
        } else {
            alert('error')
            throw ('error')
        }
    }, [id, table])
    const item = table === 'rest'
        ? rests.get(id)
        : table === 'websocket'
            ? websockets.get(id)
            : null

    if (!item) return <ChooseFromLeftNav />;

    return <Layout {...slots} />;
}

const Histories = ({ historyMessages }: { historyMessages: JsonToYjs<HistoryMessageItem[]> }) => {
    const histories = useDbJson(historyMessages, [])
    console.log({ histories })
    return <>
        {histories.map((x, i) => (
            <div key={i} className={`flex ${x.get('type') === 'received' ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-64 p-4 rounded-md shadow ${x.get('type') === 'received' ? 'bg-gray-200' : 'bg-blue-600 text-white'}`}>
                    <div>{x.get('message')}</div>
                    <div className="text-sm text-gray-500 mt-2">
                        <span>
                            <TimeAgo date={x.get('time')} />
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

function InputMessages({ inputMesssages }: { inputMesssages: JsonToYjs<InputMessageItem[]> }) {
    const list = useDbJson(inputMesssages, [])
    console.log({ list })
    return <>
        {list.map((x, i) => (
            <div key={i} className="flex flex-col w-64 space-y-2">
                <textarea
                    value={x.get('message')}
                    onChange={e => x.set('message', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter message"
                />
                <button
                    onClick={() => x.set('sending', x.get('message'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Send
                </button>
            </div>
        ))}
    </>
}

function Layout({ url, topFlags, inputs, histories }: LayoutSlots) {
    return (
        <div className="p-6 space-y-8">
            <div>{histories}</div>
            <h4 className="text-2xl font-semibold text-gray-800">{url}</h4>
            <div className="flex space-x-4">
                {topFlags}
            </div>
            <div>
                <h5 className="text-lg font-medium text-gray-700">
                    Input Messages
                </h5>
                <div className="flex space-x-4 overflow-x-auto py-2">
                    {inputs}
                </div>
            </div>
        </div>
    )
}
