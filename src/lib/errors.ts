// Turns Supabase Auth and database errors into message keys (Errors.*); the UI shows them with
// useMessageText, so they come out in the visitor's language.

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Errors.invalidCredentials",
  email_not_confirmed: "Errors.emailNotConfirmed",
  user_already_exists: "Errors.userExists",
  email_exists: "Errors.userExists",
  weak_password: "Errors.weakPassword",
  same_password: "Errors.samePassword",
  over_email_send_rate_limit: "Errors.emailRateLimit",
  over_request_rate_limit: "Errors.rateLimit",
  signup_disabled: "Errors.signupDisabled",
  email_address_invalid: "Errors.invalidEmail",
  session_not_found: "Errors.sessionExpired",
  otp_expired: "Errors.linkExpired",
  flow_state_expired: "Errors.flowExpired",
  provider_disabled: "Errors.providerDisabled",
};

const DB_ERRORS: Record<string, string> = {
  username_unavailable: "Errors.usernameUnavailable",
  username_reserved: "Errors.usernameReserved",
  username_cooldown: "Errors.usernameCooldown",
  not_allowed: "Errors.notAllowed",
  social_links_platform_check: "Errors.platformUnavailable",
};

/** `premium_required: <feature>` raised by enforce_plan_features → message key. */
const PREMIUM_FEATURES: Record<string, string> = {
  "fondo con imagen o video": "Errors.premium.background",
  música: "Errors.premium.music",
  "quitar marca": "Errors.premium.branding",
  "rastro del cursor": "Errors.premium.cursor",
  partículas: "Errors.premium.particles",
  "efecto del nombre": "Errors.premium.nameEffect",
  tipografía: "Errors.premium.font",
  "más de 6 redes": "Errors.premium.links",
  "diseño de tarjeta": "Errors.premium.cardStyle",
  distribución: "Errors.premium.arrangement",
};

type ErrorLike = { message?: string; code?: string } | string | null | undefined;

export function translateError(error: ErrorLike, fallback = "Errors.generic"): string {
  if (!error) return fallback;
  const message = typeof error === "string" ? error : (error.message ?? "");
  const code = typeof error === "string" ? undefined : error.code;

  const premium = message.match(/premium_required:\s*(.+)$/);
  if (premium) return PREMIUM_FEATURES[premium[1].trim()] ?? "Errors.premium.generic";

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
