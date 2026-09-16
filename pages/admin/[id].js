import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MatchEditor from '../../components/MatchEditor';

export default function EditMatch() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/matches/${id}`).then(async r => {
      if (!r.ok) { setNotFound(true); return; }
      setData(await r.json());
    });
  }, [id]);

  return (
    <div className="app">
      <div className="hdr"><div className="hdr-top"><div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/admin" className="brand-name">← Gestione</Link></div></div></div>
      <div className="content pad">
        <div className="section-head"><h2>Modifica partita</h2></div>
        {notFound && <div className="banner warn">Partita non trovata.</div>}
        {data && (
          <MatchEditor
            mode="edit"
            matchId={id}
            initialMatch={data.match}
            initialPlayersA={data.players.filter(p => p.team === 'A')}
            initialPlayersB={data.players.filter(p => p.team === 'B')}
          />
        )}
      </div>
    </div>
  );
}
