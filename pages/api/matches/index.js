import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// GET /api/matches            -> elenco partite per il calendario (pubblico)
// GET /api/matches?active=1   -> la partita attualmente "in vetrina" in home
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non consentito' });
  const db = supabaseAdmin();

  if (req.query.active === '1') {
    const { data, error } = await db.from('matches').select('*').eq('is_active', true).limit(1).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ match: data || null });
  }

  const { data, error } = await db
    .from('matches')
    .select('id, match_date, match_label, team_a_name, team_a_color, team_b_name, team_b_color, score_a, score_b, voting_open, is_active')
    .order('match_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ matches: data || [] });
}
