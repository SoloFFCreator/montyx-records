import type { IncomingMessage, ServerResponse } from "node:http";

const PUBLIC_PAGES = ["/", "/contact", "/privacy", "/terms", "/rights"];

function publicOrigin() {
  const configured = process.env.PUBLIC_SITE_URL || "https://montyxlabel.cyou";
  try {
    const url = new URL(configured);
    if (
      url.protocol === "https:" &&
      url.origin === configured.replace(/\/$/, "")
    )
      return url.origin;
  } catch {
    // Use the previously verified public origin when configuration is invalid.
  }
  return "https://montyxlabel.cyou";
}

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const urls = PUBLIC_PAGES.map(
    path => `<url><loc>${publicOrigin()}${path}</loc></url>`
  ).join("");
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  res.statusCode = 200;
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Robots-Tag", "noindex");
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.end(sitemap);
}
