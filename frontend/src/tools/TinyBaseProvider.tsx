import { createContext, useContext, useEffect, useState } from "react";
import { init, restapis, store, websockets } from '@web-mock/common/src/client'

const Ctx = createContext({
    store,
    websockets,
    restapis,
    inited: false
})

export function useTinyBase() {
    return useContext(Ctx)
}

export function TinyBaseProvider({ children }) {
    let [inited, setInited] = useState(false)

    useEffect(() => {
        init().then(() => setInited(true))
    }, [])

    return <Ctx.Provider value={{
        store,
        websockets,
        restapis,
        inited
    }}>
        {children}
    </Ctx.Provider>
}