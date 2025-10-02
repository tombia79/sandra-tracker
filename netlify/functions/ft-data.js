import { getStore } from '@netlify/blobs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: CORS, body: '' };
    }

    // Read credentials from environment (set in Netlify UI)
    const siteID = process.env.BLOB_SITE_ID;
    const token  = process.env.BLOB_TOKEN;

    if (!siteID || !token) {
      console.error('Missing BLOB_SITE_ID or BLOB_TOKEN env vars');
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server config missing' }) };
    }

    // Manually pass siteID and token since Labs toggle isn’t available
    const store = getStore({ name: 'sandra-free-throw', siteID, token });
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
      let body;
      try {
        body = event.body ? JSON.parse(event.body) : null;
      } catch (e) {
        console.error('Bad JSON body:', e);
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) };
      }
      if (!body || typeof body !== 'object' || !body.byDate) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid payload' }) };
      }

      await store.set(KEY, JSON.stringify(body), { contentType: 'application/json' });
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true }),
      };
    }

    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('ft-data handler error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server error' }) };
  }
};
