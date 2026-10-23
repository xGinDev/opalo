-- =====================================================================
--  ÓPALO — Volumen de la canción
--
--  Por qué: cada usuario elige qué tan fuerte suena su canción cuando
--  alguien entra a su perfil (0 a 100 %, por defecto 60 %). Los visitantes
--  igual pueden silenciarla con el botón de sonido.
--  get_public_profile devuelve todas las columnas de profile_settings
--  (to_jsonb(s)), así que no hay que tocar ninguna función.
-- =====================================================================

alter table public.profile_settings
  add column if not exists music_volume smallint not null default 60
    check (music_volume between 0 and 100);
