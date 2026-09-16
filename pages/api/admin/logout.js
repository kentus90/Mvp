import { buildSessionCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  res.setHeader('Set-Cookie', buildSessionCookie('', { clear: true }));
  return res.status(200).json({ ok: true });
}
