import { useRecoilState, useRecoilValue } from "recoil";
import { useDb, useDbJson } from "../../../tools/DbProvider";
import { selectedId, urlFilter } from "../../../tools/store";
import { useEffect } from "react";
import { getTable } from "@web-mock/common/src/client";

const getRests = () => getTable('rest').list()
const getWss = () => getTable('websocket').list()

const LeftNav = () => {
    const restapis = useDbJson(getRests,[])
    const websockets = useDbJson(getWss,[])
    const filter = useRecoilValue(urlFilter);
    return (
        <div className="flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
            <Filter />
            <ConnectionList
                title="Websockets"
                list={filterX(websockets, filter)}
            />
            <ConnectionList
                title="REST APIs"
                list={filterX(restapis, filter)}
            />
        </div>
    );
};

export default LeftNav;

interface WithUrl {
    get(key: 'url'): string;
    get(key: 'id'): string;
    get(key: 'type'): string;
    get(key: string): any;
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
                {list.map((x) => (
                    <li
                        key={x.get('id')}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${id === x.get('id') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                        onClick={() => setId({
                            id: x.get('id'),
                            table: x.get('type') as any,
                        })}
                    >
                        <h5 className="font-medium">{x.get('url')}</h5>
                        {x.get('type') === 'websocket' && <p className="text-sm text-gray-500">{x.get('id')}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function filterX<T extends WithUrl>(list: T[], filter: string) {
    if (!filter) return list
    if (filter.startsWith('/') && filter.endsWith('/')) {
        const regex = new RegExp(filter.substring(1, filter.length - 1));
        return list.filter(item => regex.test(item.get('url')));
    }
    return list.filter(item => item.get('url').includes(filter))
}
