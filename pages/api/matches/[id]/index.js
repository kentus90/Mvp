import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

async function tallyFor(db, matchId, players) {
  const { data: votes, error } = await db.from('votes').select('player_id').eq('match_id', matchId);
  if (error) throw error;
  const counts = {};
  for (const v of votes || []) counts[v.player_id] = (counts[v.player_id] || 0) + 1;
  const ranked = players
    .map(p => ({
      id: p.id,
      name: p.name,
      number: p.number,
      position: p.position,
      teamName: p.team === 'A' ? undefined : undefined,
      color: undefined,
      votes: counts[p.id] || 0,
    }))
    .sort((a, b) => b.votes - a.votes);
  const total = (votes || []).length;
  return { ranked, total };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non consentito' });
  const { id } = req.query;
  const db = supabaseAdmin();

  const { data: match, error: mErr } = await db.from('matches').select('*').eq('id', id).maybeSingle();
  if (mErr) return res.status(500).json({ error: mErr.message });
  if (!match) return res.status(404).json({ error: 'Partita non trovata' });

  const { data: players, error: pErr } = await db.from('players').select('*').eq('match_id', id).order('sort_order', { ascending: true });
  if (pErr) return res.status(500).json({ error: pErr.message });

  const votable = (players || []).filter(p => p.slot !== 'coach');
  const tally = await tallyFor(db, id, votable);
  // arricchisco il tally con nome squadra e colore per il leaderboard
  tally.ranked = tally.ranked.map(r => {
    const p = players.find(pp => pp.id === r.id);
    const isA = p?.team === 'A';
    return {
      ...r,
      teamName: isA ? match.team_a_name : match.team_b_name,
      color: isA ? match.team_a_color : match.team_b_color,
    };
  });

  return res.status(200).json({ match, players: players || [], tally });
}
