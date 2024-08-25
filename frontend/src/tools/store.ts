import { TableName } from '@web-mock/common/src/client'
import { atom } from 'recoil'

export const selectedId = atom({
    default: { id: '', table: undefined as TableName | undefined },
    key: 'selectedId'
})
export const selectedWsConn = atom({
    default: '',
    key: 'selectedWsConn'
})

export const urlFilter = atom({
    default: '',
    key: 'urlFilter'
})