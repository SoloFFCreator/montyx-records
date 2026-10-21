// Platform values are read at use time. See the Webdev service/authentication skills.
export const ENV = {
  // Never derive the session signing key from the administrator password.
  get appId() {
    return process.env.MONTYX_APP_ID ?? "montyx-records";
  },
  get cookieSecret() {
    return (
      process.env.MONTYX_SESSION_SECRET ??
      process.env.SUPABASE_JWT_SECRET ??
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.MANUS_JWT_SECRET ??
      ""
    );
  },
  get databaseUrl() {
    return process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
  },
  get oAuthServerUrl() {
    return "";
  },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() {
    return process.env.OWNER_OPEN_ID ?? "";
  },
  get adminUsername() {
    return process.env.MONTYX_ADMIN_USERNAME ?? "";
  },
  get adminPassword() {
    return process.env.MONTYX_ADMIN_PASSWORD ?? "";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get forgeApiUrl() {
    return process.env.MANUS_API_URL ?? "";
  },
  get forgeApiKey() {
    return process.env.MANUS_API_KEY ?? "";
  },
};
