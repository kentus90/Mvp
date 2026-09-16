// Client Supabase lato server, con la service role key.
// NON deve mai essere importato in codice che finisce nel bundle del browser.
import { createClient } from '@supabase/supabase-js';

let _client = null;

export function supabaseAdmin() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti nelle variabili d\'ambiente');
  }
  _client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}
