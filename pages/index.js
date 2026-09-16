import Link from 'next/link';
import { useEffect, useState } from 'react';
import MatchView from '../components/MatchView';

export default function Home() {
  const [state, setState] = useState({ loading: true, match: null, players: [], tally: null });

  async function load() {
    const activeRes = await fetch('/api/matches?active=1');
    const activeData = await activeRes.json();
    if (!activeData.match) {
      setState({ loading: false, match: null, players: [], tally: null });
      return;
    }
    const detailRes = await fetch(`/api/matches/${activeData.match.id}`);
    const detail = await detailRes.json();
    setState({ loading: false, match: detail.match, players: detail.players, tally: detail.tally });
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><span className="brand-name">Voto MVP</span></div>
          <Link href="/admin" className="icon-btn" title="Gestione">&#x2699;</Link>
        </div>
      </div>
      <div className="content">
        {state.loading ? null : state.match ? (
          <MatchView
            match={state.match}
            players={state.players}
            tally={state.tally}
            allowVoting={state.match.voting_open}
            onVoteCast={load}
          />
        ) : (
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
