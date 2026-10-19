import type { Express } from "express";
import { listPublicArtists, listPublicReleases } from "../content";

function configuredOrigin() {
  const raw = process.env.PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });

export function registerGatewayDocs(app: Express) {
  app.get("/sitemap.xml", async (_request, response, next) => {
    const origin = configuredOrigin();
    if (!origin) {
      response
        .set({ "Cache-Control": "no-cache", "X-Robots-Tag": "noindex" })
        .type("application/xml")
        .send(
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
        );
      return;
    }
    try {
      const [releases, artists] = await Promise.all([
        listPublicReleases(),
        listPublicArtists(),
      ]);
      const paths = [
        "/",
        "/releases",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
        "/rights",
        ...artists.map(artist => `/artists/${encodeURIComponent(artist.slug)}`),
        ...releases.map(release => `/releases/${encodeURIComponent(release.slug)}`),
      ];
      const locations = [...new Set(paths)].map(
        path => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`
      );
      response
        .set("Cache-Control", "no-cache")
        .type("application/xml")
        .send(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations.join("\n")}\n</urlset>`
        );
    } catch (error) {
      next(error);
    }
  });

  app.get("/robots.txt", (_request, response) => {
    const origin = configuredOrigin();
    const robots = origin
      ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n";
    response
      .set({
        "Cache-Control": "no-cache",
        ...(origin ? {} : { "X-Robots-Tag": "noindex" }),
      })
      .type("text/plain")
      .send(robots);
  });
}
