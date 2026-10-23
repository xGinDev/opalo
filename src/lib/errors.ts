// Turns Supabase Auth and database errors into Spanish messages for the UI.

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  email_not_confirmed: "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.",
  user_already_exists: "Ya existe una cuenta con ese correo.",
  email_exists: "Ya existe una cuenta con ese correo.",
  weak_password: "La contraseña es muy débil. Usa al menos 8 caracteres.",
  same_password: "La nueva contraseña debe ser distinta de la anterior.",
  over_email_send_rate_limit: "Enviamos demasiados correos. Espera un momento e inténtalo de nuevo.",
  over_request_rate_limit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  signup_disabled: "El registro está desactivado por ahora.",
  email_address_invalid: "Ese correo no es válido.",
  session_not_found: "Tu sesión expiró. Vuelve a iniciar sesión.",
  otp_expired: "El enlace expiró o ya se usó. Pide uno nuevo.",
  flow_state_expired: "El enlace expiró. Vuelve a intentarlo.",
  provider_disabled: "Ese método de inicio de sesión no está disponible.",
};

const DB_ERRORS: Record<string, string> = {
  username_unavailable: "Ese nombre de usuario no está disponible.",
  username_reserved: "Ese nombre de usuario está reservado.",
  username_cooldown: "Solo puedes cambiar tu usuario una vez cada 14 días.",
  not_allowed: "No tienes permiso para hacer eso.",
  social_links_platform_check: "Esa red todavía no está disponible.",
};

const PREMIUM_FEATURES: Record<string, string> = {
  "fondo con imagen o video": "el fondo con imagen o video",
  música: "la música en tu perfil",
  "quitar marca": "quitar la marca de Ópalo",
  "rastro del cursor": "el rastro del cursor",
  partículas: "las partículas de pétalos",
  "efecto del nombre": "los efectos destellos y arcoíris",
  tipografía: "las tipografías extra",
  "más de 6 redes": "agregar más de 6 redes",
};

type ErrorLike = { message?: string; code?: string } | string | null | undefined;

export function translateError(error: ErrorLike, fallback = "Algo salió mal. Inténtalo de nuevo."): string {
  if (!error) return fallback;
  const message = typeof error === "string" ? error : (error.message ?? "");
  const code = typeof error === "string" ? undefined : error.code;

  const premium = message.match(/premium_required:\s*(.+)$/);
  if (premium) {
    const feature = PREMIUM_FEATURES[premium[1].trim()] ?? premium[1].trim();
    return `Solo con Premium: ${feature}.`;
  }

  for (const [key, text] of Object.entries(DB_ERRORS)) {
    if (message.includes(key)) return text;
  }

  if (code && AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  if (/invalid login credentials/i.test(message)) return AUTH_ERRORS.invalid_credentials;
  if (/email not confirmed/i.test(message)) return AUTH_ERRORS.email_not_confirmed;
  if (/already registered/i.test(message)) return AUTH_ERRORS.user_already_exists;

  return fallback;
}

export function isPremiumError(error: ErrorLike) {
  const message = typeof error === "string" ? error : (error?.message ?? "");
  return message.includes("premium_required:");
}
