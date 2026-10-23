-- =====================================================================
--  ÓPALO — Esquema de base de datos para Supabase
--  Ejecutar completo, una sola vez, en: Supabase > SQL Editor > New query
-- =====================================================================

create extension if not exists citext;
create extension if not exists pgcrypto;

-- Reglas del nombre de usuario (1 a 20 caracteres: a-z 0-9 ñ á é í ó ú ü $ _ . ~ ! * -,
-- sin terminar en "." ni "!", siempre en minúscula)
create or replace function public.normalize_username(p text)
returns text language sql immutable
as $$ select normalize(lower(trim(p)), NFC); $$;

create or replace function public.is_valid_username(p text)
returns boolean language sql immutable
as $$ select p ~ '^[a-z0-9ñáéíóúü$_.~!*-]{0,19}[a-z0-9ñáéíóúü$_~*-]$'; $$;

-- ---------------------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------------------
create type public.plan_type       as enum ('free', 'premium');
create type public.user_role       as enum ('user', 'admin');
create type public.account_status  as enum ('active', 'reported', 'suspended');
create type public.layout_type     as enum ('card', 'center');
create type public.bg_kind         as enum ('color', 'image', 'video');
create type public.particle_kind   as enum ('stars', 'rain', 'snow', 'petals', 'none');
create type public.name_fx         as enum ('glow', 'sparkle', 'rainbow', 'none');
create type public.payment_status  as enum ('pending', 'paid', 'refunded', 'failed');
create type public.report_status   as enum ('open', 'dismissed', 'actioned');

-- ---------------------------------------------------------------------
-- 2. Tablas
-- ---------------------------------------------------------------------

-- Perfil público de cada usuario (1 a 1 con auth.users)
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            citext not null unique
                        constraint profiles_username_check check (public.is_valid_username(username::text)),
  display_name        text check (char_length(display_name) <= 32),
  bio                 text check (char_length(bio) <= 300),
  location            text check (char_length(location) <= 40),
  avatar_url          text,
  plan                public.plan_type      not null default 'free',
  premium_since       timestamptz,
  role                public.user_role      not null default 'user',
  status              public.account_status not null default 'active',
  username_changed_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Nombres que nadie puede usar
create table public.reserved_usernames (
  username citext primary key
);

-- Nombres liberados al cambiar de usuario (quedan retenidos 14 días)
create table public.username_history (
  username     citext primary key,
  profile_id   uuid references public.profiles(id) on delete cascade,
  available_at timestamptz not null
);

-- Apariencia del perfil (lo que se edita en el panel)
create table public.profile_settings (
  profile_id     uuid primary key references public.profiles(id) on delete cascade,
  layout         public.layout_type   not null default 'card',
  card_border    boolean              not null default false,
  card_opacity   numeric(3,2)         not null default 0.55 check (card_opacity between 0 and 0.9),
  name_font      text                 not null default 'Unbounded'
                   check (name_font in ('Unbounded', 'Space Grotesk', 'Silkscreen', 'Fredoka')),
  name_effect    public.name_fx       not null default 'glow',
  accent_color   text                 not null default '#B9A7FF' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  tilt_3d        boolean              not null default true,
  bg_kind        public.bg_kind       not null default 'color',
  bg_url         text,
  bg_blur        smallint             not null default 6 check (bg_blur between 0 and 20),
  particles      public.particle_kind not null default 'stars',
  cursor_trail   boolean              not null default false,
  show_location  boolean              not null default true,
  show_badges    boolean              not null default true,
  show_online    boolean              not null default true,
  show_presence  boolean              not null default true,
  presence_text  text check (char_length(presence_text) <= 60),
  show_player    boolean              not null default true,
  music_url      text,
  music_title    text check (char_length(music_title) <= 60),
  show_branding  boolean              not null default true,
  updated_at     timestamptz          not null default now()
);

-- Redes y enlaces
create table public.social_links (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  platform    text not null check (platform in (
                'discord','instagram','tiktok','youtube','spotify','github','twitch',
                'steam','x','paypal','email','web','otro')),
  value       text not null check (char_length(value) <= 300),
  position    smallint not null default 0,
  enabled     boolean  not null default true,
  created_at  timestamptz not null default now()
);
create index social_links_profile_idx on public.social_links (profile_id, position);

-- Contadores rápidos (se actualizan solo por funciones)
create table public.profile_stats (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  views      bigint not null default 0,
  clicks     bigint not null default 0
);

-- Visitas y clics (para estadísticas por día)
create table public.profile_views (
  id           bigserial primary key,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  viewed_at    timestamptz not null default now(),
  referrer     text,
  country      text,
  visitor_hash text
);
create index profile_views_profile_idx on public.profile_views (profile_id, viewed_at desc);
create index profile_views_dedupe_idx  on public.profile_views (profile_id, visitor_hash, viewed_at desc);

create table public.link_clicks (
  id           bigserial primary key,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  link_id      uuid references public.social_links(id) on delete set null,
  clicked_at   timestamptz not null default now(),
  visitor_hash text
);
create index link_clicks_profile_idx on public.link_clicks (profile_id, clicked_at desc);

-- Insignias
create table public.badges (
  id          smallserial primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  created_at  timestamptz not null default now()
);

create table public.profile_badges (
  profile_id uuid     not null references public.profiles(id) on delete cascade,
  badge_id   smallint not null references public.badges(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id) on delete set null,
  primary key (profile_id, badge_id)
);

-- Pagos (los escribe SOLO tu backend/webhook con la service_role key)
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  provider            text not null check (provider in ('stripe','mercadopago','paypal','wompi')),
  provider_payment_id text not null,
  amount_cents        integer not null check (amount_cents >= 0),
  currency            text not null default 'USD',
  status              public.payment_status not null default 'pending',
  raw                 jsonb,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  refunded_at         timestamptz,
  unique (provider, provider_payment_id)
);
create index payments_profile_idx on public.payments (profile_id, created_at desc);

-- Reportes de perfiles
create table public.reports (
  id                  uuid primary key default gen_random_uuid(),
  reported_profile_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id         uuid references public.profiles(id) on delete set null default auth.uid(),
  reason              text not null check (reason in ('spam','ofensivo','estafa','suplantacion','otro')),
  details             text check (char_length(details) <= 500),
  status              public.report_status not null default 'open',
  created_at          timestamptz not null default now(),
  resolved_by         uuid references public.profiles(id) on delete set null,
  resolved_at         timestamptz
);
create index reports_open_idx on public.reports (reported_profile_id) where status = 'open';

-- Registro de acciones de administradores
create table public.admin_actions (
  id                bigserial primary key,
  admin_id          uuid references public.profiles(id) on delete set null,
  target_profile_id uuid references public.profiles(id) on delete set null,
  action            text not null,
  details           jsonb,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Funciones auxiliares
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- true cuando la operación NO viene de un usuario normal desde la app
-- (SQL Editor, service_role/webhook, admin, o funciones internas)
create or replace function public.is_privileged()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(auth.role(), '') not in ('authenticated', 'anon')
      or public.is_admin()
      or coalesce(current_setting('opalo.bypass', true), '') = 'on';
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_updated_at         before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger profile_settings_updated_at before update on public.profile_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. Reglas de negocio (triggers)
-- ---------------------------------------------------------------------

-- 4.1 Crear perfil automáticamente al registrarse.
--     En el registro envía el username en options.data.username
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_username text := public.normalize_username(coalesce(new.raw_user_meta_data->>'username', ''));
begin
  if not public.is_valid_username(v_username) then
    v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;

  if exists (select 1 from public.reserved_usernames where username = v_username)
     or exists (select 1 from public.username_history
                where username = v_username and available_at > now()) then
    raise exception 'username_unavailable';
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, coalesce(new.raw_user_meta_data->>'display_name', v_username));

  insert into public.profile_settings (profile_id) values (new.id);
  insert into public.profile_stats    (profile_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 Proteger campos sensibles del perfil y controlar cambios de username
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_privileged() then
    if new.id            is distinct from old.id
    or new.plan          is distinct from old.plan
    or new.premium_since is distinct from old.premium_since
    or new.role          is distinct from old.role
    or new.status        is distinct from old.status
    or new.created_at    is distinct from old.created_at then
      raise exception 'not_allowed' using errcode = '42501';
    end if;
  end if;

  if new.username is distinct from old.username then
    if exists (select 1 from public.reserved_usernames where username = new.username) then
      raise exception 'username_reserved';
    end if;
    if exists (select 1 from public.username_history
               where username = new.username and available_at > now()
                 and profile_id is distinct from new.id) then
      raise exception 'username_unavailable';
    end if;
    if not public.is_privileged()
       and old.username_changed_at is not null
       and old.username_changed_at > now() - interval '14 days' then
      raise exception 'username_cooldown';
    end if;

    insert into public.username_history (username, profile_id, available_at)
    values (old.username, old.id, now() + interval '14 days')
    on conflict (username) do update
      set profile_id = excluded.profile_id, available_at = excluded.available_at;

    new.username_changed_at := now();
  end if;

  return new;
end $$;

create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Guardar el username siempre normalizado (corre antes de profiles_protect)
create or replace function public.normalize_username_trg()
returns trigger language plpgsql as $$
begin
  new.username := public.normalize_username(new.username);
  return new;
end $$;

create trigger profiles_normalize_username
  before insert or update of username on public.profiles
  for each row execute function public.normalize_username_trg();

-- 4.3 Funciones Premium bloqueadas para el plan gratis
create or replace function public.enforce_plan_features()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_plan public.plan_type;
begin
  if public.is_privileged() then
    return new;
  end if;

  select plan into v_plan from public.profiles where id = new.profile_id;

  if v_plan = 'free' then
    if new.bg_kind <> 'color'                        then raise exception 'premium_required: fondo con imagen o video'; end if;
    if new.music_url is not null                     then raise exception 'premium_required: música'; end if;
    if new.show_branding = false                     then raise exception 'premium_required: quitar marca'; end if;
    if new.cursor_trail = true                       then raise exception 'premium_required: rastro del cursor'; end if;
    if new.particles = 'petals'                      then raise exception 'premium_required: partículas'; end if;
    if new.name_effect in ('sparkle', 'rainbow')     then raise exception 'premium_required: efecto del nombre'; end if;
    if new.name_font not in ('Unbounded', 'Space Grotesk') then raise exception 'premium_required: tipografía'; end if;
  end if;

  return new;
end $$;

create trigger profile_settings_plan
  before insert or update on public.profile_settings
  for each row execute function public.enforce_plan_features();

-- 4.4 Máximo 6 redes en el plan gratis
create or replace function public.enforce_link_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_privileged() then
    return new;
  end if;

  if (select plan from public.profiles where id = new.profile_id) = 'free'
     and (select count(*) from public.social_links where profile_id = new.profile_id) >= 6 then
    raise exception 'premium_required: más de 6 redes';
  end if;
  return new;
end $$;

create trigger social_links_limit
  before insert on public.social_links
  for each row execute function public.enforce_link_limit();

-- 4.5 Pago confirmado => Premium. Reembolso => vuelve a gratis.
create or replace function public.handle_payment_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_badge smallint;
begin
  perform set_config('opalo.bypass', 'on', true);
  select id into v_badge from public.badges where slug = 'premium';

  if new.status = 'paid' and (tg_op = 'INSERT' or old.status <> 'paid') then
    update public.payments set paid_at = coalesce(paid_at, now()) where id = new.id and paid_at is null;
    update public.profiles
       set plan = 'premium', premium_since = coalesce(premium_since, now())
     where id = new.profile_id;
    if v_badge is not null then
      insert into public.profile_badges (profile_id, badge_id)
      values (new.profile_id, v_badge) on conflict do nothing;
    end if;

  elsif new.status = 'refunded' and tg_op = 'UPDATE' and old.status = 'paid' then
    update public.payments set refunded_at = now() where id = new.id and refunded_at is null;
    update public.profiles set plan = 'free', premium_since = null where id = new.profile_id;
    delete from public.profile_badges where profile_id = new.profile_id and badge_id = v_badge;
    -- devolver la apariencia a opciones gratis
    update public.profile_settings set
      bg_kind       = 'color',
      bg_url        = null,
      music_url     = null,
      music_title   = null,
      show_branding = true,
      cursor_trail  = false,
      particles     = case when particles = 'petals' then 'stars'::public.particle_kind else particles end,
      name_effect   = case when name_effect in ('sparkle','rainbow') then 'glow'::public.name_fx else name_effect end,
      name_font     = case when name_font in ('Unbounded','Space Grotesk') then name_font else 'Unbounded' end
    where profile_id = new.profile_id;
    -- desactivar redes por encima de 6
    update public.social_links set enabled = false
     where id in (select id from public.social_links
                  where profile_id = new.profile_id
                  order by position, created_at offset 6);
  end if;

  perform set_config('opalo.bypass', 'off', true);
  return new;
end $$;

create trigger payments_change
  after insert or update of status on public.payments
  for each row execute function public.handle_payment_change();

-- 4.6 Con 3 reportes abiertos el perfil pasa a "reportado"
create or replace function public.handle_new_report()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.reports
      where reported_profile_id = new.reported_profile_id and status = 'open') >= 3 then
    perform set_config('opalo.bypass', 'on', true);
    update public.profiles set status = 'reported'
     where id = new.reported_profile_id and status = 'active';
    perform set_config('opalo.bypass', 'off', true);
  end if;
  return new;
end $$;

create trigger reports_after_insert
  after insert on public.reports
  for each row execute function public.handle_new_report();

-- ---------------------------------------------------------------------
-- 5. Funciones para la app (RPC)
-- ---------------------------------------------------------------------

-- ¿Está libre este username? (registro y ajustes)
create or replace function public.check_username(p_username text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_valid_username(public.normalize_username(p_username))
     and not exists (select 1 from public.profiles           where username = public.normalize_username(p_username))
     and not exists (select 1 from public.reserved_usernames where username = public.normalize_username(p_username))
     and not exists (select 1 from public.username_history   where username = public.normalize_username(p_username)
                                                              and available_at > now());
$$;

-- Todo lo necesario para pintar opalo.me/<username> en una sola llamada
create or replace function public.get_public_profile(p_username text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'id',           p.id,
      'username',     p.username,
      'display_name', p.display_name,
      'bio',          p.bio,
      'location',     case when s.show_location then p.location end,
      'avatar_url',   p.avatar_url,
      'plan',         p.plan,
      'created_at',   p.created_at
    ),
    'settings', to_jsonb(s) - 'profile_id' - 'updated_at',
    'links', coalesce((
      select jsonb_agg(jsonb_build_object('id', l.id, 'platform', l.platform, 'value', l.value)
                       order by l.position, l.created_at)
      from public.social_links l
      where l.profile_id = p.id and l.enabled), '[]'::jsonb),
    'badges', case when s.show_badges then coalesce((
      select jsonb_agg(jsonb_build_object('slug', b.slug, 'name', b.name, 'icon', b.icon)
                       order by pb.granted_at)
      from public.profile_badges pb join public.badges b on b.id = pb.badge_id
      where pb.profile_id = p.id), '[]'::jsonb) else '[]'::jsonb end,
    'views', coalesce(st.views, 0)
  )
  from public.profiles p
  join public.profile_settings s on s.profile_id = p.id
  left join public.profile_stats st on st.profile_id = p.id
  where p.username = public.normalize_username(p_username)
    and p.status <> 'suspended';
$$;

-- Contar una visita (ignora la misma persona durante 30 minutos)
create or replace function public.register_view(
  p_username     text,
  p_visitor_hash text default null,
  p_referrer     text default null,
  p_country      text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.profiles
   where username = public.normalize_username(p_username) and status <> 'suspended';
  if v_id is null then return; end if;

  if p_visitor_hash is not null and exists (
       select 1 from public.profile_views
        where profile_id = v_id and visitor_hash = p_visitor_hash
          and viewed_at > now() - interval '30 minutes') then
    return;
  end if;

  insert into public.profile_views (profile_id, visitor_hash, referrer, country)
  values (v_id, p_visitor_hash, left(p_referrer, 300), left(p_country, 2));

  update public.profile_stats set views = views + 1 where profile_id = v_id;
end $$;

-- Contar un clic en una red
create or replace function public.register_click(p_link_id uuid, p_visitor_hash text default null)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_profile uuid;
begin
  select profile_id into v_profile from public.social_links where id = p_link_id and enabled;
  if v_profile is null then return; end if;

  insert into public.link_clicks (profile_id, link_id, visitor_hash)
  values (v_profile, p_link_id, p_visitor_hash);

  update public.profile_stats set clicks = clicks + 1 where profile_id = v_profile;
end $$;

-- Estadísticas del usuario logueado (panel > Estadísticas)
create or replace function public.get_my_stats(p_days int default 30)
returns table (day date, views bigint, clicks bigint)
language sql stable security definer set search_path = public
as $$
  select d::date,
         (select count(*) from public.profile_views v
           where v.profile_id = auth.uid() and v.viewed_at >= d and v.viewed_at < d + interval '1 day'),
         (select count(*) from public.link_clicks c
           where c.profile_id = auth.uid() and c.clicked_at >= d and c.clicked_at < d + interval '1 day')
  from generate_series(
         current_date - (least(greatest(p_days, 1), 365) - 1),
         current_date,
         interval '1 day') as d
  where auth.uid() is not null
  order by 1;
$$;

-- Clics por red del usuario logueado
create or replace function public.get_my_link_stats(p_days int default 30)
returns table (link_id uuid, platform text, clicks bigint)
language sql stable security definer set search_path = public
as $$
  select l.id, l.platform, count(c.id)
  from public.social_links l
  left join public.link_clicks c
         on c.link_id = l.id and c.clicked_at > now() - make_interval(days => least(greatest(p_days, 1), 365))
  where l.profile_id = auth.uid()
  group by l.id, l.platform
  order by 3 desc;
$$;

-- ---------------------------------------------------------------------
-- 6. Funciones del panel de administración
-- ---------------------------------------------------------------------

-- Métricas del Resumen
create or replace function public.admin_overview(p_days int default 30)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_days int := least(greatest(p_days, 1), 365);
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_users',      (select count(*) from public.profiles),
    'premium_users',    (select count(*) from public.profiles where plan = 'premium'),
    'new_users',        (select count(*) from public.profiles where created_at > now() - make_interval(days => v_days)),
    'revenue_usd',      (select coalesce(sum(amount_cents), 0) / 100.0 from public.payments where status = 'paid'),
    'revenue_period',   (select coalesce(sum(amount_cents), 0) / 100.0 from public.payments
                          where status = 'paid' and paid_at > now() - make_interval(days => v_days)),
    'payments_period',  (select count(*) from public.payments
                          where status = 'paid' and paid_at > now() - make_interval(days => v_days)),
    'refunds_period',   (select count(*) from public.payments
                          where status = 'refunded' and refunded_at > now() - make_interval(days => v_days)),
    'total_views',      (select coalesce(sum(views), 0) from public.profile_stats),
    'open_reports',     (select count(*) from public.reports where status = 'open'),
    'daily_signups', (
      select jsonb_agg(jsonb_build_object(
               'day',     d::date,
               'free',    (select count(*) from public.profiles p
                            where p.created_at >= d and p.created_at < d + interval '1 day' and p.plan = 'free'),
               'premium', (select count(*) from public.profiles p
                            where p.created_at >= d and p.created_at < d + interval '1 day' and p.plan = 'premium'))
             order by d)
      from generate_series(current_date - (v_days - 1), current_date, interval '1 day') d)
  ) into v_result;

  return v_result;
end $$;

-- Cambiar estado de una cuenta (activar / suspender)
create or replace function public.admin_set_status(
  p_profile uuid,
  p_status  public.account_status,
  p_note    text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  update public.profiles set status = p_status where id = p_profile;

  insert into public.admin_actions (admin_id, target_profile_id, action, details)
  values (auth.uid(), p_profile, 'set_status', jsonb_build_object('status', p_status, 'note', p_note));
end $$;

-- Resolver reportes: 'dismiss' (descartar) o 'suspend' (suspender)
create or replace function public.admin_resolve_reports(p_profile uuid, p_action text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  if p_action not in ('dismiss', 'suspend') then
    raise exception 'invalid_action';
  end if;

  update public.reports
     set status      = case when p_action = 'suspend' then 'actioned'::public.report_status
                            else 'dismissed'::public.report_status end,
         resolved_by = auth.uid(),
         resolved_at = now()
   where reported_profile_id = p_profile and status = 'open';

  update public.profiles
     set status = case when p_action = 'suspend' then 'suspended'::public.account_status
                       else 'active'::public.account_status end
   where id = p_profile;

  insert into public.admin_actions (admin_id, target_profile_id, action)
  values (auth.uid(), p_profile, 'reports_' || p_action);
end $$;

-- Dar o quitar Premium manualmente (regalos, soporte)
create or replace function public.admin_set_plan(p_profile uuid, p_plan public.plan_type, p_note text default null)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_badge smallint;
begin
  if not public.is_admin() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  select id into v_badge from public.badges where slug = 'premium';

  update public.profiles
     set plan = p_plan,
         premium_since = case when p_plan = 'premium' then coalesce(premium_since, now()) else null end
   where id = p_profile;

  if p_plan = 'premium' and v_badge is not null then
    insert into public.profile_badges (profile_id, badge_id, granted_by)
    values (p_profile, v_badge, auth.uid()) on conflict do nothing;
  elsif p_plan = 'free' then
    delete from public.profile_badges where profile_id = p_profile and badge_id = v_badge;
  end if;

  insert into public.admin_actions (admin_id, target_profile_id, action, details)
  values (auth.uid(), p_profile, 'set_plan', jsonb_build_object('plan', p_plan, 'note', p_note));
end $$;

-- Permisos de ejecución
revoke execute on function public.admin_overview(int) from public, anon;
grant  execute on function public.admin_overview(int) to authenticated;
revoke execute on function public.admin_set_status(uuid, public.account_status, text) from public, anon;
grant  execute on function public.admin_set_status(uuid, public.account_status, text) to authenticated;
revoke execute on function public.admin_resolve_reports(uuid, text) from public, anon;
grant  execute on function public.admin_resolve_reports(uuid, text) to authenticated;
revoke execute on function public.admin_set_plan(uuid, public.plan_type, text) from public, anon;
grant  execute on function public.admin_set_plan(uuid, public.plan_type, text) to authenticated;
grant  execute on function public.check_username(text)                                  to anon, authenticated;
grant  execute on function public.get_public_profile(text)                              to anon, authenticated;
grant  execute on function public.register_view(text, text, text, text)                 to anon, authenticated;
grant  execute on function public.register_click(uuid, text)                            to anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. Seguridad por filas (RLS)
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.reserved_usernames enable row level security;
alter table public.username_history   enable row level security;
alter table public.profile_settings   enable row level security;
alter table public.social_links       enable row level security;
alter table public.profile_stats      enable row level security;
alter table public.profile_views      enable row level security;
alter table public.link_clicks        enable row level security;
alter table public.badges             enable row level security;
alter table public.profile_badges     enable row level security;
alter table public.payments           enable row level security;
alter table public.reports            enable row level security;
alter table public.admin_actions      enable row level security;

-- profiles
create policy "Perfiles visibles salvo suspendidos" on public.profiles
  for select using (status <> 'suspended' or id = auth.uid() or public.is_admin());
create policy "El dueño o un admin edita el perfil" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- reserved_usernames / username_history (solo admin; la app usa check_username)
create policy "Admin gestiona nombres reservados" on public.reserved_usernames
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin ve historial de nombres" on public.username_history
  for select using (public.is_admin());

-- profile_settings
create policy "Apariencia pública" on public.profile_settings
  for select using (true);
create policy "El dueño o un admin edita la apariencia" on public.profile_settings
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- social_links
create policy "Redes activas son públicas" on public.social_links
  for select using (enabled or profile_id = auth.uid() or public.is_admin());
create policy "El dueño crea sus redes" on public.social_links
  for insert with check (profile_id = auth.uid());
create policy "El dueño edita sus redes" on public.social_links
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "El dueño o un admin borra redes" on public.social_links
  for delete using (profile_id = auth.uid() or public.is_admin());

-- estadísticas (escritura solo por funciones)
create policy "Contadores públicos" on public.profile_stats
  for select using (true);
create policy "El dueño o un admin ve sus visitas" on public.profile_views
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "El dueño o un admin ve sus clics" on public.link_clicks
  for select using (profile_id = auth.uid() or public.is_admin());

-- insignias
create policy "Insignias públicas" on public.badges
  for select using (true);
create policy "Admin gestiona insignias" on public.badges
  for all using (public.is_admin()) with check (public.is_admin());
create policy "Insignias de perfiles públicas" on public.profile_badges
  for select using (true);
create policy "Admin asigna insignias" on public.profile_badges
  for insert with check (public.is_admin());
create policy "Admin quita insignias" on public.profile_badges
  for delete using (public.is_admin());

-- pagos (sin escritura desde la app: solo service_role)
create policy "El dueño o un admin ve pagos" on public.payments
  for select using (profile_id = auth.uid() or public.is_admin());

-- reportes
create policy "Usuarios logueados reportan" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and reported_profile_id <> auth.uid());
create policy "Admin o quien reportó ve el reporte" on public.reports
  for select using (public.is_admin() or reporter_id = auth.uid());
create policy "Admin actualiza reportes" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-- registro de acciones
create policy "Admin ve el registro de acciones" on public.admin_actions
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- 8. Storage: fotos, fondos y música
--    Ruta de cada archivo: <bucket>/<user_id>/<nombre-del-archivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',     'avatars',     true,  5242880,
     array['image/png','image/jpeg','image/webp','image/gif']),
  ('backgrounds', 'backgrounds', true,  52428800,
     array['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm']),
  ('music',       'music',       true,  15728640,
     array['audio/mpeg','audio/mp4','audio/ogg','audio/wav'])
on conflict (id) do nothing;

create policy "Archivos de perfil públicos" on storage.objects
  for select using (bucket_id in ('avatars', 'backgrounds', 'music'));

create policy "Cada usuario sube su avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Solo Premium sube fondos y música" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('backgrounds', 'music')
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles where id = auth.uid() and plan = 'premium')
  );

create policy "Cada usuario reemplaza sus archivos" on storage.objects
  for update to authenticated
  using (bucket_id in ('avatars', 'backgrounds', 'music') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada usuario borra sus archivos" on storage.objects
  for delete to authenticated
  using (bucket_id in ('avatars', 'backgrounds', 'music') and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- 9. Datos iniciales
-- ---------------------------------------------------------------------
insert into public.badges (slug, name, description, icon) values
  ('premium',    'Premium',         'Compró Ópalo Premium',              'gem'),
  ('fundador',   'Fundador',        'Equipo fundador de Ópalo',          'crown'),
  ('early',      'Early supporter', 'De los primeros en unirse',         'zap'),
  ('verificado', 'Verificado',      'Identidad verificada por el equipo', 'check'),
  ('staff',      'Staff',           'Parte del equipo de Ópalo',         'shield')
on conflict (slug) do nothing;

insert into public.reserved_usernames (username) values
  ('admin'), ('api'), ('app'), ('www'), ('opalo'), ('login'), ('registro'), ('signup'),
  ('dashboard'), ('panel'), ('ajustes'), ('settings'), ('premium'), ('precios'), ('pricing'),
  ('soporte'), ('support'), ('ayuda'), ('help'), ('terminos'), ('privacidad'), ('legal'),
  ('blog'), ('status'), ('static'), ('assets'), ('cdn'), ('mail'), ('root'), ('staff')
on conflict do nothing;

-- =====================================================================
--  Después de registrarte con tu cuenta, conviértete en admin:
--    update public.profiles set role = 'admin' where username = 'TU_USUARIO';
-- =====================================================================
