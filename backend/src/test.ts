import { init, getTable, store } from '@web-mock/common/src/client'


    ;

import { find, fromEventPattern, interval, take, tap, timer } from 'rxjs';
import { setTimeout } from 'timers/promises';
import { YMap } from 'yjs/dist/src/internals';
(async () => {
    console.log('before init')
    await init()
    console.log('after init')

    let t = store.getMap('test')
    fromEventPattern(
        // addHandler: this function sets up the event listener
        handler => t.observeDeep(handler),
        // removeHandler: this function removes the event listener
        handler => t.unobserveDeep(handler)
    ).pipe(
        tap(() => console.log(t.toJSON()))
    ).subscribe();

    timer(0, 1000).pipe(
        tap(i => t.set('num', i))
    ).subscribe()

})()