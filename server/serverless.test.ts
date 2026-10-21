import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";

afterEach(() => {
  delete process.env.VERCEL;
});

describe("Vercel serverless application", () => {
  it("boots the API without the Vite development server and serves health", async () => {
    process.env.VERCEL = "1";
    const server = createServer(createApp());
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    try {
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("No test server address");
      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/health`
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      );
    }
  });
});
