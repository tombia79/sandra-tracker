// netlify/functions/ft-data.js
import { getStore } from '@netlify/blobs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const store = getStore({ name: 'sandra-free-throw' });
  const KEY = 'ft-data.json';

  if (req.method === 'GET') {
    const json = await store.get(KEY, { type: 'json' });
    return res.status(200).json(json || { byDate: {} });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object' || !body.byDate) {
        return res.status(400).json({ error: 'Invalid payload' });
      }
      await store.set(KEY, JSON.stringify(body), { contentType: 'application/json' });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: 'Bad JSON' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
