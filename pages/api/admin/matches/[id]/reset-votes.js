import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const { id } = req.query;
  const db = supabaseAdmin();
  const { error } = await db.from('votes').delete().eq('match_id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
