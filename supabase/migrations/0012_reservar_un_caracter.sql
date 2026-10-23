-- =====================================================================
--  ÓPALO — Reservar los usuarios de un solo carácter
--
--  Por qué: los usuarios de 1 carácter (opalo.me/a, opalo.me/7, opalo.me/~…)
--  son pocos y valiosos. Se reservan todos para que nadie los registre,
--  menos "$", que es la cuenta del fundador.
--  La lista sale de los caracteres que acepta is_valid_username (0002); el
--  filtro deja fuera "." y "!", que no pueden ir al final de un usuario.
--  Si alguno ya está en uso, la cuenta lo conserva: reservar solo impide
--  registrarlo o cambiarse a él desde ahora.
--  Para entregar uno más adelante: borrarlo de reserved_usernames y asignarlo.
-- =====================================================================

insert into public.reserved_usernames (username)
select c
from regexp_split_to_table('abcdefghijklmnopqrstuvwxyz0123456789ñáéíóúü$_.~!*-', '') as c
where c <> '$'
  and public.is_valid_username(c)
on conflict (username) do nothing;
