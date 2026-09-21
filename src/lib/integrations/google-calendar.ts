import crypto from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value;
}

function encryptionKey() {
  const raw = Buffer.from(env('GOOGLE_TOKEN_ENCRYPTION_KEY'), 'hex');
  if (raw.length !== 32) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY deve ter 64 caracteres hexadecimais.');
  return raw;
}

export function encryptToken(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptToken(value: string) {
  const [ivHex, tagHex, encryptedHex] = value.split(':');
  if (!ivHex || !tagHex || !encryptedHex) throw new Error('Token Google inválido.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
}

export function googleRedirectUri() {
  return `${env('NEXT_PUBLIC_APP_URL').replace(/\\/$/, '')}/api/integrations/google-calendar/callback`;
}

export function googleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: env('GOOGLE_CLIENT_ID'),
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      redirect_uri: googleRedirectUri(),
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Google token exchange falhou: ${await response.text()}`);
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number; scope?: string; token_type: string }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Google token refresh falhou: ${await response.text()}`);
  return response.json() as Promise<{ access_token: string; expires_in: number; scope?: string; token_type: string }>;
}

export async function googleApi(accessToken: string, path: string, init?: RequestInit) {
  const response = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Google Calendar API ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

export function reminderToGoogleEvent(reminder: { id: string; title: string; remind_at: string }) {
  const start = new Date(reminder.remind_at);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return {
    summary: reminder.title,
    description: 'Criado pela Secretária.',
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: { useDefault: true },
    extendedProperties: { private: { secretaria_reminder_id: reminder.id } },
  };
}
