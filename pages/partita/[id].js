import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MatchView from '../../components/MatchView';

function shortDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase();
}

// Pulsanti per passare alla partita precedente (piu' vecchia) o successiva
// (piu' recente). L'elenco arriva gia' ordinato dalla piu' recente.
function MatchNav({ list, currentId }) {
  const i = list.findIndex(m => m.id === currentId);
  if (i === -1 || list.length < 2) return null;
  const older = list[i + 1];
  const newer = list[i - 1];
  const label = m => `${m.team_a_name} \u2013 ${m.team_b_name}`;
  return (
    <div className="match-nav">
      {older ? (
        <Link href={`/partita/${older.id}`} className="mn-btn">
          <span className="mn-arrow">&#x2039;</span>
          <span className="mn-txt">
            <span className="mn-lbl">Precedente &#xB7; {shortDate(older.match_date)}</span>
            <span className="mn-teams">{label(older)}</span>
          </span>
        </Link>
      ) : <span className="mn-btn disabled"><span className="mn-txt"><span className="mn-lbl">Prima partita</span></span></span>}
      {newer ? (
        <Link href={`/partita/${newer.id}`} className="mn-btn right">
          <span className="mn-txt">
            <span className="mn-lbl">Successiva &#xB7; {shortDate(newer.match_date)}</span>
            <span className="mn-teams">{label(newer)}</span>
          </span>
          <span className="mn-arrow">&#x203A;</span>
        </Link>
      ) : <span className="mn-btn right disabled"><span className="mn-txt"><span className="mn-lbl">Ultima partita</span></span></span>}
    </div>
  );
}

export default function PartitaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({ loading: true, match: null, players: [], tally: null, notFound: false, error: false });
  const [list, setList] = useState([]);

  async function load() {
    if (!id) return;
    try {
      const res = await fetch(`/api/matches/${id}`);
      if (res.status === 404) { setState(s => ({ ...s, loading: false, notFound: true })); return; }
      if (!res.ok) throw new Error('detail');
      const data = await res.json();
      setState({ loading: false, match: data.match, players: data.players, tally: data.tally, notFound: false, error: false });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: true }));
    }
  }

  useEffect(() => {
    setState(s => ({ ...s, loading: true, notFound: false, error: false }));
    load();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    fetch('/api/matches').then(r => r.ok ? r.json() : null).then(d => { if (d) setList(d.matches || []); }).catch(() => {});
  }, []);

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/calendario" className="brand-name">&#x2190; Partite</Link></div>
          <Link href="/" className="view-btn" title="Partita in corso">&#x26BD; Oggi</Link>
        </div>
      </div>
      <div className="content">
        {state.loading && <div className="empty"><p>Caricamento&#x2026;</p></div>}
        {!state.loading && state.notFound && (
          <div className="empty pad"><div className="big">&#x2753;</div><h2>Partita non trovata</h2></div>
        )}
        {!state.loading && state.error && (
          <div className="empty">
            <div className="big">&#x26A0;&#xFE0F;</div>
            <h2>Dati non disponibili</h2>
            <p>Non riesco a raggiungere il server in questo momento.</p>
            <button className="btn" style={{ maxWidth: 260, margin: '0 auto' }} onClick={() => { setState(s => ({ ...s, loading: true, error: false })); load(); }}>Riprova</button>
          </div>
        )}
        {!state.loading && !state.notFound && !state.error && state.match && (
          <>
            <div className="pad" style={{ paddingBottom: 0 }}>
              <MatchNav list={list} currentId={state.match.id} />
            </div>
            <MatchView
              key={state.match.id}
              match={state.match}
              players={state.players}
              tally={state.tally}
              allowVoting={state.match.voting_open}
              onVoteCast={load}
            />
            <div className="pad" style={{ paddingTop: 0 }}>
              <MatchNav list={list} currentId={state.match.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
