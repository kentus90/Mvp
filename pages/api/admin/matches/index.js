import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { syncPlayers } from '../../../../lib/players';

export default async function handler(req, res) {
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await db.from('matches').select('*').order('match_date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ matches: data || [] });
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.team_a_name || !b.team_b_name || !b.match_date) {
      return res.status(400).json({ error: 'Data e nomi delle due squadre sono obbligatori' });
    }
    const { data: match, error } = await db.from('matches').insert({
      match_date: b.match_date,
      match_label: b.match_label || null,
      team_a_name: b.team_a_name,
      team_a_color: b.team_a_color || '#3b7bff',
      team_a_logo: b.team_a_logo || null,
      team_b_name: b.team_b_name,
      team_b_color: b.team_b_color || '#ff4d52',
      team_b_logo: b.team_b_logo || null,
      score_a: b.score_a || 0,
      score_b: b.score_b || 0,
      scorers_a: b.scorers_a || null,
      scorers_b: b.scorers_b || null,
      voting_open: b.voting_open !== false,
      is_active: !!b.is_active,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });

    try {
      await syncPlayers(db, match.id, b.playersA, b.playersB);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    if (match.is_active) {
      await db.from('matches').update({ is_active: false }).neq('id', match.id);
    }
    return res.status(200).json({ match });
  }

  return res.status(405).json({ error: 'Metodo non consentito' });
}
