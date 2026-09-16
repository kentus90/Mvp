import { useRef, useState } from 'react';

// Ridimensiona l'immagine scelta a max 160px e la converte in una piccola
// stringa PNG, così sta comodamente nel database senza serve un archivio file.
async function fileToSmallDataUrl(file, max = 160) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('Lettura non riuscita'));
    r.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('Immagine non valida'));
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/png');
}

export default function LogoPicker({ label, value, onChange, ourLogoLabel = 'Usa il nostro logo' }) {
  const inputRef = useRef(null);
  const [err, setErr] = useState('');

  async function pick(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setErr('');
    try {
      const small = await fileToSmallDataUrl(file);
      onChange(small);
    } catch (ex) {
      setErr('Non sono riuscito a leggere questa immagine');
    }
    e.target.value = '';
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="logo-picker">
        {value ? <img className="logo-preview" src={value} alt="" /> : <div className="logo-preview empty">—</div>}
        <div className="logo-actions">
          <button type="button" className="btn ghost sm" onClick={() => inputRef.current.click()}>Scegli immagine</button>
          <button type="button" className="btn ghost sm" onClick={() => onChange('/logo.png')}>{ourLogoLabel}</button>
          {value && <button type="button" className="btn ghost sm" onClick={() => onChange('')}>Rimuovi</button>}
        </div>
      </div>
      {err && <div className="hint" style={{ color: '#ff8a8d' }}>{err}</div>}
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
    </div>
  );
}
