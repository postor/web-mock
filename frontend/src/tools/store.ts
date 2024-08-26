import { TableName } from '@web-mock/common'
import { atom } from 'recoil'

export const selectedId = atom({
    default: { id: '', table: undefined as TableName | undefined },
    key: 'selectedId'
})

export const urlFilter = atom({
    default: '',
    key: 'urlFilter'
})