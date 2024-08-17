import { init, getTable, store } from '@web-mock/common/src/client'


    ;

import { find, take, tap } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { YMap } from 'yjs/dist/src/internals';
(async () => {
    console.log('before init')
    await init()
    console.log('after init')
    // let tables:any = store.getMap().get('tables') 
    // let rest:any = tables.get('rest')
    // let frist:any = rest.get(0)
    // console.log(frist,rest.length)
    
    // let restsList = tables.get('rest')
    // console.log({tables,restsList})
    let rests = getTable('rest')
    console.log(rests.list())
    rests.list().observe((...args)=>{
        console.log(args)
    })

    await setTimeout(1000)

    rests.create({
        id:'1',
        url:'/',
    })


})()