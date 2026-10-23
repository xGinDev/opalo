-- =====================================================================
--  ÓPALO — Estado de Discord en vivo
--
--  Por qué: la tarjeta de estado del perfil puede mostrar
--    · un texto personalizado (como hasta ahora, presence_text), o
--    · el estado real de Discord (en línea, jugando, escuchando Spotify…),
--      leído en vivo desde Lanyard (api.lanyard.rest) con el ID de Discord.
--  El ID de Discord es público por naturaleza (Lanyard lo expone igual), así
--  que vive en profile_settings, que ya es de lectura pública.
--  get_public_profile devuelve todas las columnas de profile_settings
--  (to_jsonb(s)), así que no hay que tocar ninguna función.
-- =====================================================================

alter table public.profile_settings
  add column if not exists presence_source text not null default 'custom'
    check (presence_source in ('custom', 'discord')),
  add column if not exists discord_id text
    check (discord_id ~ '^[0-9]{17,20}$');
