import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual, createHash, createCipheriv, createDecipheriv } from 'node:crypto';
import { HEALTH_SCOPES, PROFILE_SCOPES, DEVICE_SCOPES, RHYTHM_SCOPES, fetchHealthDay, fetchOthers, fetchDiagnostics, fetchStress, fetchActivityHeart, fetchGrantedScopes, fetchHealthProfile, PROFILE_HEALTH_SCOPES, validDate } from './health.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
if (existsSync(resolve(ROOT, '.env')) && typeof process.loadEnvFile === 'function') process.loadEnvFile(resolve(ROOT, '.env'));
const MIME = { '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const SESSION_DURATION = 12 * 60 * 60 * 1000;
const OAUTH_DURATION = 10 * 60 * 1000;
const SESSION_COOKIE = 'scoop_session';
const OAUTH_COOKIE = 'scoop_oauth';
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com; font-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};
const randomId = () => randomBytes(32).toString('base64url');
// Endpoints that make Scoop call Google on the signed-in person's behalf.
const GOOGLE_PATHS = new Set(['/api/health', '/api/diagnostics', '/api/stress', '/api/activity', '/api/permissions', '/api/profile', '/api/others']);
const AUTH_PATHS = new Set(['/api/connect', '/api/oauth/callback']);
export const DEFAULT_LIMITS = {
  ip: { limit: 120, windowMs: 60e3 },             // any /api request, per client IP
  auth: { limit: 10, windowMs: 60e3 },            // starting or finishing sign-in, per client IP
  // Google-backed requests per connected account. /api/health makes ~13 Google calls, so 20 a minute
  // stays under Google Health's fixed 300-requests-per-minute-per-user quota.
  accountMinute: { limit: 20, windowMs: 60e3 },
  accountHour: { limit: 300, windowMs: 3600e3 },
};

/** Fixed-window counter. Each server instance keeps its own counts, so this backs up the
 * Vercel firewall rule; its main job is capping how often one account can make Scoop call Google. */
export function createLimiter({ limit, windowMs, maxKeys = 10000 }) {
  const hits = new Map();
  return key => {
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      if (hits.size >= maxKeys) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
      if (hits.size >= maxKeys) hits.delete(hits.keys().next().value);
      entry = { count: 0, reset: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    return entry.count > limit ? Math.max(1, Math.ceil((entry.reset - now) / 1000)) : 0;
  };
}
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const first = Buffer.from(a), second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
};

/** Sessions live in AES-256-GCM encrypted, HttpOnly cookies so that any serverless
 * instance can read them. Nothing is stored on the server. */
function cookieSealer(secret) {
  const key = createHash('sha256').update(secret).digest();
  return {
    seal(value, ttl) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const body = Buffer.concat([cipher.update(JSON.stringify({ ...value, exp: Date.now() + ttl })), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
    },
    open(token) {
      try {
        const raw = Buffer.from(token, 'base64url');
        if (raw.length < 29) return null;
        const decipher = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
        decipher.setAuthTag(raw.subarray(12, 28));
        const value = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString());
        return value.exp > Date.now() ? value : null;
      } catch { return null; }
    },
  };
}

export function createHandler(options = {}) {
  const env = options.env || process.env;
  const port = Number(env.PORT || 3000);
  const origin = new URL(env.APP_ORIGIN || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : `http://localhost:${port}`)).origin;
  const redirectUri = `${origin}/api/oauth/callback`;
  const hosted = Boolean(env.VERCEL);
  const hasSecret = Boolean(env.SESSION_SECRET && env.SESSION_SECRET.length >= 32);
  const configured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && (hasSecret || !hosted));
  // Locally a per-process key is fine (sessions end on restart); hosted deployments need a shared secret.
  const sealer = cookieSealer(hasSecret ? env.SESSION_SECRET : randomId());
  const publicRoot = resolve(options.publicRoot || resolve(ROOT, 'public'));
  const secure = origin.startsWith('https:');
  const cookie = (name, value, maxAgeMs, path = '/') => `${name}=${value}; Path=${path}; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}${secure ? '; Secure' : ''}`;
  const readCookie = (request, name) => request.headers.cookie?.split(';').map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.slice(name.length + 1);
  const makeClient = async tokens => {
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, redirectUri });
    if (tokens) client.setCredentials(tokens);
    return client;
  };
  const sessionCookie = (tokens, profile) => cookie(SESSION_COOKIE, sealer.seal({ tokens: {
    refresh_token: tokens.refresh_token, access_token: tokens.access_token, expiry_date: tokens.expiry_date,
  }, profile: profile || null }, SESSION_DURATION), SESSION_DURATION);
  // Only the fields the interface shows: display name, first name, and avatar.
  const readProfile = async (client, idToken) => {
    if (!idToken) return null;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
      const p = ticket.getPayload() || {};
      const picture = typeof p.picture === 'string' && p.picture.startsWith('https://lh3.googleusercontent.com/') ? p.picture : null;
      return { name: p.name || null, firstName: p.given_name || p.name?.split(' ')[0] || null, picture };
    } catch { return null; }
  };
  const json = (response, status, data) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(data)); };
  const redirect = (response, location) => { response.writeHead(302, { Location: location }); response.end(); };
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  const limiter = Object.fromEntries(Object.entries(limits).map(([name, rule]) => [name, createLimiter(rule)]));
  // Vercel sets x-forwarded-for itself; locally only the socket address can be trusted.
  const clientIp = request => (hosted && request.headers['x-forwarded-for']?.split(',')[0].trim()) || request.socket.remoteAddress || 'unknown';
  const accountKey = tokens => createHash('sha256').update(String(tokens.refresh_token || tokens.access_token)).digest('base64url').slice(0, 22);
  const tooMany = (response, seconds) => {
    response.setHeader('Retry-After', String(seconds));
    return json(response, 429, { error: 'rate_limited', message: `Too many requests. Try again in ${seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} minutes`}.` });
  };

  return async function handler(request, response) {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(name, value);
    try {
      const url = new URL(request.url, origin);
      const session = configured ? sealer.open(readCookie(request, SESSION_COOKIE) || '') : null;
      const connected = Boolean(session?.tokens?.refresh_token || session?.tokens?.access_token);
      if (url.pathname.startsWith('/api/')) {
        const ip = clientIp(request);
        const wait = limiter.ip(ip) || (AUTH_PATHS.has(url.pathname) && limiter.auth(ip))
          || (connected && GOOGLE_PATHS.has(url.pathname) && (() => { const key = accountKey(session.tokens); return limiter.accountMinute(key) || limiter.accountHour(key); })());
        if (wait) return tooMany(response, wait);
      }
      if (url.pathname === '/api/status' && request.method === 'GET') {
        return json(response, 200, { configured, connected, provider: 'Google Health', profile: connected ? session.profile || null : null,
          reason: configured ? null : hosted && !hasSecret ? 'SESSION_SECRET (32+ characters) must be set on the server before your Fitbit account can be connected.' : 'Google OAuth credentials are required before your Fitbit account can be connected.',
          setup: { redirectUri, requiredScopes: HEALTH_SCOPES }, storage: 'Connection tokens are kept only in an encrypted, HttpOnly cookie in this browser for up to 12 hours.' });
      }
      if (url.pathname === '/api/connect' && request.method === 'GET') {
        if (!configured) return json(response, 503, { error: 'oauth_not_configured', message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (and SESSION_SECRET when hosted), enable Google Health API, add your Google account as a test user, and register the redirect URI.', redirectUri });
        const client = await makeClient();
        const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
        const state = randomId();
        response.setHeader('Set-Cookie', cookie(OAUTH_COOKIE, sealer.seal({ state, codeVerifier }, OAUTH_DURATION), OAUTH_DURATION, '/api/oauth'));
        return redirect(response, client.generateAuthUrl({ access_type: 'offline', scope: [...HEALTH_SCOPES, ...PROFILE_SCOPES, ...DEVICE_SCOPES, ...RHYTHM_SCOPES, ...PROFILE_HEALTH_SCOPES], state, code_challenge: codeChallenge, code_challenge_method: 'S256', prompt: 'consent', include_granted_scopes: true }));
      }
      if (url.pathname === '/api/oauth/callback' && request.method === 'GET') {
        const pending = sealer.open(readCookie(request, OAUTH_COOKIE) || '');
        // State is single-use, including denied consent.
        response.setHeader('Set-Cookie', cookie(OAUTH_COOKIE, '', 0, '/api/oauth'));
        if (!pending?.state || !equal(pending.state, url.searchParams.get('state'))) return json(response, 400, { error: 'invalid_oauth_state', message: 'Your connection request expired or could not be verified. Start connecting again.' });
        if (url.searchParams.has('error')) return redirect(response, '/?connection=denied');
        const code = url.searchParams.get('code');
        if (!code) return json(response, 400, { error: 'missing_code', message: 'Google did not return an authorization code.' });
        const client = await makeClient();
        const { tokens } = await client.getToken({ code, codeVerifier: pending.codeVerifier, redirect_uri: redirectUri });
        client.setCredentials(tokens);
        try {
          // Google requires this check before considering an account linked.
          await client.request({ url: 'https://health.googleapis.com/v4/users/me/identity', timeout: 20000 });
        } catch {
          await client.revokeCredentials().catch(() => {});
          return redirect(response, '/?connection=account_not_linked');
        }
        const profile = await readProfile(client, tokens.id_token);
        response.setHeader('Set-Cookie', [cookie(OAUTH_COOKIE, '', 0, '/api/oauth'), sessionCookie(tokens, profile)]);
        return redirect(response, '/?connection=success');
      }
      if (url.pathname === '/api/health' && request.method === 'GET') {
        if (!connected) return json(response, 401, { error: 'not_connected', message: 'Connect your Google Health / Fitbit account first.' });
        const date = url.searchParams.get('date');
        if (!validDate(date)) return json(response, 400, { error: 'invalid_date', message: 'Use a valid date in YYYY-MM-DD format.' });
        const client = await makeClient(session.tokens);
        let refreshed = false;
        client.on('tokens', () => { refreshed = true; });
        const timeZone = /^[A-Za-z_+\-/0-9]{1,64}$/.test(url.searchParams.get('tz') || '') ? url.searchParams.get('tz') : null;
        const data = await fetchHealthDay(client, date, timeZone);
        if (refreshed) response.setHeader('Set-Cookie', sessionCookie({ ...client.credentials, refresh_token: client.credentials.refresh_token || session.tokens.refresh_token }, session.profile));
        return json(response, 200, data);
      }
      if (url.pathname === '/api/diagnostics' && request.method === 'GET') {
        if (!connected) return json(response, 401, { error: 'not_connected', message: 'Connect your Google Health / Fitbit account first.' });
        const date = url.searchParams.get('date');
        if (!validDate(date)) return json(response, 400, { error: 'invalid_date', message: 'Use a valid date in YYYY-MM-DD format.' });
        const timeZone = /^[A-Za-z_+\-/0-9]{1,64}$/.test(url.searchParams.get('tz') || '') ? url.searchParams.get('tz') : null;
        return json(response, 200, await fetchDiagnostics(await makeClient(session.tokens), date, 7, timeZone));
      }
      if (url.pathname === '/api/stress' && request.method === 'GET') {
        if (!connected) return json(response, 401, { error: 'not_connected', message: 'Connect your Google Health / Fitbit account first.' });
        const date = url.searchParams.get('date');
        if (!validDate(date)) return json(response, 400, { error: 'invalid_date', message: 'Use a valid date in YYYY-MM-DD format.' });
        const timeZone = /^[A-Za-z_+\-/0-9]{1,64}$/.test(url.searchParams.get('tz') || '') ? url.searchParams.get('tz') : 'UTC';
        const client = await makeClient(session.tokens);
        let refreshed = false;
        client.on('tokens', () => { refreshed = true; });
        const data = await fetchStress(client, date, timeZone);
        if (refreshed) response.setHeader('Set-Cookie', sessionCookie({ ...client.credentials, refresh_token: client.credentials.refresh_token || session.tokens.refresh_token }, session.profile));
        return json(response, 200, data);
      }
      if (['/api/activity', '/api/permissions', '/api/profile'].includes(url.pathname) && request.method === 'GET') {
        if (!connected) return json(response, 401, { error: 'not_connected', message: 'Connect your Google Health / Fitbit account first.' });
        const client = await makeClient(session.tokens);
        let refreshed = false;
        client.on('tokens', () => { refreshed = true; });
        let data;
        if (url.pathname === '/api/activity') {
          const start = url.searchParams.get('start'), end = url.searchParams.get('end');
          if (!start || !end || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end))) return json(response, 400, { error: 'invalid_range', message: 'Provide a valid workout start and end.' });
          data = await fetchActivityHeart(client, start, end, url.searchParams.get('date'));
        } else if (url.pathname === '/api/permissions') data = { scopes: await fetchGrantedScopes(client) };
        else data = await fetchHealthProfile(client);
        if (refreshed) response.setHeader('Set-Cookie', sessionCookie({ ...client.credentials, refresh_token: client.credentials.refresh_token || session.tokens.refresh_token }, session.profile));
        return json(response, 200, data);
      }
      if (url.pathname === '/api/others' && request.method === 'GET') {
        if (!connected) return json(response, 401, { error: 'not_connected', message: 'Connect your Google Health / Fitbit account first.' });
        const date = url.searchParams.get('date');
        if (!validDate(date)) return json(response, 400, { error: 'invalid_date', message: 'Use a valid date in YYYY-MM-DD format.' });
        const client = await makeClient(session.tokens);
        let refreshed = false;
        client.on('tokens', () => { refreshed = true; });
        const data = await fetchOthers(client, date);
        if (refreshed) response.setHeader('Set-Cookie', sessionCookie({ ...client.credentials, refresh_token: client.credentials.refresh_token || session.tokens.refresh_token }, session.profile));
        return json(response, 200, data);
      }
      if (url.pathname === '/api/disconnect' && request.method === 'POST') {
        if (request.headers.origin !== origin) return json(response, 403, { error: 'invalid_origin', message: 'Disconnect from this app.' });
        // Clear this browser's session even if Google's revocation endpoint is unavailable.
        if (connected) await (await makeClient(session.tokens)).revokeCredentials().catch(() => {});
        response.setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', 0));
        return json(response, 200, { connected: false });
      }
      if (url.pathname.startsWith('/api/')) return json(response, 404, { error: 'not_found' });
      if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, { error: 'method_not_allowed' });
      const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const path = resolve(publicRoot, `.${requested}`);
      if (path !== publicRoot && !path.startsWith(publicRoot + sep)) return json(response, 403, { error: 'forbidden' });
      if (!MIME[extname(path)] || !(await stat(path)).isFile()) return json(response, 404, { error: 'not_found' });
      const body = await readFile(path);
      response.writeHead(200, { 'Content-Type': MIME[extname(path)] });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return json(response, 404, { error: 'not_found' });
      // Never echo OAuth responses, credentials, health records, or request URLs into logs.
      return json(response, error.status || 500, { error: 'request_failed', message: error.status === 502 ? error.message : 'The request could not be completed. Check your connection configuration and try again.' });
    }
  };
}

export function createAppServer(options = {}) {
  return createServer(createHandler(options));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000);
  createAppServer().listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Scoop web app: http://localhost:${port}`));
}
