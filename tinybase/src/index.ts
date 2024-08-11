import { join } from 'node:path';
import { createMergeableStore } from 'tinybase';
import { createFilePersister } from 'tinybase/persisters/persister-file';

import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';
import { WebSocketServer } from 'ws';

main()

async function main() {
  const server = createWsServer(
    new WebSocketServer({ port: 8050 }),
    (pathId) => createFilePersister(
      createMergeableStore(),
      join(process.cwd(), 'db-files', `${pathId.replace(/[^a-zA-Z0-9]/g, '-')}.json`),
    ),
  );
  console.log('server started!')

  process.on('SIGINT', () => {
    console.log('cleaning...');
    server.destroy();
  });
}