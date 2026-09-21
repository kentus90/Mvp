-- ============================================================
-- Schema Supabase per l'app Voto MVP
-- Incolla ed esegui tutto questo file in:
-- Supabase -> il tuo progetto -> SQL Editor -> New query -> Run
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  match_label text,
  team_a_name text not null,
  team_a_color text not null default '#3b7bff',
  team_a_logo text,
  team_b_name text not null,
  team_b_color text not null default '#ff4d52',
  team_b_logo text,
  score_a int not null default 0,
  score_b int not null default 0,
  scorers_a text,
  scorers_b text,
  voting_open boolean not null default true,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  team text not null check (team in ('A','B')),
  number text,
  position text,
  name text not null,
  sort_order int not null default 0,
  slot text not null default 'starter'
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (match_id, device_id)
);

-- Se le tabelle esistono gia' da una versione precedente, queste due
-- righe aggiungono le colonne degli stemmi senza toccare i dati.
alter table matches add column if not exists team_a_logo text;
alter table matches add column if not exists team_b_logo text;
alter table matches add column if not exists scorers_a text;
alter table matches add column if not exists scorers_b text;
alter table players add column if not exists slot text not null default 'starter';

-- Row Level Security: nessun accesso diretto dal browser.
-- L'app parla con Supabase solo dal server (API interne) usando la
-- service role key, che bypassa sempre l'RLS. Attivandolo qui, se in
-- futuro qualcuno usasse per errore la chiave pubblica (anon), non
-- potrebbe comunque leggere ne' scrivere nulla.
alter table admin_users enable row level security;
alter table matches enable row level security;
alter table players enable row level security;
alter table votes enable row level security;

-- ------------------------------------------------------------
-- 3 utenti admin con password PROVVISORIE, da cambiare al primo
-- accesso dalla pagina "Cambia password" dentro /admin:
--
--   admin1 / eHweGAMiRV
--   admin2 / 7QX7NiNrVD
--   admin3 / iPZT8kTDUR
--
-- Nel database non e' mai salvata la password in chiaro: i valori
-- qui sotto sono hash bcrypt.
-- ------------------------------------------------------------
insert into admin_users (username, password_hash, must_change_password) values
  ('admin1', '$2b$10$QEvFN35/6NTiprJpOfIxkukgB8V2G/2wR.FIEbrYIqOhtiDoi9KXi', true),
  ('admin2', '$2b$10$QzoFZjA95HJF03Vmjo.fUeXtZ2D6srOoh0cCfWa8o8PjoQflq9WU.', true),
  ('admin3', '$2b$10$.wNX3wKCO0NgCChgFf7Vsu7pH51r6i9JUUABs95cea2rqRrN1ThfO', true)
on conflict (username) do nothing;

-- ------------------------------------------------------------
-- UTILE: reimpostare la password di un amministratore che l'ha
-- dimenticata. Torna alla password provvisoria iniziale.
-- Cambia 'admin1' con l'utente interessato.
-- ------------------------------------------------------------
-- update admin_users
-- set password_hash = '$2b$10$QEvFN35/6NTiprJpOfIxkukgB8V2G/2wR.FIEbrYIqOhtiDoi9KXi',
--     must_change_password = true
-- where username = 'admin1';
