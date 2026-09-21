import Link from 'next/link';
import { useEffect, useState } from 'react';
import MatchView from '../components/MatchView';

export default function Home() {
  const [state, setState] = useState({ loading: true, match: null, players: [], tally: null, error: false });

  async function load() {
    try {
      const activeRes = await fetch('/api/matches?active=1');
      if (!activeRes.ok) throw new Error('active');
      const activeData = await activeRes.json();
      if (!activeData.match) {
        setState({ loading: false, match: null, players: [], tally: null, error: false });
        return;
      }
      const detailRes = await fetch(`/api/matches/${activeData.match.id}`);
      if (!detailRes.ok) throw new Error('detail');
      const detail = await detailRes.json();
      setState({ loading: false, match: detail.match, players: detail.players, tally: detail.tally, error: false });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: true }));
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><span className="brand-name">Voto MVP</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/calendario" className="view-btn" title="Tutte le partite">&#x1F4C5; Partite</Link>
            <Link href="/admin" className="icon-btn" title="Gestione">&#x2699;</Link>
          </div>
        </div>
      </div>
      <div className="content">
        {state.loading && <div className="empty"><p>Caricamento&#x2026;</p></div>}
        {!state.loading && state.error && (
          <div className="empty">
            <div className="big">&#x26A0;&#xFE0F;</div>
            <h2>Dati non disponibili</h2>
            <p>Non riesco a raggiungere il server in questo momento. Riprova tra qualche secondo.</p>
            <button className="btn" style={{ maxWidth: 260, margin: '0 auto' }} onClick={() => { setState(s => ({ ...s, loading: true, error: false })); load(); }}>Riprova</button>
          </div>
        )}
        {state.loading || state.error ? null : state.match ? (
          <MatchView
            match={state.match}
            players={state.players}
            tally={state.tally}
            allowVoting={state.match.voting_open}
            onVoteCast={load}
          />
        ) : null}
        {!state.loading && !state.error && state.match && (
          <div className="pad" style={{ paddingTop: 0 }}>
            <Link href="/calendario" className="btn ghost" style={{ width: '100%' }}>&#x1F4C5; Partite precedenti</Link>
          </div>
        )}
        {state.loading || state.error || state.match ? null : (
          <div className="empty">
            <div className="big">&#x26BD;</div>
            <h2>Nessuna partita in vetrina</h2>
            <p>Al momento non c'&#xE8; una partita attiva. Puoi consultare lo storico nel calendario.</p>
            <Link href="/calendario" className="btn" style={{ maxWidth: 260, margin: '0 auto', display: 'flex' }}>Vai al calendario</Link>
          </div>
        )}
      </div>
    </div>
  );
}
