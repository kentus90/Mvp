import { useState } from 'react';
import { useRouter } from 'next/router';
import { rosterToText, parseRoster, TEAM_COLORS } from '../lib/roster';
import LogoPicker from './LogoPicker';

const empty = {
  match_date: new Date().toISOString().slice(0, 10),
  match_label: '',
  team_a_name: 'Casa',
  team_a_color: TEAM_COLORS[0],
  team_a_logo: '/logo.png',
  team_b_name: 'Ospiti',
  team_b_color: TEAM_COLORS[1],
  team_b_logo: '',
  score_a: 0,
  score_b: 0,
  voting_open: true,
  is_active: false,
};

export default function MatchEditor({ mode, matchId, initialMatch, initialPlayersA, initialPlayersB }) {
  const router = useRouter();
  const m = initialMatch || empty;
  const [form, setForm] = useState({ ...empty, ...m });
  const [textA, setTextA] = useState(rosterToText(initialPlayersA || []));
  const [textB, setTextB] = useState(rosterToText(initialPlayersB || []));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErr(''); setMsg('');
    const payload = {
      ...form,
      score_a: Number(form.score_a) || 0,
      score_b: Number(form.score_b) || 0,
      playersA: parseRoster(textA),
      playersB: parseRoster(textB),
    };
    const url = mode === 'new' ? '/api/admin/matches' : `/api/admin/matches/${matchId}`;
    const method = mode === 'new' ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || 'Errore di salvataggio'); return; }
    if (mode === 'new') { router.push(`/admin/${data.match.id}`); return; }
    setMsg('Salvato \u2713');
  }

  async function remove() {
    if (!confirm('Eliminare definitivamente questa partita, con rose e voti?')) return;
    const res = await fetch(`/api/admin/matches/${matchId}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin');
  }

  async function resetVotes() {
    if (!confirm('Azzerare tutti i voti di questa partita?')) return;
    const res = await fetch(`/api/admin/matches/${matchId}/reset-votes`, { method: 'POST' });
    if (res.ok) setMsg('Voti azzerati \u2713');
  }

  const swatchRow = (selected, onPick) => (
    <div className="swatches">
      {TEAM_COLORS.map(c => (
        <button key={c} type="button" className={`sw ${c === selected ? 'on' : ''}`} style={{ background: c }} onClick={() => onPick(c)} />
      ))}
    </div>
  );

  return (
    <form onSubmit={save}>
      {err && <div className="banner warn">{err}</div>}
      {msg && <div className="banner">{msg}</div>}

      <div className="field">
        <label>Data partita</label>
        <input type="date" className="input" value={form.match_date} onChange={e => set('match_date', e.target.value)} />
      </div>
      <div className="field">
        <label>Titolo partita (facoltativo)</label>
        <input className="input" placeholder="Es. Campionato &#xB7; 12&#xAA; giornata" value={form.match_label || ''} onChange={e => set('match_label', e.target.value)} />
      </div>

      <div className="field">
        <label>Punteggio</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="number" min="0" className="input" value={form.score_a} onChange={e => set('score_a', e.target.value)} />
          <input type="number" min="0" className="input" value={form.score_b} onChange={e => set('score_b', e.target.value)} />
        </div>
      </div>

      <div className="divider" />
      <div className="field"><label>Squadra di casa &#x2014; nome</label>
        <input className="input" maxLength={22} value={form.team_a_name} onChange={e => set('team_a_name', e.target.value)} /></div>
      {swatchRow(form.team_a_color, c => set('team_a_color', c))}
      <div style={{ marginTop: 14 }}>
        <LogoPicker label="Stemma squadra di casa" value={form.team_a_logo} onChange={v => set('team_a_logo', v)} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label>Giocatori casa &#x2014; una riga per giocatore</label>
        <textarea className="input" placeholder={"1 POR Verdi\n7 DIF Rossi\n10 CEN Bianchi\n9 ATT Esposito"} value={textA} onChange={e => setTextA(e.target.value)} />
      </div>
      <div className="hint">Formato: &#xAB;numero ruolo nome&#xBB;. Ruolo facoltativo tra POR &#xB7; DIF &#xB7; CEN &#xB7; ATT.</div>

      <div className="divider" />
      <div className="field"><label>Squadra ospite &#x2014; nome</label>
        <input className="input" maxLength={22} value={form.team_b_name} onChange={e => set('team_b_name', e.target.value)} /></div>
      {swatchRow(form.team_b_color, c => set('team_b_color', c))}
      <div style={{ marginTop: 14 }}>
        <LogoPicker label="Stemma squadra ospite" value={form.team_b_logo} onChange={v => set('team_b_logo', v)} />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label>Giocatori ospiti &#x2014; una riga per giocatore</label>
        <textarea className="input" value={textB} onChange={e => setTextB(e.target.value)} />
      </div>

      <div className="divider" />
      <div className="toggle-row">
        <div><div className="tl">Votazioni aperte</div><div className="td">Spegni a fine partita per congelare il risultato</div></div>
        <div className={`tg ${form.voting_open ? 'on' : ''}`} onClick={() => set('voting_open', !form.voting_open)} />
      </div>
      <div className="toggle-row">
        <div><div className="tl">Mostra in home come partita del giorno</div><div className="td">Solo una partita alla volta pu&#xF2; essere "in vetrina"</div></div>
        <div className={`tg ${form.is_active ? 'on' : ''}`} onClick={() => set('is_active', !form.is_active)} />
      </div>

      <button className="btn" disabled={saving}>{saving ? 'Salvataggio\u2026' : 'Salva e pubblica'}</button>

      {mode === 'edit' && (
        <>
          <div style={{ height: 12 }} />
          <button type="button" className="btn ghost sm" style={{ width: '100%' }} onClick={resetVotes}>Azzera tutti i voti</button>
          <div style={{ height: 12 }} />
          <button type="button" className="btn danger sm" style={{ width: '100%' }} onClick={remove}>Elimina partita</button>
        </>
      )}
    </form>
  );
}
