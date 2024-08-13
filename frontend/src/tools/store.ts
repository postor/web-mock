import { atom } from 'recoil'

export const selectedId = atom({
    default: '',
    key: 'selectedId'
})

export const urlFilter = atom({
    default: '',
    key: 'urlFilter'
})