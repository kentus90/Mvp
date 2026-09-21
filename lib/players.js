// Sincronizza le formazioni di una partita SENZA cancellare i giocatori
// che restano in rosa. I voti sono collegati all'id del giocatore: se il
// giocatore venisse eliminato e ricreato, i suoi voti andrebbero persi.
//
// Regola di abbinamento: stessa squadra + stesso nome (senza distinzione
// tra maiuscole e minuscole). Se il nome resta uguale, il giocatore
// mantiene il suo id e i suoi voti anche se cambiano numero o ruolo.
// Vengono eliminati solo i giocatori tolti davvero dalla rosa.

function key(team, name) {
  return team + '|' + String(name || '').trim().toLowerCase();
}

export async function syncPlayers(db, matchId, playersA, playersB) {
  const incoming = [
    ...(playersA || []).map((p, i) => ({ team: 'A', number: p.number || '', position: p.position || '', name: (p.name || '').trim(), sort_order: i })),
    ...(playersB || []).map((p, i) => ({ team: 'B', number: p.number || '', position: p.position || '', name: (p.name || '').trim(), sort_order: i })),
  ].filter(r => r.name);

  const { data: existing, error: readErr } = await db.from('players').select('*').eq('match_id', matchId);
  if (readErr) throw readErr;

  const byKey = new Map();
  for (const p of existing || []) {
    const k = key(p.team, p.name);
    if (!byKey.has(k)) byKey.set(k, p);
  }

  const keptIds = new Set();
  const toInsert = [];

  for (const r of incoming) {
    const match = byKey.get(key(r.team, r.name));
    if (match && !keptIds.has(match.id)) {
      keptIds.add(match.id);
      const changed = match.number !== r.number || match.position !== r.position
        || match.sort_order !== r.sort_order || match.name !== r.name;
      if (changed) {
        const { error } = await db.from('players')
          .update({ number: r.number, position: r.position, sort_order: r.sort_order, name: r.name })
          .eq('id', match.id);
        if (error) throw error;
      }
    } else {
      toInsert.push({ match_id: matchId, ...r });
    }
  }

  const toDelete = (existing || []).filter(p => !keptIds.has(p.id)).map(p => p.id);
  if (toDelete.length) {
    const { error } = await db.from('players').delete().in('id', toDelete);
    if (error) throw error;
  }

  if (toInsert.length) {
    const { error } = await db.from('players').insert(toInsert);
    if (error) throw error;
  }
}
