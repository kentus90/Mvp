import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { verifyPassword, createSessionToken, buildSessionCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username e password obbligatori' });

  const db = supabaseAdmin();
  const { data: user, error } = await db.from('admin_users').select('*').eq('username', username).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(401).json({ error: 'Credenziali non valide' });

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenziali non valide' });

  const token = await createSessionToken({ id: user.id, username: user.username });
  res.setHeader('Set-Cookie', buildSessionCookie(token));
  return res.status(200).json({ ok: true, mustChangePassword: !!user.must_change_password });
}
