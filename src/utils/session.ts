// src/utils/session.ts
import crypto from 'crypto';
import { Request, Response } from 'express';

export function generateSessionToken() {
  return crypto.randomBytes(48).toString('hex');
}

export const getSessionCookieOptions = () => {
  const maxAge = Number(process.env.SESSION_MAX_AGE ?? 60 * 60 * 24 * 30); // seconds
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as 'lax' | 'strict' | 'none',
    maxAge: maxAge * 1000, // express cookie expects ms
    path: '/',
  };
};

export function clearSessionCookie(res: Response) {
  res.clearCookie(process.env.SESSION_COOKIE_NAME ?? 'session_token', {
    path: '/',
  });
}
