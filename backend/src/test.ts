import { init, getTable, store } from '@web-mock/common/src/client'


    ;

import { find, take, tap } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { YMap } from 'yjs/dist/src/internals';
(async () => {
    console.log('before init')
    await init()
    console.log('after init')

    // // let restsList = tables.get('rest')
    // // console.log({tables,restsList})
    let rests = getTable('rest')
    
    let item2 = rests.get('2')
    let item3 = rests.get('3')
    console.log([item2,item3].map(x=>x.toJSON()))
    
    // // console.log(rests.list())
    rests.list().observe((...args) => {
        // @ts-ignore
        // let list = rests.list().toArray().map(x => x.toJSON())
        // console.log(list)

        // let item2 = rests.get('2')
        // let item3 = rests.get('3')
        // console.log([item2,item3].map(x=>x.toJSON()))

        // let tables: any = store.getMap().get('tables')
        // let rest: any = tables.get('rest')
        // let frist: any = rest.get(0)
        // console.log('----first', { json: frist.toJSON() })
    })

    // await setTimeout(1000)

    // rests.create({
    //     id: '2',
    //     url: '/2',
    // })
    // await setTimeout(1000)

    // rests.create({
    //     id: '3',
    //     url: '/3',
    // })


})()