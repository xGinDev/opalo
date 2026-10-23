-- =====================================================================
--  ÓPALO — Tabla de clasificación e íconos de redes a color
--
--  Por qué:
--  1. La página de inicio muestra los 30 perfiles más visitados, en dos
--     modos: histórico (contador total) y este mes (visitas desde el día 1
--     del mes, hora UTC). profile_views solo lo puede leer el dueño o un admin,
--     así que el conteo del mes se hace en una función security definer que
--     devuelve únicamente datos públicos (usuario, nombre, foto, plan, visitas).
--     Los perfiles suspendidos y los que no tienen visitas no aparecen.
--  2. Cada usuario elige si los íconos de sus redes se ven blancos (como hasta
--     ahora) o con el color de cada marca: profile_settings.icon_style.
--     get_public_profile devuelve todas las columnas de profile_settings
--     (to_jsonb(s)), así que no hay que tocarla.
-- =====================================================================

alter table public.profile_settings
  add column if not exists icon_style text not null default 'mono'
    check (icon_style in ('mono', 'color'));

create or replace function public.get_leaderboard(p_period text default 'all', p_limit int default 30)
returns table (
  rank         int,
  username     text,
  display_name text,
  avatar_url   text,
  plan         public.plan_type,
  views        bigint
)
language sql stable security definer set search_path = public
as $$
  with counts as (
    select st.profile_id, st.views::bigint as views
    from public.profile_stats st
    where p_period <> 'month'
    union all
    select v.profile_id, count(*)::bigint
    from public.profile_views v
    where p_period = 'month'
      and v.viewed_at >= date_trunc('month', now())
    group by v.profile_id
  )
  select (row_number() over (order by c.views desc, p.created_at))::int,
         p.username::text, p.display_name, p.avatar_url, p.plan, c.views
  from counts c
  join public.profiles p on p.id = c.profile_id
  where c.views > 0
    and p.status <> 'suspended'
  order by c.views desc, p.created_at
  limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;

grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
