// Platform values are read at use time. See the Webdev service/authentication skills.
export const ENV = {
  // Supabase-backed deployments do not provide Manus project secrets. Keep
  // the existing signed-cookie session format, but derive a stable local
  // secret from the private admin credential when no dedicated secret exists.
  get appId() { return process.env.MONTYX_APP_ID ?? "montyx-records"; },
  get cookieSecret() {
    return process.env.MONTYX_SESSION_SECRET ?? process.env.MONTYX_ADMIN_PASSWORD ?? "";
  },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get oAuthServerUrl() { return ""; },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() { return process.env.OWNER_OPEN_ID ?? ""; },
  get adminUsername() { return process.env.MONTYX_ADMIN_USERNAME ?? ""; },
  get adminPassword() { return process.env.MONTYX_ADMIN_PASSWORD ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get forgeApiUrl() { return process.env.MANUS_API_URL ?? ""; },
  get forgeApiKey() { return process.env.MANUS_API_KEY ?? ""; },
};
