import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApi } from './api.mjs';

test('messages validate, persist across restart, and return newest first', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pocket-board-test-'));
  let server;
  const start = async () => { server = createApi(join(dir, 'test.sqlite')); server.listen(0, '127.0.0.1'); await once(server, 'listening'); return `http://127.0.0.1:${server.address().port}`; };
  const stop = () => new Promise((resolve) => server.close(resolve));
  try {
    let url = await start();
    const post = (data) => fetch(`${url}/messages`, { method: 'POST', body: JSON.stringify(data) });
    assert.equal((await post({ name: 'Student', text: ' ' })).status, 400);
    assert.equal((await post(null)).status, 400);
    assert.equal((await post({ name: 'Student', text: 'x'.repeat(281) })).status, 400);
    assert.equal((await post({ name: ' Suyash ', text: ' Hello from iPhone ' })).status, 201);
    assert.equal((await post({ name: 'Partner', text: 'Hello back' })).status, 201);
    await stop();
    url = await start();
    const { messages } = await (await fetch(`${url}/messages`)).json();
    assert.deepEqual(messages.map(m => m.name), ['Partner', 'Suyash']);
    assert.equal(messages[1].text, 'Hello from iPhone');
    assert.equal((await fetch(`${url}/missing`)).status, 404);
    assert.equal((await fetch(`${url}/messages`, { method: 'OPTIONS' })).status, 204);
  } finally { if (server?.listening) await stop(); rmSync(dir, { recursive: true, force: true }); }
});
