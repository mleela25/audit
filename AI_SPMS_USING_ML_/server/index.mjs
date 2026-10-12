// server.mjs
import http from 'node:http';
import { env } from 'node:process';

// Optional dotenv support (uncomment if you want .env loading)
// import dotenv from 'dotenv';
// dotenv.config();

const PORT = env.PORT || 8787;

const send = (res, status, data, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers
  });
  res.end(JSON.stringify(data));
};

const isJsonString = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Simple health check
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { status: 'ok' });
  }

  if (req.method === 'POST' && req.url === '/api/ai') {
    try {
      // Read the key at runtime to minimize "stale capture" issues
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        // Masked log: show only presence and last 4 chars
        const masked = process.env.OPENAI_API_KEY ? `***${process.env.OPENAI_API_KEY.slice(-4)}` : 'not set';
        // eslint-disable-next-line no-console
        console.error('OPENAI_API_KEY:', masked);
        return send(res, 500, { error: 'Server missing OPENAI_API_KEY' });
      }

      // collect body
      let body = '';
      for await (const chunk of req) body += chunk;

      if (body && !isJsonString(body)) {
        return send(res, 400, { error: 'Invalid JSON in request body' });
      }

      const payload = body ? JSON.parse(body) : {};
      const {
        messages = [],
        system = 'You are a helpful assistant for a student management dashboard. Be concise and actionable.'
      } = payload;

      if (!Array.isArray(messages)) {
        return send(res, 400, { error: 'messages must be an array' });
      }

      // Build call to OpenAI
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          messages: [
            { role: 'system', content: system },
            ...messages
          ]
        }),
        // note: you can pass signal here for timeout/abort if needed
      });

      if (!resp.ok) {
        const errText = await resp.text();
        // include status for easier debugging
        return send(res, 500, { error: 'OpenAI error', status: resp.status, details: errText });
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content ?? '';

      return send(res, 200, { content });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Server error:', err);
      return send(res, 500, { error: 'Server error', details: String(err) });
    }
  }

  return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AI server listening on http://localhost:${PORT}`);
});
