import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'uttam_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Server Supabase credentials are missing.');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
};

const getSessionSecret = () => {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('APP_SESSION_SECRET must be set to at least 32 characters.');
  }
  return secret;
};

const sign = (payload) => {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
};

export const createSessionValue = (user) => {
  const payload = Buffer.from(JSON.stringify({
    phone: user.phone,
    role: user.role,
    name: user.name,
    exp: Date.now() + SESSION_MAX_AGE * 1000
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
};

export const setSessionCookie = async (user) => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
};

export const getSession = async () => {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
};

export const requireSession = async () => {
  const session = await getSession();
  if (!session?.phone) {
    return { error: Response.json({ error: 'Login required.' }, { status: 401 }) };
  }
  return { session };
};

export const requireAdmin = async () => {
  const { session, error } = await requireSession();
  if (error) return { error };
  if (session.role !== 'admin') {
    return { error: Response.json({ error: 'Admin access required.' }, { status: 403 }) };
  }
  return { session };
};

export const safeProfile = (profile) => {
  if (!profile) return null;
  const { password, ...safe } = profile;
  return safe;
};
