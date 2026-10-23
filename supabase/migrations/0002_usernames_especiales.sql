-- =====================================================================
--  ÓPALO — Usuarios de 1 a 20 caracteres, con símbolos, ñ y tildes
--  Ejecutar en Supabase > SQL Editor (sobre la base que ya creaste)
--
--  Permitido:  a-z  0-9  ñ á é í ó ú ü   y los símbolos  $ _ . ~ ! * -
--  Reglas:     - de 1 a 20 caracteres
--              - no puede terminar en "." ni en "!"
--                (WhatsApp, Discord, etc. los cortan al detectar el enlace)
--              - se guarda en minúscula: "Gin" y "GIN" son el mismo usuario
-- =====================================================================

-- 1. Reglas en un solo lugar
create or replace function public.normalize_username(p text)
returns text
language sql immutable
as $$
  select normalize(lower(trim(p)), NFC);
$$;

create or replace function public.is_valid_username(p text)
returns boolean
language sql immutable
as $$
  select p ~ '^[a-z0-9ñáéíóúü$_.~!*-]{0,19}[a-z0-9ñáéíóúü$_~*-]$';
$$;

-- 2. Cambiar la restricción de la tabla
alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles add constraint profiles_username_check
  check (public.is_valid_username(username::text));

-- 3. Guardar siempre en minúscula y normalizado
create or replace function public.normalize_username_trg()
returns trigger
language plpgsql
as $$
begin
  new.username := public.normalize_username(new.username);
  return new;
end $$;

drop trigger if exists profiles_normalize_username on public.profiles;
create trigger profiles_normalize_username
  before insert or update of username on public.profiles
  for each row execute function public.normalize_username_trg();

-- 4. Comprobar disponibilidad con las reglas nuevas
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

-- 5. Registro con las reglas nuevas
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
