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
  const { id } = req.query;
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const { data: match, error } = await db.from('matches').select('*').eq('id', id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!match) return res.status(404).json({ error: 'Partita non trovata' });
    const { data: players, error: pErr } = await db.from('players').select('*').eq('match_id', id).order('sort_order', { ascending: true });
    if (pErr) return res.status(500).json({ error: pErr.message });
    return res.status(200).json({ match, players: players || [] });
  }

  if (req.method === 'PUT') {
    const b = req.body || {};
    const { error } = await db.from('matches').update({
      match_date: b.match_date,
      match_label: b.match_label || null,
      team_a_name: b.team_a_name,
      team_a_color: b.team_a_color,
      team_a_logo: b.team_a_logo || null,
      team_b_name: b.team_b_name,
      team_b_color: b.team_b_color,
      team_b_logo: b.team_b_logo || null,
      score_a: b.score_a || 0,
      score_b: b.score_b || 0,
      voting_open: !!b.voting_open,
      is_active: !!b.is_active,
    }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    try {
      await replacePlayers(db, id, b.playersA, b.playersB);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    if (b.is_active) {
      await db.from('matches').update({ is_active: false }).neq('id', id);
    }
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await db.from('matches').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Metodo non consentito' });
}
