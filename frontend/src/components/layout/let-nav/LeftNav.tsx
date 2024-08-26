import { getTable } from "@web-mock/common";
import { useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useDbJson } from "../../../tools/DbProvider";
import { selectedId, urlFilter } from "../../../tools/store";

const getRests = () => getTable('rest').list()
const getWss = () => getTable('websocket').list()

const LeftNav = () => {
    const restapis = useDbJson(getRests, [])
    const websockets = useDbJson(getWss, [])
    const filter = useRecoilValue(urlFilter);
    return (
        <div className="flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
            <Filter />
            <ConnectionList
                title="Websockets"
                list={useMemo(() => filterX(websockets as any, filter), [filter, websockets])}
            />
            <ConnectionList
                title="REST APIs"
                list={useMemo(() => filterX(restapis as any, filter), [filter, restapis])}
            />
        </div>
    );
};

export default LeftNav;

// interface WithUrl {
//     get(key: 'url'): string;
//     get(key: 'id'): string;
//     get(key: 'type'): string;
//     get(key: string): any;
// }

interface WithUrl {
    url: string
    id: string
    type: string
    lastConnectTime: number
    [key: string]: any
}

function Filter() {
    const [filter, setFilter] = useRecoilState(urlFilter);

    return (
        <div className="mb-4">
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter, string or regexp"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
}


function ConnectionList<T extends WithUrl>({ list, title }: { list: T[], title: string }) {
    const [{ id }, setId] = useRecoilState(selectedId);
    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <ul className="space-y-2">
                {
                    list.map((x, i) => (x)
                        ? (
                            <li
                                key={i}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${id === x.id ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                                onClick={() => setId({
                                    id: x.id,
                                    table: x.type as any,
                                })}
                            >
                                <h5 className="font-medium">{x.url}</h5>
                                {x.type === 'websocket' && <p className="text-sm text-gray-500">{x.id}</p>}
                            </li>
                        )
                        : (
                            <li key={i}>
                                <pre>{x ? JSON.stringify(Object.keys(x)) : JSON.stringify(typeof x)}</pre>
                            </li>
                        )
                    )
                }
            </ul>
        </div>
    );
}

function filterX<T extends [WithUrl[], any[]]>(list: T, filter: string) {
    const [jsons] = list
    jsons.sort((a, b) => b.lastConnectTime - a.lastConnectTime)

    if (!filter) return jsons

    if (filter.startsWith('/') && filter.endsWith('/')) {
        const regex = new RegExp(filter.substring(1, filter.length - 1));
        return jsons.filter((item) => regex.test(item.url));
    }

    return jsons.filter((item) => item.url.includes(filter))
}
