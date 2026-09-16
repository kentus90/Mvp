import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data.error || 'Errore di accesso'); return; }
    router.push(data.mustChangePassword ? '/admin/change-password' : '/admin');
  }

  return (
    <div className="app">
      <div className="center-screen">
        <div className="eyebrow" style={{ marginBottom: 14 }}>Gestione partita</div>
        <h1 className="login-hero">Area<br /><span className="accent">admin</span></h1>
        <p className="login-sub">Accesso riservato a chi gestisce formazioni, punteggio e votazioni.</p>
        {err && <div className="banner warn">{err}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="u">Username</label>
            <input id="u" className="input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn" disabled={loading}>{loading ? 'Accesso\u2026' : 'Entra'}</button>
        </form>
      </div>
    </div>
  );
}
