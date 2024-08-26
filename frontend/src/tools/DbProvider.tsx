import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { init, store, JsonToYjs } from '@web-mock/common'

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
type UseDbJsonRtn<T extends (JsonToYjs<Array<any>> | (() => JsonToYjs<Array<any>>))> = ReturnType<UnWrapFn<T>['toJSON']>

export function useDbJson<T extends (JsonToYjs<Array<any>> | (() => JsonToYjs<Array<any>>))>(fn: T, defaultValue: UseDbJsonRtn<T>): ReturnType<UnWrapFn<T>['toArray']> {
    const { inited } = useContext(Ctx)
    let [rtn, setRtn] = useState<UseDbJsonRtn<T>>(defaultValue as any)
    useMemo(() => {
        if (!inited) return
        let arr = typeof fn === 'function' ? fn() : fn as JsonToYjs<Array<any>>
        setRtn(arr.toJSON() as any)
        console.log(arr.toJSON())
        arr.observe(() => {
            setRtn(arr.toJSON() as any)
        })
    }, [inited, fn])

    return rtn
}