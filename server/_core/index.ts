import { config } from "dotenv";

config({ path: "/vercel/share/.env.project" });
config({ path: ".env.development.local" });
config({ path: ".env" });

import { createServer } from "http";
import { seedInitialContent } from "../content";
import { createApp } from "./app";
import { serveStatic, setupVite } from "./vite";

export { createApp };

async function startServer() {
  const app = createApp();
  const server = createServer(app);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  await seedInitialContent();
  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid PORT");
  server.on("error", error => {
    console.error("Server failed:", error.message);
    process.exit(1);
  });
  server.listen(port, "0.0.0.0", () =>
    console.log(`Server listening on port ${port}`)
  );
}

if (process.env.VERCEL !== "1") {
  startServer().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
