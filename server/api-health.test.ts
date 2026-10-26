import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import handler from "../api/health";

function listen(server: ReturnType<typeof createServer>) {
  return new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string")
        return reject(new Error("No test server address"));
      resolve(address.port);
    });
  });
}

describe("standalone Vercel health endpoint", () => {
  it("returns a cache-free JSON success without importing Express", async () => {
    const server = createServer((req, res) => handler(req, res));
    const port = await listen(server);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({ status: "ok" });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      );
    }
  });
});
