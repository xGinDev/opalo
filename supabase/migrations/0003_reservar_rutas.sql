-- =====================================================================
--  ÓPALO — Reservar los nombres de las rutas fijas de la app
--
--  Next.js resuelve las rutas fijas antes que /[username], así que un
--  usuario con alguno de estos nombres tendría un perfil inalcanzable.
--  "terminos" y "privacidad" ya estaban en 0001; se repiten por claridad.
-- =====================================================================

insert into public.reserved_usernames (username) values
  -- páginas legales y de contacto
  ('terminos'), ('privacidad'), ('contacto'),
  -- autenticación
  ('recuperar'), ('auth'),
  -- herramientas internas
  ('dev'),
  -- archivos que Next.js sirve en la raíz
  ('icon.svg'), ('favicon.ico'), ('robots.txt'), ('sitemap.xml'), ('manifest.webmanifest')
on conflict do nothing;
