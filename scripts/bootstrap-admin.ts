import { createInterface } from "node:readline/promises";
import { and, eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "../server/db";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is unavailable.");
  try {
    const existingAdmins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    if (existingAdmins.length)
      throw new Error(
        "An administrator already exists; this one-time bootstrap is closed."
      );

    const args = process.argv.slice(2);
    let openId = args.includes("--open-id")
      ? args[args.indexOf("--open-id") + 1]
      : undefined;
    if (!openId) {
      if (!process.stdin.isTTY)
        throw new Error(
          "Run `pnpm admin:bootstrap` in an interactive project-owner terminal, or pass `--open-id <existing-oauth-id>`."
        );
      const accounts = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          openId: users.openId,
        })
        .from(users)
        .where(eq(users.role, "user"));
      if (!accounts.length)
        throw new Error(
          "No signed-in account exists. Sign in at /admin once, then run the bootstrap command again."
        );
      console.log("Existing authenticated accounts:");
      accounts.forEach((account, index) =>
        console.log(
          `${index + 1}. ${account.name || "Unnamed account"} — ${account.email || "no email from identity provider"}`
        )
      );
      const prompt = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        const selection = Number(
          await prompt.question("Choose the label owner’s account number: ")
        );
        const account = accounts[selection - 1];
        if (!account)
          throw new Error("Selection did not match an existing account.");
        const confirmation = await prompt.question(
          `Type MONTYX ADMIN to grant access to ${account.name || account.email || "this account"}: `
        );
        if (confirmation !== "MONTYX ADMIN")
          throw new Error("Confirmation did not match; no role was changed.");
        openId = account.openId;
      } finally {
        prompt.close();
      }
    }

    const account = (
      await db
        .select()
        .from(users)
        .where(and(eq(users.openId, openId), eq(users.role, "user")))
        .limit(1)
    )[0];
    if (!account)
      throw new Error(
        "No matching existing non-admin OAuth account was found; no user was created or changed."
      );
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, account.id));
    console.log(
      "First administrator granted to the selected existing OAuth account. Refresh /admin to continue."
    );
  } finally {
    const client = (
      db as typeof db & { $client?: { end?: () => Promise<void> } }
    ).$client;
    if (client?.end) await client.end();
  }
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.message : "Administrator bootstrap failed."
  );
  process.exitCode = 1;
});
