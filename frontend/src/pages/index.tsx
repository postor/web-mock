import { useRecoilValue } from "recoil";
import { selectedId } from "../tools/store";
import { getExtendedData } from "@web-mock/common/src/client";
import { useRow } from 'tinybase/ui-react';
import { useTinyBase } from "../tools/TinyBaseProvider";
import { useCallback, useEffect } from "react";
import TimeAgo from 'react-timeago'


export default function ItemDetails() {
    const { id, table } = useRecoilValue(selectedId);
    const { store } = useTinyBase();
    const row = useRow(table, id, store);
    const item = getExtendedData<'websocket' | 'rest'>(row as any, table as any);
    const { inputMessages, historyMessages } = item;
    console.log(item)
    let inputLimitCb = useCallback(() => {
        while (inputMessages.list.length < inputMessages.limit) {
            inputMessages.list.push({ type: 'sent', msg: '', time: 0 });
        }
        inputMessages.list.length = inputMessages.limit;
    }, [row])

    useEffect(inputLimitCb, [row])


    console.log(row)
    if (!id || !item) return <ChooseFromLeftNav />;


    return (
        <div className="p-6 space-y-8">
            <h4 className="text-2xl font-semibold text-gray-800">{item.url}</h4>
            <div className="flex flex-row">
                {item.type === 'rest'
                    ? <>
                        <div>
                            <label>detain:</label>
                            <input type="checkbox" checked={item.detain} onChange={
                                () => store.setCell(item.type, item.id, 'detain', !item.detain)
                            } />
                        </div>
                        <div>
                            <label>json:</label>
                            <input type="checkbox" checked={item.json} onChange={
                                () => store.setCell(item.type, item.id, 'json', !item.json)
                            } />
                        </div>
                    </>
                    : null}

            </div>
            <div className="space-y-4">
                <div>
                    <h5 className="text-lg font-medium text-gray-700 flex justify-start">
                        <span>Input Messages (slots: {inputMessages.limit})</span>
                        <input
                            value={inputMessages.limit}
                            onChange={e => {
                                inputMessages.limit = parseInt(e.target.value);
                                inputLimitCb()
                                item.save();
                            }}
                            min={1} max={10} step={1}
                            type="range"
                            className=""
                        />
                        <div className="flex-1"></div>
                    </h5>
                    <div className="flex space-x-4 overflow-x-auto py-2">
                        {inputMessages.list.map((x, i) => (
                            <div key={i} className="flex-shrink-0 w-64">
                                <textarea
                                    value={x.msg}
                                    onChange={e => {
                                        x.msg = e.target.value;
                                        item.save();
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Enter message"
                                />
                                <button
                                    onClick={() => {
                                        item.sending = JSON.stringify({
                                            time: new Date().getTime(),
                                            msg: x.msg
                                        })
                                        item.save();
                                    }}
                                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h5 className="text-lg font-medium text-gray-700 flex justify-start">
                        <span>History Messages (limit: {historyMessages.limit})</span>
                        <input
                            value={historyMessages.limit}
                            onChange={e => {
                                historyMessages.limit = parseInt(e.target.value);
                                historyMessages.list.length = historyMessages.limit;
                                item.save();
                            }}
                            min={1} max={10} step={1}
                            type="range"
                            className=""
                        />
                        <div className="flex-1"></div>
                    </h5>
                    <div className="flex space-x-4 overflow-x-auto py-2">
                        {historyMessages.list.map((x, i) => x ? (
                            <div key={i} className="flex-shrink-0 w-64 p-4 bg-gray-100 rounded-md shadow">
                                <div className="text-gray-800">{x.msg}</div>
                                <div className="text-sm text-gray-500 mt-2">
                                    <span>{x.type}</span> - <span>
                                        <TimeAgo date={x.time} />
                                    </span>
                                </div>
                            </div>
                        ) : <div key={i} className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-md" />)}
                        {historyMessages.list.length < historyMessages.limit
                            ? new Array(historyMessages.limit - historyMessages.list.length)
                                .fill(0).map((_, i) => <div key={i} className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-md" />)
                            : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChooseFromLeftNav() {
    return (
        <div className="p-6 text-center text-gray-500">
            Choose an item from the left to view details.
        </div>
    );
}
