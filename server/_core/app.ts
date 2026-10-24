import express from "express";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { isPublishedArtworkKey } from "../content";
import { storageDownloadPublishedObject } from "../storage";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { renderSeoDocument } from "./seo";
import { publicPlatformScript } from "./publicConfig";

const sitemapPages = ["/", "/contact", "/privacy", "/terms", "/rights"];
const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function publicOrigin() {
  const value = process.env.PUBLIC_SITE_URL || "https://montyxlabel.cyou";
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol === "https:" &&
      parsed.origin === value.replace(/\/$/, "")
    )
      return parsed.origin;
  } catch {
    // Fall back to the verified custom-domain origin below.
  }
  return "https://montyxlabel.cyou";
}

export function createApp() {
  const app = express();
  if (process.env.VERCEL) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/page", async (req, res) => {
    const requestedPath =
      typeof req.query.path === "string" ? req.query.path : "/";
    if (
      !requestedPath.startsWith("/") ||
      requestedPath.startsWith("//") ||
      requestedPath.includes("\\") ||
      requestedPath.includes("\0") ||
      requestedPath.length > 2048
    )
      return res.status(400).type("text/plain").send("Invalid page path");
    try {
      const template = await readFile(
        resolve(process.cwd(), "dist/public/index.html"),
        "utf8"
      );
      const page = await renderSeoDocument(template, requestedPath);
      return res
        .status(page.status)
        .set({
          "Cache-Control": "public, max-age=0",
          "X-Content-Type-Options": "nosniff",
        })
        .type("html")
        .send(page.html);
    } catch (error) {
      console.error(
        "[SEO] Route rendering failed:",
        error instanceof Error ? error.message : "unknown error"
      );
      return res
        .status(503)
        .type("text/plain")
        .send("Page temporarily unavailable");
    }
  });
  app.get("/api/platform/config.js", (_req, res) => {
    res
      .set("Cache-Control", "no-store")
      .type("application/javascript")
      .send(publicPlatformScript());
  });
  app.get("/api/artwork", async (req, res) => {
    const key = typeof req.query.key === "string" ? req.query.key : "";
    if (!/^artwork\/[a-f0-9-]{20,80}\.(?:jpg|png|webp)$/i.test(key))
      return res.status(404).end();
    try {
      if (!(await isPublishedArtworkKey(key))) return res.status(404).end();
      const image = await storageDownloadPublishedObject(key);
      const contentType = ["image/jpeg", "image/png", "image/webp"].includes(
        image.type
      )
        ? image.type
        : "application/octet-stream";
      return res
        .set({
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        })
        .type(contentType)
        .send(Buffer.from(await image.arrayBuffer()));
    } catch (error) {
      console.error(
        "[Artwork] Published image retrieval failed:",
        error instanceof Error ? error.message : "unknown error"
      );
      return res.status(404).end();
    }
  });
  app.get("/api/sitemap", (_req, res) => {
    const origin = publicOrigin();
    const urls = sitemapPages
      .map(path => `<url><loc>${xmlEscape(`${origin}${path}`)}</loc></url>`)
      .join("");
    res
      .set({
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex",
      })
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
      );
  });
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  return app;
}
