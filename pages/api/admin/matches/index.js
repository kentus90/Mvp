import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function replacePlayers(db, matchId, playersA, playersB) {
  await db.from('players').delete().eq('match_id', matchId);
  const rows = [
    ...(playersA || []).map((p, i) => ({ match_id: matchId, team: 'A', number: p.number || '', position: p.position || '', name: p.name, sort_order: i })),
    ...(playersB || []).map((p, i) => ({ match_id: matchId, team: 'B', number: p.number || '', position: p.position || '', name: p.name, sort_order: i })),
  ].filter(r => r.name && r.name.trim());
  if (rows.length) {
    const { error } = await db.from('players').insert(rows);
    if (error) throw error;
  }
}

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
      team_b_name: b.team_b_name,
      team_b_color: b.team_b_color || '#ff4d52',
      score_a: b.score_a || 0,
      score_b: b.score_b || 0,
      voting_open: b.voting_open !== false,
      is_active: !!b.is_active,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });

    try {
      await replacePlayers(db, match.id, b.playersA, b.playersB);
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
