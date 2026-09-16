import { serialize } from 'cookie';
import { sessionCookieOptions } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const cookieOpts = sessionCookieOptions();
  res.setHeader('Set-Cookie', serialize(cookieOpts.name, '', { ...cookieOpts, maxAge: 0 }));
  return res.status(200).json({ ok: true });
}
