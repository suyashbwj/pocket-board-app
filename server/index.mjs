import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createApi } from './api.mjs';
const directory = process.env.DATA_DIR || './data';
mkdirSync(directory, { recursive: true });
const port = Number(process.env.PORT || 3001);
createApi(join(directory, 'messages.sqlite')).listen(port, '0.0.0.0', () => console.log(`Pocket Board API listening on ${port}`));
