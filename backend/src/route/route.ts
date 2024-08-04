import { EventEmitter } from 'node:events'
import { Router } from 'express'

const ee = new EventEmitter()


let route = Router()

// suppose route will mount at url `/`

// `/_sync_data` for broad cast all dbdata

