import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch('/api/admin/matches').then(r => r.json()).then(d => setMatches(d.matches || []));
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="app">
      <div className="hdr">
        <div className="hdr-top">
          <div className="brand"><span className="brand-name">Gestione partite</span></div>
          <button className="icon-btn" onClick={logout} title="Esci">⏻</button>
        </div>
      </div>
      <div className="content pad">
        <Link href="/admin/new" className="btn" style={{ marginBottom: 18, display: 'flex' }}>+ Nuova partita</Link>
        <Link href="/admin/change-password" style={{ display: 'block', textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginBottom: 18 }}>Cambia la tua password</Link>

        <div className="section-head"><h2>Partite</h2></div>
        {matches === null ? null : matches.length === 0 ? (
          <div className="empty"><div className="big">⚽</div><h2>Nessuna partita</h2><p>Crea la prima partita per iniziare.</p></div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Data</th><th>Partita</th><th>Stato</th><th></th></tr></thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.id}>
                  <td>{m.match_date}</td>
                  <td>{m.team_a_name} – {m.team_b_name}<br />
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>{m.score_a}–{m.score_b}</span>
                  </td>
                  <td>
                    {m.is_active && <span style={{ color: 'var(--volt)' }}>● in vetrina</span>}
                    {!m.is_active && (m.voting_open ? 'voti aperti' : 'voti chiusi')}
                  </td>
                  <td><Link href={`/admin/${m.id}`} className="btn ghost sm">Modifica</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
