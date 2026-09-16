import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { verifySessionToken, verifyPassword, hashPassword, SESSION_COOKIE_NAME } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return res.status(401).json({ error: 'Non autenticato' });

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password non valida (minimo 8 caratteri)' });
  }

  const db = supabaseAdmin();
  const { data: user, error } = await db.from('admin_users').select('*').eq('id', session.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: 'Utente non trovato' });

  const ok = await verifyPassword(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Password attuale errata' });

  const newHash = await hashPassword(newPassword);
  const { error: updErr } = await db.from('admin_users').update({ password_hash: newHash, must_change_password: false }).eq('id', user.id);
  if (updErr) return res.status(500).json({ error: updErr.message });

  return res.status(200).json({ ok: true });
}
