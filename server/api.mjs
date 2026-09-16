import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

export function createApi(databasePath = ':memory:') {
  const db = new DatabaseSync(databasePath);
  db.exec('CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, name TEXT NOT NULL, text TEXT NOT NULL, createdAt TEXT NOT NULL)');
  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && path === '/health') return reply(200, { status: 'ok', service: 'Pocket Board' });
    if (req.method === 'GET' && path === '/messages') {
      return reply(200, { messages: db.prepare('SELECT * FROM messages ORDER BY createdAt DESC, rowid DESC LIMIT 100').all() });
    }
    if (req.method !== 'POST' || path !== '/messages') return reply(404, { error: 'Not found' });
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 4096) return reply(413, { error: 'Message is too large' });
      }
      let data;
      try { data = JSON.parse(body); } catch { return reply(400, { error: 'Send valid JSON' }); }
      if (!data || typeof data.name !== 'string' || typeof data.text !== 'string') return reply(400, { error: 'Name and message are required' });
      const name = data.name.trim();
      const text = data.text.trim();
      if (!name || name.length > 30 || !text || text.length > 280) return reply(400, { error: 'Use a name of 1–30 characters and a message of 1–280 characters' });
      const message = { id: randomUUID(), name, text, createdAt: new Date().toISOString() };
      db.prepare('INSERT INTO messages VALUES (?, ?, ?, ?)').run(message.id, name, text, message.createdAt);
      db.exec('DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY createdAt DESC, rowid DESC LIMIT 100)');
      reply(201, message);
    } catch (error) {
      console.error(error.message);
      if (!res.headersSent) reply(500, { error: 'Could not save message' });
    }
  });
  server.on('close', () => db.close());
  return server;
}
