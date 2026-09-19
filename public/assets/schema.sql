-- ============================================================
-- LOMPO STUDIO IA — Schéma Supabase, Phase 1 (socle initial)
-- À exécuter dans : Dashboard Supabase > SQL Editor
--
-- Évolutions ultérieures : voir supabase/migrations/ (ex. 003_atomic_quotas.sql
-- qui ajoute le moteur de quotas image/vidéo et remplace credits_internal
-- pour ces deux services). Exécuter ce fichier D'ABORD, puis les migrations
-- dans l'ordre numérique.
-- ============================================================

-- Table des profils utilisateurs, liée à auth.users (Supabase Auth).
-- C'est ICI que vit le statut Pro/admin, jamais dans le code frontend.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'gratuit' check (plan in ('gratuit', 'pro')),
  role text not null default 'utilisateur' check (role in ('utilisateur', 'admin')),
  credits_internal integer not null default 20,
  credits_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  admin_emails text[] := array[
    'yambalompozouberou@gmail.com',
    'yambazouberoulompo@gmail.com',
    'norosiban301@gmail.com',
    'cesardigitalservice@gmail.com'
  ];
begin
  insert into public.profiles (id, email, plan, role)
  values (
    new.id,
    new.email,
    case when new.email = any(admin_emails) then 'pro' else 'gratuit' end,
    case when new.email = any(admin_emails) then 'admin' else 'utilisateur' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Table des projets.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null check (type in ('video', 'image', 'site', 'app', 'audio')),
  status text not null default 'en_cours',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS) — chacun ne voit/modifie que ses données,
-- sauf les admins qui peuvent tout lire.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;

create policy "Un utilisateur lit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Les admins lisent tous les profils"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Un utilisateur lit ses propres projets"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Un utilisateur crée ses propres projets"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- NOTE (mise à jour après migration 003_atomic_quotas.sql) :
-- `credits_internal` n'est plus utilisé pour les services image/vidéo,
-- remplacé par le moteur de quotas atomique (quota_config + daily_usage +
-- fonction consume_quota). La colonne reste en base (aucune donnée
-- supprimée) mais n'est plus lue ni décrémentée par le frontend. Elle
-- pourra servir à un futur service non couvert par le nouveau système, ou
-- être retirée dans une migration dédiée si elle reste définitivement
-- inutilisée. Aucune policy UPDATE dessus pour "authenticated" : c'est
-- voulu, pas un oubli — même logique de sécurité que le nouveau système.
