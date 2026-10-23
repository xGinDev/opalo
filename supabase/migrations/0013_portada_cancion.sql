-- =====================================================================
--  ÓPALO — Portada de la canción
--
--  Por qué: el reproductor del perfil mostraba un cuadro de color en lugar
--  de una portada. Ahora el usuario puede subir una imagen pequeña para su
--  canción (se recorta cuadrada a 300×300 y se guarda como WebP, ~20 KB).
--  Se sube al bucket "avatars" (imágenes, permitido para todos), igual que
--  el favicon. Vacío = el degradado de siempre.
--  get_public_profile devuelve todas las columnas de profile_settings
--  (to_jsonb(s)), así que no hay que tocar ninguna función.
-- =====================================================================

alter table public.profile_settings
  add column if not exists music_cover_url text;
