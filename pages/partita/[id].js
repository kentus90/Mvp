import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MatchView from '../../components/MatchView';

export default function PartitaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState({ loading: true, match: null, players: [], tally: null, notFound: false });

  async function load() {
    if (!id) return;
    const res = await fetch(`/api/matches/${id}`);
    if (!res.ok) { setState(s => ({ ...s, loading: false, notFound: true })); return; }
    const data = await res.json();
    setState({ loading: false, match: data.match, players: data.players, tally: data.tally, notFound: false });
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/calendario" className="brand-name">&#x2190; Calendario</Link></div>
        </div>
      </div>
      <div className="content">
        {state.loading ? null : state.notFound ? (
          <div className="empty pad"><div className="big">&#x2753;</div><h2>Partita non trovata</h2></div>
        ) : (
          <MatchView
            match={state.match}
            players={state.players}
            tally={state.tally}
            allowVoting={state.match.voting_open}
            onVoteCast={load}
          />
        )}
      </div>
    </div>
  );
}
