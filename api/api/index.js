import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, body) => res.status(status).json(body);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const url = new URL(req.url, 'http://localhost');
  const route = req.query?.route || url.searchParams.get('route');
  const path = route ? `/${route}` : url.pathname;
  if (!['/health', '/messages'].includes(path)) return reply(404, {error:'Not found'});
  if (!process.env.DATABASE_URL) return reply(503, {error:'Database not configured'});
  try {
    const sql = neon(process.env.DATABASE_URL);
    if (req.method === 'GET' && path === '/health') {
      await sql`SELECT 1`;
      return reply(200, {status:'ok',service:'Pocket Board',storage:'Postgres'});
    }
    if (req.method === 'GET' && path === '/messages') {
      const messages = await sql`SELECT id, name, text, created_at AS "createdAt" FROM messages ORDER BY sequence DESC LIMIT 100`;
      return reply(200, {messages});
    }
    if (req.method !== 'POST' || path !== '/messages') return reply(405, {error:'Method not allowed'});
    if (Number(req.headers['content-length']) > 4096) return reply(413,{error:'Message is too large'});
    let data = req.body;
    if (typeof data === 'string') { try {data = JSON.parse(data);} catch {return reply(400,{error:'Send valid JSON'});} }
    if (!data || typeof data.name !== 'string' || typeof data.text !== 'string') return reply(400,{error:'Name and message are required'});
    const name=data.name.trim(), text=data.text.trim();
    if (!name || name.length>30 || !text || text.length>280) return reply(400,{error:'Use a name of 1–30 characters and a message of 1–280 characters'});
    const id=randomUUID();
    const results = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(712034)`,
      sql`INSERT INTO messages(id,name,text) VALUES (${id},${name},${text}) RETURNING id,name,text,created_at AS "createdAt"`,
      sql`DELETE FROM messages WHERE sequence NOT IN (SELECT sequence FROM messages ORDER BY sequence DESC LIMIT 100)`
    ]);
    return reply(201,results[1][0]);
  } catch { return reply(500,{error:'Could not access messages. Please try again.'}); }
}
