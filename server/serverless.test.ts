import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";
import { renderSeoDocument } from "./_core/seo";
import { appRouter } from "./routers";

afterEach(() => {
  delete process.env.VERCEL;
});

async function withServer<T>(run: (origin: string) => Promise<T>) {
  const server = createServer(createApp());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test server address");
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
}

const template =
  '<!doctype html><html><head><title>Base</title><!-- SEO_META --></head><body><!-- SEO_FALLBACK --><div id="root"></div></body></html>';

describe("Vercel serverless application", () => {
  it("does not mount any administrator login or management namespace", () => {
    const root = appRouter._def.record;
    expect(Object.keys(root)).toEqual(["auth", "content"]);
    expect(Object.keys(root.auth)).toEqual(["me", "logout"]);
  });

  it("boots the API without the Vite development server and serves health", async () => {
    process.env.VERCEL = "1";
    await withServer(async origin => {
      const response = await fetch(`${origin}/api/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "ok" });
    });
  });

  it("returns meaningful crawler-visible landing metadata and section content", async () => {
    const page = await renderSeoDocument(template, "/");
    expect(page.status).toBe(200);
    expect(page.html).toContain(
      "<title>MONTYX RECORDS Distribution — Music from Nepal to the world</title>"
    );
    expect(page.html).toContain("<h1>Your music. Going further.</h1>");
    expect(page.html).toContain("Major music destinations");
    expect(page.html).toContain(
      "not a live or exhaustive supported-store list"
    );
    expect(page.html).toContain("Artists retain master ownership");
    expect(page.html).toContain(
      "https://montyxlabel.cyou/images/montyx-distribution-hero.webp"
    );
    expect(page.html).not.toContain("/releases");
  });

  it("removes the former public administrator sign-in page", async () => {
    const page = await renderSeoDocument(template, "/admin");
    expect(page.status).toBe(404);
    expect(page.html).not.toContain("Admin access");
    expect(page.html).not.toContain("administrator password");
    expect(page.html).toContain(
      '<meta name="robots" content="noindex,nofollow" />'
    );
  });

  it("keeps unrecognized paths as genuine, non-indexable 404 pages", async () => {
    const page = await renderSeoDocument(template, "/no-such-page");
    expect(page.status).toBe(404);
    expect(page.html).toContain(
      '<meta name="robots" content="noindex,nofollow" />'
    );
    expect(page.html).toContain("Page not found — MONTYX RECORDS");
    expect(page.html).not.toContain('rel="canonical"');
  });

  it("serves a stable sitemap for public pages without listing admin or old catalogue routes", async () => {
    await withServer(async origin => {
      const response = await fetch(`${origin}/api/sitemap`);
      const sitemap = await response.text();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/xml");
      expect(sitemap).toContain("https://montyxlabel.cyou/");
      expect(sitemap).toContain("https://montyxlabel.cyou/contact");
      expect(sitemap).toContain("https://montyxlabel.cyou/rights");
      expect(sitemap).not.toContain("/releases");
      expect(sitemap).not.toContain("/admin");
    });
  });
});
