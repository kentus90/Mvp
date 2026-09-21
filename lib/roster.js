// Formato della formazione (una riga per voce):
//
//   1 POR Vannucci        -> titolare
//   ...
//   PANCHINA              -> da qui in poi i giocatori vanno in panchina
//   12 Ramini             -> panchina
//   Mister Ferraro        -> allenatore (anche "Allenatore Ferraro")
//
// Se la riga PANCHINA manca, i primi 11 giocatori sono titolari e gli
// altri vanno in panchina. La riga del mister puo' stare ovunque.

const POS = { POR: true, DIF: true, CEN: true, ATT: true };
const STARTERS_DEFAULT = 11;

const COACH_RE = /^(mister|mr\.?|allenatore|all\.)\s+/i;
const BENCH_RE = /^(panchina|riserve|---+)\s*:?\s*$/i;

export function rosterToText(players) {
  const list = players || [];
  const starters = list.filter(p => (p.slot || 'starter') === 'starter');
  const bench = list.filter(p => p.slot === 'bench');
  const coach = list.filter(p => p.slot === 'coach');
  const line = p => `${p.number || ''} ${p.position || ''} ${p.name}`.replace(/\s+/g, ' ').trim();
  const out = starters.map(line);
  if (bench.length) out.push('PANCHINA', ...bench.map(line));
  coach.forEach(c => out.push(`Mister ${c.name}`));
  return out.join('\n');
}

export function parseRoster(text) {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  const hasSeparator = lines.some(l => BENCH_RE.test(l));
  const result = [];
  let inBench = false;
  let playerCount = 0;

  for (const l of lines) {
    if (BENCH_RE.test(l)) { inBench = true; continue; }

    if (COACH_RE.test(l)) {
      const name = l.replace(COACH_RE, '').trim();
      if (name) result.push({ number: '', position: '', name, slot: 'coach' });
      continue;
    }

    const tokens = l.split(/\s+/);
    let number = '';
    if (/^\d{1,3}$/.test(tokens[0])) number = tokens.shift();
    let position = '';
    if (tokens[0] && POS[tokens[0].toUpperCase()]) position = tokens.shift().toUpperCase();
    const name = tokens.join(' ').trim() || l;

    let slot;
    if (hasSeparator) slot = inBench ? 'bench' : 'starter';
    else slot = playerCount < STARTERS_DEFAULT ? 'starter' : 'bench';
    playerCount++;

    result.push({ number, position, name, slot });
  }
  return result;
}

export const TEAM_COLORS = ['#3b7bff', '#ff4d52', '#ffb02e', '#34d399', '#a855f7', '#ffffff', '#f43f5e', '#0ea5e9'];
