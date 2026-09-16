// Identificativo anonimo del dispositivo/spettatore, salvato in localStorage.
// Serve solo per far rispettare "un voto per dispositivo" e per permettere
// di cambiare il proprio voto. Non è un sistema di login.
const KEY = 'mvp-matchday:device_id';

export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'd-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

const NAME_KEY = 'mvp-matchday:voter_name';
export function getVoterName() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NAME_KEY) || '';
}
export function setVoterName(name) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(NAME_KEY, name);
}
