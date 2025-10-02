// netlify/functions/ft-data.js
import { getStore } from '@netlify/blobs';

export async function handler(event, context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  try {
    // Create (or open) a Blobs store named "sandra-free-throw"
    // You can rename it if you want a different bucket name.
    const store = getStore({ name: 'sandra-free-throw' });
    const KEY = 'ft-data.json';

    if (event.httpMethod === 'GET') {
      const json = await store.get(KEY, { type: 'json' });
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify(json || { byDate: {} }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : null;
      if (!body || typeof body !== 'object' || !body.byDate) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid payload' }) };
      }
      await store.set(KEY, JSON.stringify(body), { contentType: 'application/json' });
      return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    // Log goes to Netlify Function logs, and the 502 you saw is produced by errors like these
    console.error('ft-data error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server error' }) };
  }
}
