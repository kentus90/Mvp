import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// GET  -> restituisce il voto gia espresso da questo device_id (se esiste)
// POST -> registra o aggiorna il voto per questo device_id (un voto per partita per dispositivo)
export default async function handler(req, res) {
  const { id } = req.query;
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const deviceId = req.query.device_id;
    if (!deviceId) return res.status(400).json({ error: 'device_id mancante' });
    const { data, error } = await db.from('votes').select('player_id').eq('match_id', id).eq('device_id', deviceId).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ playerId: data ? data.player_id : null });
  }

  if (req.method === 'POST') {
    const { deviceId, playerId } = req.body || {};
    if (!deviceId || !playerId) return res.status(400).json({ error: 'Dati mancanti' });

    const { data: match, error: mErr } = await db.from('matches').select('voting_open').eq('id', id).maybeSingle();
    if (mErr) return res.status(500).json({ error: mErr.message });
    if (!match) return res.status(404).json({ error: 'Partita non trovata' });
    if (!match.voting_open) return res.status(403).json({ error: 'Votazioni chiuse per questa partita' });

    const { data: player, error: pErr } = await db.from('players').select('id, slot').eq('id', playerId).eq('match_id', id).maybeSingle();
    if (pErr) return res.status(500).json({ error: pErr.message });
    if (!player) return res.status(400).json({ error: 'Giocatore non valido per questa partita' });
    if (player.slot === 'coach') return res.status(400).json({ error: 'Non si puo votare l\'allenatore' });

    const { error } = await db
      .from('votes')
      .upsert({ match_id: id, device_id: deviceId, player_id: playerId }, { onConflict: 'match_id,device_id' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Metodo non consentito' });
}
