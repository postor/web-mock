import { useRecoilState, useRecoilValue } from "recoil";
import { useTinyBase } from "../../../tools/TinyBaseProvider";
import { selectedId, urlFilter } from "../../../tools/store";
import { getExtendedData } from "@web-mock/common/src/client";

const LeftNav = () => {
    const { websockets, restapis } = useTinyBase();
    const filter = useRecoilValue(urlFilter);

    return (
        <div className="flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg shadow-md">
            <Filter />
            <ConnectionList
                title="Websockets"
                list={filterX(websockets.useList(), filter)}
            />
            <ConnectionList
                title="REST APIs"
                list={filterX(restapis.useList(), filter)}
            />
        </div>
    );
};

export default LeftNav;

function Filter() {
    const [filter, setFilter] = useRecoilState(urlFilter);

    return (
        <div className="mb-4">
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter (e.g., /\\d$/)"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
    );
}

type ListItem = ReturnType<typeof getExtendedData>;

function ConnectionList<T extends ListItem>({ list, title }: { list: T[], title: string }) {
    const [id, setId] = useRecoilState(selectedId);

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <ul className="space-y-2">
                {list.map((x) => (
                    <li
                        key={x.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${id === x.id ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                        onClick={() => setId(x.id)}
                    >
                        <h5 className="font-medium">{x.url}</h5>
                        {x.type === 'websocket' && <p className="text-sm text-gray-500">{x.id}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function filterX<T extends ListItem>(list: T[], filter: string) {
    if (!filter) return list
    const regex = new RegExp(filter);
    return list.filter(item => regex.test(item.url));
}
