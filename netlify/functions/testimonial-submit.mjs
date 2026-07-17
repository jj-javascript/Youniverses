import crypto from 'node:crypto';

export const config = {
  path: '/api/testimonial-submit',
};

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || 'janrh8g1';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production01';
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8888',
  'http://localhost:8765',
  'http://localhost:8080',
];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function sanitize(str, maxLen) {
  return String(str || '')
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, maxLen);
}

function buildDocumentId(name, quote) {
  const hash = crypto
    .createHash('sha1')
    .update(name + '|' + quote)
    .digest('hex')
    .slice(0, 16);
  return 'drafts.testimonial-web-' + hash;
}

function getAllowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS;
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRequestOrigin(req) {
  const origin = req.headers.get('origin');
  if (origin) return origin;

  const referer = req.headers.get('referer');
  if (!referer) return '';

  try {
    return new URL(referer).origin;
  } catch {
    return '';
  }
}

function isAllowedOrigin(req) {
  const requestOrigin = getRequestOrigin(req);
  if (!requestOrigin) return false;
  return getAllowedOrigins().includes(requestOrigin);
}

function isHoneypotTriggered(botcheck) {
  if (botcheck === true) return true;
  if (typeof botcheck === 'string') {
    const normalized = botcheck.trim().toLowerCase();
    return normalized === 'true' || normalized === 'on' || normalized === '1';
  }
  return false;
}

function isWebhookAuthorized(req) {
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (!expectedSecret) return false;

  const incomingSecret = req.headers.get('x-webhook-secret') || '';
  return safeEqual(incomingSecret, expectedSecret);
}

function isBrowserAuthorized(req, body) {
  if (isHoneypotTriggered(body.botcheck)) return false;
  return isAllowedOrigin(req);
}

function sanityMutateUrl() {
  return (
    'https://' +
    SANITY_PROJECT_ID +
    '.api.sanity.io/v' +
    SANITY_API_VERSION +
    '/data/mutate/' +
    SANITY_DATASET
  );
}

async function createSanityDraft(name, quote, source) {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    throw new Error('SANITY_WRITE_TOKEN is not configured');
  }

  const mutation = {
    mutations: [
      {
        createIfNotExists: {
          _id: buildDocumentId(name, quote),
          _type: 'testimonial',
          name,
          quote,
          approved: false,
          submittedAt: new Date().toISOString(),
          source,
        },
      },
    ],
  };

  const response = await fetch(sanityMutateUrl(), {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mutation),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error('Sanity mutate failed: ' + response.status);
    error.status = response.status;
    error.result = result;
    throw error;
  }

  return result;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const webhookAuth = isWebhookAuthorized(req);
  const browserAuth = isBrowserAuthorized(req, body);

  if (!webhookAuth && !browserAuth) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const source = webhookAuth ? 'web3forms' : 'website';

  const name = sanitize(body.name, 100);
  const quote = sanitize(body.message, 1000);

  if (!name || !quote) {
    return json({ error: 'Missing required fields: name and message' }, 400);
  }

  try {
    const result = await createSanityDraft(name, quote, source);
    return json({ success: true, documentId: buildDocumentId(name, quote), result });
  } catch (err) {
    console.error('Failed to create Sanity draft', {
      name,
      quoteLength: quote.length,
      source,
      status: err.status,
      message: err.message,
      result: err.result,
    });

    const status = err.status && err.status >= 500 ? 502 : 500;
    return json({ error: 'Write failed' }, status);
  }
}
