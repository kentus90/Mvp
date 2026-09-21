import { useEffect, useState } from 'react';
import { getDeviceId } from '../lib/deviceId';

const POS_COLOR = { POR:'#ffb02e', DIF:'#3b7bff', CEN:'#34d399', ATT:'#ff6b4d' };
const POS_ORDER = { POR:0, DIF:1, CEN:2, ATT:3 };

function ordered(players) {
  return [...players].sort((a, b) => (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9));
}
function esc(s) { return s == null ? '' : String(s); }

function TeamLogo({ src, align }) {
  if (!src) return null;
  return <img className="team-logo" src={src} alt="" style={align === 'right' ? { marginLeft: 'auto' } : null} />;
}

function lines(text) {
  return String(text || '').split('\n').map(l => l.trim()).filter(Boolean);
}

function Scorers({ a, b }) {
  const la = lines(a);
  const lb = lines(b);
  if (!la.length && !lb.length) return null;
  return (
    <div className="scorers">
      <div className="scorers-col">
        {la.map((l, i) => <div className="scorer" key={i}><span className="scorer-ball">&#x26BD;</span>{l}</div>)}
      </div>
      <div className="scorers-col right">
        {lb.map((l, i) => <div className="scorer" key={i}>{l}<span className="scorer-ball">&#x26BD;</span></div>)}
      </div>
    </div>
  );
}

export default function MatchView({ match, players, tally, allowVoting, onVoteCast }) {
  const [tab, setTab] = useState('formazioni');
  const [chosenId, setChosenId] = useState(null);
  const [toast, setToast] = useState('');

  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  useEffect(() => {
    if (!allowVoting) return;
    const deviceId = getDeviceId();
    fetch(`/api/matches/${match.id}/vote?device_id=${deviceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.playerId) setChosenId(d.playerId); })
      .catch(() => {});
  }, [match.id, allowVoting]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 1700);
  }

  async function castVote(playerId) {
    const deviceId = getDeviceId();
    const res = await fetch(`/api/matches/${match.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, playerId }),
    });
    if (!res.ok) { showToast('Voto non salvato, riprova'); return; }
    setChosenId(playerId);
    showToast('Voto registrato \u2713');
    if (onVoteCast) onVoteCast();
  }

  const totalVotes = tally ? tally.total : 0;
  const ranked = tally ? tally.ranked : [];
  const leadVotes = ranked.length ? ranked[0].votes : 0;
  const maxVotes = Math.max(1, ...ranked.map(p => p.votes));
  const pct = v => totalVotes ? Math.round((v / totalVotes) * 100) : 0;

  const logoA = match.team_a_logo || null;
  const logoB = match.team_b_logo || null;

  return (
    <div className="pad" style={{ maxWidth: 'none', width: '100%' }}>
      <div className="scoreboard" style={{ marginBottom: 6 }}>
        <div className="team-block">
          <TeamLogo src={logoA} />
          <span className="team-tag"><span className="team-swatch" style={{ background: match.team_a_color }} /> Casa</span>
          <span className="team-name">{esc(match.team_a_name)}</span>
        </div>
        <div className="score-center">
          <span className="sc-num">{match.score_a ?? 0}</span>
          <span className="sc-sep">&#x2013;</span>
          <span className="sc-num">{match.score_b ?? 0}</span>
        </div>
        <div className="team-block right">
          <TeamLogo src={logoB} align="right" />
          <span className="team-tag">Ospiti <span className="team-swatch" style={{ background: match.team_b_color }} /></span>
          <span className="team-name">{esc(match.team_b_name)}</span>
        </div>
      </div>
      <Scorers a={match.scorers_a} b={match.scorers_b} />
      {match.match_label && <div className="match-label">{esc(match.match_label)}</div>}

      <div className="tabs" style={{ marginTop: 18 }}>
        <button className={`tab-btn ${tab === 'formazioni' ? 'active' : ''}`} onClick={() => setTab('formazioni')}>
          <span className="ico">&#x25A6;</span>Formazioni
        </button>
        <button className={`tab-btn ${tab === 'vota' ? 'active' : ''}`} onClick={() => setTab('vota')}>
          <span className="ico">&#x2605;</span>Vota MVP
        </button>
        <button className={`tab-btn ${tab === 'risultati' ? 'active' : ''}`} onClick={() => setTab('risultati')}>
          <span className="ico">&#x25A3;</span>Risultati
        </button>
      </div>

      {tab === 'formazioni' && (
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', width: '100%' }}>
          <section className="lineup-list-wrap">
            <div className="team-strip">
              {logoA && <img className="strip-logo" src={logoA} alt="" />}
              <span className="bar" style={{ background: match.team_a_color }} />
              <h3>{esc(match.team_a_name)}</h3>
            </div>
            <div className="lineup-list">
              {ordered(teamA).length ? ordered(teamA).map(p => (
                <div className="lineup-row" key={p.id}><span className="lineup-num">{p.number || '\u2013'}</span><span>{p.name}</span></div>
              )) : <div className="lineup-list-empty">Nessun giocatore inserito.</div>}
            </div>
          </section>
          <section className="lineup-list-wrap">
            <div className="team-strip">
              {logoB && <img className="strip-logo" src={logoB} alt="" />}
              <span className="bar" style={{ background: match.team_b_color }} />
              <h3>{esc(match.team_b_name)}</h3>
            </div>
            <div className="lineup-list">
              {ordered(teamB).length ? ordered(teamB).map(p => (
                <div className="lineup-row" key={p.id}><span className="lineup-num">{p.number || '\u2013'}</span><span>{p.name}</span></div>
              )) : <div className="lineup-list-empty">Nessun giocatore inserito.</div>}
            </div>
          </section>
        </div>
      )}

      {tab === 'vota' && (
        <div>
          {!match.voting_open ? (
            <div className="banner warn">Le votazioni sono chiuse. Controlla i risultati.</div>
          ) : (
            <>
              <div className="banner">&#x2605; Scegli il migliore in campo. Puoi cambiare voto finch&#xE9; &#xE8; aperto.</div>
              {[['A', teamA, match.team_a_color, match.team_a_name, logoA], ['B', teamB, match.team_b_color, match.team_b_name, logoB]].map(([key, list, color, name, logo]) => (
                <div key={key}>
                  <div className="team-strip">
                    {logo && <img className="strip-logo" src={logo} alt="" />}
                    <span className="bar" style={{ background: color }} />
                    <h3>{esc(name)}</h3>
                  </div>
                  <div className="grid">
                    {ordered(list).length ? ordered(list).map(p => (
                      <div
                        key={p.id}
                        className={`card vote ${chosenId === p.id ? 'chosen' : ''}`}
                        onClick={() => allowVoting && castVote(p.id)}
                      >
                        <span className="collar" style={{ background: color }} />
                        {p.position && <span className="pos-chip" style={{ background: POS_COLOR[p.position] || '#9aa' }}>{p.position}</span>}
                        <span className="num">{p.number || '\u2013'}</span>
                        <span className="pname">{p.name}</span>
                      </div>
                    )) : <div style={{ gridColumn: '1/-1', color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>Nessun giocatore inserito.</div>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'risultati' && (
        <div>
          <div className="totals">
            <div className="stat"><div className="k">Voti totali</div><div className="v">{totalVotes}</div></div>
            <div className="stat"><div className="k">In testa</div><div className="v volt">{leadVotes > 0 ? ranked[0].name.split(' ')[0] : '\u2014'}</div></div>
          </div>
          {match.voting_open ? (
            <div className="banner">Votazioni aperte &#xB7; si aggiorna ad ogni apertura pagina</div>
          ) : (
            <div className="banner warn">Votazioni chiuse &#xB7; risultato finale</div>
          )}
          <div className="lboard">
            {ranked.length ? ranked.map((p, i) => {
              const lead = p.votes > 0 && p.votes === leadVotes;
              return (
                <div className={`row ${lead ? 'lead' : ''}`} key={p.id}>
                  {lead && <span className="crown">&#x1F451;</span>}
                  <span className="fill" style={{ width: `${totalVotes ? (p.votes / maxVotes * 100) : 0}%` }} />
                  <span className="rk">{i + 1}</span>
                  <span className="rnum" style={{ color: p.color }}>{p.number || '\u2013'}</span>
                  <span className="rmeta">
                    <div className="rname">{p.name}</div>
                    <div className="rteam"><span className="dot" style={{ background: p.color }} />{p.teamName}{p.position ? ` \u00b7 ${p.position}` : ''}</div>
                  </span>
                  <span className="rvotes"><div className="vn">{p.votes}</div><div className="vp">{pct(p.votes)}%</div></span>
                </div>
              );
            }) : <div style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>Nessun voto ancora.</div>}
          </div>
        </div>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
