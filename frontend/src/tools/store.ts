import { atom } from 'recoil'

export const selectedId = atom({
    default: { id: '', table: '' },
    key: 'selectedId'
})

export const urlFilter = atom({
    default: '',
    key: 'urlFilter'
})