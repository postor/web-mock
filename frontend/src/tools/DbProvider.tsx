import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { init, store, JsonToYjs, YjsToJson } from '@web-mock/common'
import * as Y from 'yjs'

// @ts-ignore
window.store = store

const Ctx = createContext({
    store,
    inited: false
})

export function useDb() {
    return useContext(Ctx)
}

export function TinyBaseProvider({ children }) {
    let [inited, setInited] = useState(false)

    useEffect(() => {
        init().then(() => setInited(true))
    }, [])

    return <Ctx.Provider value={{
        store,
        inited
    }}>
        {children}
    </Ctx.Provider>
}

type UnWrapFn<T> = T extends () => any ? ReturnType<T> : T
type UseDbJsonRtn<T extends (JsonToYjs<any> | (() => JsonToYjs<any>))> = [
    YjsToJson<UnWrapFn<T>>, UnWrapFn<T>
]

export function useDbJson<T extends (JsonToYjs<any> | (() => JsonToYjs<any>))>(fn: T, defaultValue: YjsToJson<UnWrapFn<T>>): UseDbJsonRtn<T> {
    const { inited } = useContext(Ctx)
    let [rtn, setRtn] = useState<YjsToJson<UnWrapFn<T>>>(defaultValue as any)
    let [yData, setYData] = useState(defaultValue as any)
    useMemo(() => {
        if (!inited) return
        let yobj: Y.Map<any> | Y.Array<any> = (typeof fn === 'function' ? fn() : fn) as any
        setRtn(yobj.toJSON() as any)
        setYData(yobj as any)
        const cb = () => {
            console.log(`observe:`, yobj, yobj.toJSON())
            setRtn(yobj.toJSON() as any)
        }
        console.log(`observe listen:`, yobj)
        yobj.observeDeep(cb)
        return () => yobj.unobserveDeep(cb)
    }, [inited, fn])

    return [rtn, yData]
}