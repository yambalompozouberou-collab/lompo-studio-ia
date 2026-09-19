-- ============================================================
-- LOMPO STUDIO IA
-- Migration 003 — Quotas centralisés et atomiques
-- ============================================================
-- Remplace l'ancien système credits_internal (générique, non atomique)
-- pour les services image et vidéo. Voir schema.sql pour le socle
-- (profiles, projects) sur lequel cette migration s'appuie.

begin;

-- ------------------------------------------------------------
-- 1. Configuration centralisée des quotas
-- ------------------------------------------------------------

create table if not exists public.quota_config (
  service text primary key,
  free_limit integer not null check (free_limit >= 0),
  unit text not null check (
    unit in ('generation', 'credit')
  ),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quota_config is
'Configuration centralisée des quotas gratuits de LOMPO STUDIO IA.';

comment on column public.quota_config.free_limit is
'Nombre maximum autorisé pour le compte gratuit sur une journée.';

comment on column public.quota_config.unit is
'Unité du quota : generation ou credit.';


-- ------------------------------------------------------------
-- 2. Quotas décidés pour LOMPO
-- ------------------------------------------------------------

insert into public.quota_config (
  service,
  free_limit,
  unit
)
values
  ('image', 15, 'generation'),
  ('video', 50, 'credit')
on conflict (service)
do update set
  free_limit = excluded.free_limit,
  unit = excluded.unit,
  updated_at = now();


-- ------------------------------------------------------------
-- 3. Consommation quotidienne
-- ------------------------------------------------------------

create table if not exists public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  service text not null references public.quota_config(service),
  used_amount integer not null default 0 check (used_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, usage_date, service)
);

comment on table public.daily_usage is
'Consommation quotidienne des services IA par utilisateur.';


-- ------------------------------------------------------------
-- 4. Index
-- ------------------------------------------------------------

create index if not exists daily_usage_user_date_idx
on public.daily_usage(user_id, usage_date);

create index if not exists daily_usage_service_date_idx
on public.daily_usage(service, usage_date);


-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------

alter table public.quota_config enable row level security;
alter table public.daily_usage enable row level security;


-- quota_config :
-- le client ne doit pas pouvoir modifier les quotas.
-- On autorisera uniquement la lecture des configurations actives.

drop policy if exists "Authenticated users can read active quota config"
on public.quota_config;

create policy "Authenticated users can read active quota config"
on public.quota_config
for select
to authenticated
using (active = true);


-- daily_usage :
-- l'utilisateur peut consulter uniquement sa consommation.
-- Il NE peut PAS l'insérer/modifier directement.

drop policy if exists "Users can read their own daily usage"
on public.daily_usage;

create policy "Users can read their own daily usage"
on public.daily_usage
for select
to authenticated
using ((select auth.uid()) = user_id);


-- ------------------------------------------------------------
-- 6. Permissions
-- ------------------------------------------------------------

revoke all on table public.quota_config
from anon, authenticated;

grant select on table public.quota_config
to authenticated;


revoke all on table public.daily_usage
from anon, authenticated;

grant select on table public.daily_usage
to authenticated;


-- ------------------------------------------------------------
-- 7. Fonction atomique
-- ------------------------------------------------------------

create or replace function public.consume_quota(
  p_service text,
  p_amount integer default 1
)
returns table (
  allowed boolean,
  service text,
  usage_date date,
  used_amount integer,
  quota_limit integer,
  remaining integer,
  reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_limit integer;
  v_date date := current_date;
  v_used integer;
begin

  -- ----------------------------------------------------------
  -- Auth obligatoire
  -- ----------------------------------------------------------

  v_user_id := auth.uid();

  if v_user_id is null then
    return query
    select
      false,
      p_service,
      v_date,
      0,
      0,
      0,
      'unauthenticated';

    return;
  end if;


  -- ----------------------------------------------------------
  -- Validation de la quantité
  -- ----------------------------------------------------------

  if p_amount is null or p_amount <= 0 then
    return query
    select
      false,
      p_service,
      v_date,
      0,
      0,
      0,
      'invalid_amount';

    return;
  end if;


  -- ----------------------------------------------------------
  -- Récupération de la configuration
  -- ----------------------------------------------------------

  select qc.free_limit
  into v_limit
  from public.quota_config qc
  where qc.service = p_service
    and qc.active = true;


  if v_limit is null then
    return query
    select
      false,
      p_service,
      v_date,
      0,
      0,
      0,
      'unknown_service';

    return;
  end if;


  -- ----------------------------------------------------------
  -- Vérification impossible même à vide
  -- ----------------------------------------------------------

  if p_amount > v_limit then
    return query
    select
      false,
      p_service,
      v_date,
      0,
      v_limit,
      v_limit,
      'amount_exceeds_daily_limit';

    return;
  end if;


  -- ----------------------------------------------------------
  -- Création de la ligne quotidienne si nécessaire.
  --
  -- ON CONFLICT DO NOTHING est volontaire :
  -- la vraie consommation est effectuée par UPDATE
  -- immédiatement après.
  -- ----------------------------------------------------------

  insert into public.daily_usage (
    user_id,
    usage_date,
    service,
    used_amount
  )
  values (
    v_user_id,
    v_date,
    p_service,
    0
  )
  on conflict (user_id, usage_date, service)
  do nothing;


  -- ----------------------------------------------------------
  -- OPÉRATION ATOMIQUE
  --
  -- Le UPDATE verrouille la ligne concernée.
  --
  -- Deux requêtes simultanées ne peuvent donc pas toutes les
  -- deux valider la même quantité disponible.
  -- ----------------------------------------------------------

  update public.daily_usage du
  set
    used_amount = du.used_amount + p_amount,
    updated_at = now()
  where du.user_id = v_user_id
    and du.usage_date = v_date
    and du.service = p_service
    and du.used_amount + p_amount <= v_limit
  returning du.used_amount
  into v_used;


  -- ----------------------------------------------------------
  -- Quota refusé
  -- ----------------------------------------------------------

  if not found then

    select du.used_amount
    into v_used
    from public.daily_usage du
    where du.user_id = v_user_id
      and du.usage_date = v_date
      and du.service = p_service;

    return query
    select
      false,
      p_service,
      v_date,
      coalesce(v_used, 0),
      v_limit,
      greatest(v_limit - coalesce(v_used, 0), 0),
      'quota_exceeded';

    return;
  end if;


  -- ----------------------------------------------------------
  -- Quota accepté
  -- ----------------------------------------------------------

  return query
  select
    true,
    p_service,
    v_date,
    v_used,
    v_limit,
    v_limit - v_used,
    'ok';

end;
$$;


-- ------------------------------------------------------------
-- 8. Ne pas exposer la fonction aux utilisateurs non connectés
-- ------------------------------------------------------------

revoke execute on function public.consume_quota(text, integer)
from public;

revoke execute on function public.consume_quota(text, integer)
from anon;

grant execute on function public.consume_quota(text, integer)
to authenticated;


-- ------------------------------------------------------------
-- 9. Lecture des quotas par le frontend (ajout LOMPO)
--
-- Le frontend a besoin d'afficher "crédits disponibles / consommés /
-- prochaine réinitialisation" (cahier des charges, section Crédits).
-- Plutôt que de faire 2 requêtes (quota_config + daily_usage) et de
-- gérer le cas "aucune ligne encore aujourd'hui" côté client, cette
-- fonction fait le LEFT JOIN nécessaire et retourne un résultat complet
-- même pour un service jamais encore utilisé aujourd'hui.
--
-- Pas de security definer ici : la fonction s'exécute avec les droits de
-- l'appelant (authenticated), donc les policies RLS existantes sur
-- daily_usage (lecture de ses propres lignes uniquement) et sur
-- quota_config (lecture des configs actives) s'appliquent normalement.
-- ------------------------------------------------------------

create or replace function public.get_my_quotas()
returns table (
  service text,
  unit text,
  quota_limit integer,
  used_amount integer,
  remaining integer,
  usage_date date,
  resets_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    qc.service,
    qc.unit,
    qc.free_limit as quota_limit,
    coalesce(du.used_amount, 0) as used_amount,
    greatest(qc.free_limit - coalesce(du.used_amount, 0), 0) as remaining,
    current_date as usage_date,
    -- Reset à minuit UTC (voir note dans le rapport : pas minuit local).
    date_trunc('day', now() at time zone 'utc') + interval '1 day' as resets_at
  from public.quota_config qc
  left join public.daily_usage du
    on du.service = qc.service
   and du.user_id = (select auth.uid())
   and du.usage_date = current_date
  where qc.active = true;
$$;

revoke execute on function public.get_my_quotas()
from public;

revoke execute on function public.get_my_quotas()
from anon;

grant execute on function public.get_my_quotas()
to authenticated;


-- ------------------------------------------------------------
-- 10. Remboursement (ajout LOMPO)
--
-- consume_quota() doit être appelée AVANT d'appeler un fournisseur IA
-- (on ne veut jamais payer/appeler une API externe si le quota est déjà
-- dépassé). Mais si l'appel au fournisseur échoue ensuite (panne, erreur,
-- fonction pas encore déployée), l'utilisateur ne doit pas perdre une
-- unité de quota pour une génération qui n'a produit aucun résultat.
-- Cette fonction est le symétrique de consume_quota : elle retire un
-- montant précédemment consommé, sans jamais descendre sous zéro.
-- ------------------------------------------------------------

create or replace function public.refund_quota(
  p_service text,
  p_amount integer default 1
)
returns table (
  service text,
  usage_date date,
  used_amount integer,
  quota_limit integer,
  remaining integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_limit integer;
  v_date date := current_date;
  v_used integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null or p_amount is null or p_amount <= 0 then
    return;
  end if;

  select qc.free_limit into v_limit
  from public.quota_config qc
  where qc.service = p_service and qc.active = true;

  if v_limit is null then
    return;
  end if;

  update public.daily_usage du
  set
    used_amount = greatest(du.used_amount - p_amount, 0),
    updated_at = now()
  where du.user_id = v_user_id
    and du.usage_date = v_date
    and du.service = p_service
  returning du.used_amount
  into v_used;

  if not found then
    return;
  end if;

  return query
  select p_service, v_date, v_used, v_limit, v_limit - v_used;
end;
$$;

revoke execute on function public.refund_quota(text, integer)
from public;

revoke execute on function public.refund_quota(text, integer)
from anon;

grant execute on function public.refund_quota(text, integer)
to authenticated;


commit;
