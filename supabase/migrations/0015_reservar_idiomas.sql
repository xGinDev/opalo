-- =====================================================================
--  ÓPALO — Reservar los códigos de idioma
--
--  Por qué: el sitio ahora está en 8 idiomas y las páginas en otros idiomas
--  usan un prefijo: opalo.me/en, opalo.me/pt, opalo.me/fr… Si alguien se
--  registrara como "en" o "pt", su perfil chocaría con esas rutas.
--  Se reservan todos los códigos (también "es", aunque el español no lleva
--  prefijo, para poder agregarlo en el futuro sin conflictos).
-- =====================================================================

insert into public.reserved_usernames (username) values
  ('es'), ('en'), ('pt'), ('fr'), ('de'), ('tr'), ('pl'), ('ar')
on conflict (username) do nothing;
