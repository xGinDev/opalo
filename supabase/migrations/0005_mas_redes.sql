-- =====================================================================
--  ÓPALO — Más redes sociales (incluye plataformas para adultos +18)
--
--  Por qué: 0001 limitaba social_links.platform a 13 valores. Ahora el
--  panel ofrece ~70 redes agrupadas (redes, mensajería, video, música,
--  gaming, creadores, apoyo y pagos, +18, contacto). Se reemplaza la
--  restricción por una con la lista completa. Las redes existentes siguen
--  siendo válidas (la lista nueva incluye todas las anteriores).
--  La lista debe coincidir con PLATFORMS en src/lib/profile/links.ts.
-- =====================================================================

alter table public.social_links drop constraint if exists social_links_platform_check;

alter table public.social_links add constraint social_links_platform_check check (platform in (
  -- redes
  'instagram', 'tiktok', 'x', 'facebook', 'threads', 'bluesky', 'snapchat', 'pinterest',
  'reddit', 'tumblr', 'linkedin', 'mastodon', 'vk',
  -- mensajería
  'discord', 'telegram', 'whatsapp', 'signal', 'line', 'kakaotalk', 'wechat',
  -- video y streaming
  'youtube', 'twitch', 'kick', 'vimeo',
  -- música
  'spotify', 'soundcloud', 'applemusic', 'youtubemusic', 'deezer', 'tidal', 'bandcamp', 'lastfm',
  -- gaming
  'steam', 'roblox', 'playstation', 'xbox', 'epicgames', 'battlenet', 'riotgames', 'osu', 'namemc',
  -- creadores y portafolio
  'github', 'gitlab', 'behance', 'dribbble', 'artstation', 'deviantart', 'pixiv', 'medium',
  'substack', 'letterboxd', 'myanimelist', 'anilist',
  -- apoyo y pagos
  'paypal', 'patreon', 'kofi', 'buymeacoffee', 'cashapp', 'venmo', 'revolut', 'mercadopago',
  'binance', 'bitcoin', 'ethereum',
  -- contenido para adultos (+18)
  'onlyfans', 'fansly', 'fanvue', 'manyvids', 'chaturbate', 'justforfans',
  -- contacto y otros
  'email', 'web', 'otro'
));
