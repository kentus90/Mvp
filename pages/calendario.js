import Link from 'next/link';
import { useEffect, useState } from 'react';

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase();
}

export default function Calendario() {
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch('/api/matches').then(r => r.json()).then(d => setMatches(d.matches || []));
  }, []);

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/" className="brand-name">&#x2190; Voto MVP</Link></div>
        </div>
      </div>
      <div className="content pad">
        <div className="section-head"><h2>Tutte le partite</h2><span className="count">{matches ? matches.length : ''} partite</span></div>
        {matches === null ? null : matches.length === 0 ? (
          <div className="empty">
            <div className="big">&#x1F4C5;</div>
            <h2>Nessuna partita</h2>
            <p>Non &#xE8; stata ancora caricata nessuna partita.</p>
          </div>
        ) : (
          <div className="calendar-list">
            {matches.map(m => (
              <Link key={m.id} href={`/partita/${m.id}`} className={`calendar-item ${m.is_active ? 'is-live' : ''}`}>
                <div className="calendar-date">{formatDate(m.match_date)}</div>
                <div className="calendar-meta">
                  <div className="calendar-teams">{m.team_a_name} &#x2013; {m.team_b_name}</div>
                  <div className="calendar-sub">{m.match_label || (m.is_active ? 'Partita in vetrina' : (m.voting_open ? 'Votazioni aperte' : 'Votazioni chiuse'))}</div>
                </div>
                <div className="calendar-score">{m.score_a ?? 0}&#x2013;{m.score_b ?? 0}</div>
                <span className="calendar-go">&#x203A;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
