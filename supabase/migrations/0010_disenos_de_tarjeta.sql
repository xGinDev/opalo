-- =====================================================================
--  ÓPALO — Diseños de tarjeta (Premium)
--
--  Por qué: además de la tarjeta clásica, el perfil puede usar diseños
--  Premium (cristal, neón, ópalo, avatar flotante, retro, aurora).
--  Se guarda en profile_settings.card_style (solo visual; los valores
--  permitidos los fija el check).
--  Se reemplazan enforce_plan_features (bloqueo en el plan gratis) y
--  handle_payment_change (al reembolsar vuelve a "classic"); son copias de
--  0009 con solo esas líneas agregadas.
-- =====================================================================

alter table public.profile_settings
  add column if not exists card_style text not null default 'classic'
    check (card_style in ('classic', 'glass', 'neon', 'opal', 'floating', 'retro', 'aurora'));

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
    if new.name_effect::text in ('rainbow', 'typewriter', 'blur', 'scramble')
                                                     then raise exception 'premium_required: efecto del nombre'; end if;
    if new.name_font not in ('Unbounded', 'Space Grotesk') then raise exception 'premium_required: tipografía'; end if;
    if new.card_style <> 'classic'                   then raise exception 'premium_required: diseño de tarjeta'; end if;
  end if;

  return new;
end $$;

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
      name_effect   = case when name_effect::text in ('rainbow', 'typewriter', 'blur', 'scramble')
                           then 'glow'::public.name_fx else name_effect end,
      name_font     = case when name_font in ('Unbounded','Space Grotesk') then name_font else 'Unbounded' end,
      card_style    = 'classic'
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
