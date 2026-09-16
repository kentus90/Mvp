import Link from 'next/link';
import MatchEditor from '../../components/MatchEditor';

export default function NewMatch() {
  return (
    <div className="app">
      <div className="hdr"><div className="hdr-top"><div className="brand"><img className="brand-logo" src="/logo.png" alt="" /><Link href="/admin" className="brand-name">← Gestione</Link></div></div></div>
      <div className="content pad">
        <div className="section-head"><h2>Nuova partita</h2></div>
        <MatchEditor mode="new" />
      </div>
    </div>
  );
}
