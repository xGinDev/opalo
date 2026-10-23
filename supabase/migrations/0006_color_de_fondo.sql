-- =====================================================================
--  ÓPALO — Color de fondo sólido
--
--  Por qué: con el tipo de fondo "color" el perfil mostraba luces animadas
--  derivadas del color de acento, así que al cambiar el acento del nombre
--  cambiaba todo el fondo. Ahora el fondo "color" es un color sólido que el
--  usuario elige aparte (bg_color); el acento solo afecta al nombre y detalles.
--  get_public_profile ya devuelve todas las columnas de profile_settings
--  (to_jsonb(s)), así que no hay que tocar ninguna función.
-- =====================================================================

alter table public.profile_settings
  add column if not exists bg_color text not null default '#0B0812'
    check (bg_color ~ '^#[0-9A-Fa-f]{6}$');
