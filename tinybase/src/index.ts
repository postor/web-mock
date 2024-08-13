import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs'
import { createMergeableStore } from 'tinybase';
import { createFilePersister } from 'tinybase/persisters/persister-file';

import { createWsServer } from 'tinybase/synchronizers/synchronizer-ws-server';
import { WebSocketServer } from 'ws';


main()

async function main() {
  const dbPath = join(process.cwd(), 'db-files');
  if (!existsSync(dbPath)) {
    mkdirSync(dbPath);
  }
  const server = createWsServer(
    new WebSocketServer({ port: 8050 }),
    (pathId) => createFilePersister(
      createMergeableStore(),
      join(dbPath, `${pathId.replace(/[^a-zA-Z0-9]/g, '-') || 'default'}.json`),
    ),
  );
  console.log('server started!')

  process.on('SIGINT', () => {
    console.log('cleaning...');
    server.destroy();
  });
}