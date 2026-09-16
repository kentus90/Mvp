const POS = { POR: true, DIF: true, CEN: true, ATT: true };

export function rosterToText(players) {
  return (players || []).map(p => `${p.number || ''} ${p.position || ''} ${p.name}`.replace(/\s+/g, ' ').trim()).join('\n');
}

export function parseRoster(text) {
  return (text || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      let tokens = l.split(/\s+/);
      let number = '';
      if (/^\d{1,3}$/.test(tokens[0])) number = tokens.shift();
      let position = '';
      if (tokens[0] && POS[tokens[0].toUpperCase()]) position = tokens.shift().toUpperCase();
      const name = tokens.join(' ').trim() || l;
      return { number, position, name };
    });
}

export const TEAM_COLORS = ['#3b7bff', '#ff4d52', '#ffb02e', '#34d399', '#a855f7', '#ffffff', '#f43f5e', '#0ea5e9'];
