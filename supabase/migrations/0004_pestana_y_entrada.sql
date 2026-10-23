-- =====================================================================
--  ÓPALO — Pestaña del navegador y pantalla de entrada personalizables
--
--  Por qué: el usuario puede elegir
--    · el título de la pestaña (por defecto "@usuario") y si se escribe
--      y borra solo, letra por letra (como en guns.lol)
--    · su propio favicon
--    · el texto de la pantalla de entrada (por defecto "toca para entrar")
--  get_public_profile ya devuelve todas las columnas de profile_settings
--  (to_jsonb(s)), así que no hay que tocar ninguna función.
--  Las imágenes del favicon se suben al bucket "avatars" (permitido para todos).
-- =====================================================================

alter table public.profile_settings
  add column if not exists tab_title text
    check (char_length(tab_title) <= 40),
  add column if not exists tab_title_animated boolean not null default true,
  add column if not exists favicon_url text,
  add column if not exists enter_text text
    check (char_length(enter_text) <= 40);
