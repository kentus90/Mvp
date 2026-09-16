import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || 'Errore'); return; }
    setMsg('Password aggiornata ✓');
    setTimeout(() => router.push('/admin'), 1000);
  }

  return (
    <div className="app">
      <div className="hdr"><div className="hdr-top"><div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/admin" className="brand-name">← Gestione</Link></div></div></div>
      <div className="content pad">
        <div className="section-head"><h2>Cambia password</h2></div>
        {err && <div className="banner warn">{err}</div>}
        {msg && <div className="banner">{msg}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Password attuale</label>
            <input type="password" className="input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="field">
            <label>Nuova password (minimo 8 caratteri)</label>
            <input type="password" className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button className="btn">Salva</button>
        </form>
      </div>
    </div>
  );
}
