import {
  getPublicArtist,
  getPublicRelease,
  listPublicReleases,
} from "../content";

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!
  );
const baseUrl = () =>
  process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "";
const staticPages: Record<
  string,
  { title: string; description: string; body: string }
> = {
  "/": {
    title: "MONTYX RECORDS — Independent Sound. No Limits.",
    description:
      "MONTYX RECORDS is an independent electronic music label from Nepal, focused on original releases across Brazilian Funk, Phonk and electronic music.",
    body: "An independent electronic music label from Nepal. Focused on original sound, artist ownership and a distinct identity.",
  },
  "/releases": {
    title: "Releases — MONTYX RECORDS",
    description:
      "Explore the confirmed published music catalogue from MONTYX RECORDS.",
    body: "Browse singles, EPs and albums published by MONTYX RECORDS.",
  },
  "/about": {
    title: "About MONTYX RECORDS — Independent Electronic Music",
    description:
      "The mission and independent approach of MONTYX RECORDS, a developing electronic music label based in Nepal.",
    body: "MONTYX RECORDS is an independent label from Nepal focused on original electronic music. Artists retain master ownership unless a separate written agreement states otherwise.",
  },
  "/artists/montyx": {
    title: "MONTYX — Artist — MONTYX RECORDS",
    description:
      "Meet MONTYX, an artist project moving through Brazilian Funk, Phonk and electronic music.",
    body: "MONTYX is the artist project associated with MONTYX RECORDS. Genres include Brazilian Funk, Phonk and Electronic.",
  },
  "/contact": {
    title: "Contact MONTYX RECORDS",
    description:
      "Contact the MONTYX RECORDS team for release, artist, rights and general enquiries.",
    body: "Contact MONTYX RECORDS for music, artist, rights or general enquiries. Contact form messages are stored for authorized label administrators.",
  },
  "/privacy": {
    title: "Privacy Policy — MONTYX RECORDS",
    description:
      "Privacy information for the MONTYX RECORDS website and contact form.",
    body: "Contact submissions include a name, email address, subject and message. They are used to review and respond to enquiries and are visible only to authorized label administrators.",
  },
  "/terms": {
    title: "Terms — MONTYX RECORDS",
    description:
      "Website-use terms for MONTYX RECORDS. Streaming platforms have their own terms.",
    body: "Streaming services have their own terms. These website terms do not transfer ownership of artist music to MONTYX RECORDS.",
  },
  "/rights": {
    title: "Copyright and Rights — MONTYX RECORDS",
    description: "Music ownership and rights information for MONTYX RECORDS.",
    body: "Music rights depend on the applicable ownership and licensing agreements. Artists retain master ownership unless a separate written agreement states otherwise.",
  },
  "/admin": {
    title: "Private Admin — MONTYX RECORDS",
    description:
      "Private label administration for authorized MONTYX RECORDS account holders.",
    body: "This area is restricted to an authenticated label administrator. Public visitors cannot create administrator accounts.",
  },
};

export async function renderSeoDocument(template: string, rawUrl: string) {
  const pathname =
    new URL(rawUrl, "https://preview.invalid").pathname.replace(/\/$/, "") ||
    "/";
  const origin = baseUrl();
  let status = 200;
  let title = "MONTYX RECORDS";
  let description = "Independent electronic music from Nepal.";
  let content = "";
  let image = origin ? `${origin}/images/montyx-hero.svg` : "";
  let pageType = "website";

  if (pathname.startsWith("/releases/")) {
    const slug = pathname.slice("/releases/".length);
    const release =
      slug && !slug.includes("/") ? await getPublicRelease(slug) : null;
    if (release) {
      title = `${release.title} — ${release.artist?.name ?? "MONTYX"} | MONTYX RECORDS`;
      description =
        release.description ||
        `${release.releaseType.toUpperCase()} by ${release.artist?.name ?? "MONTYX"}. ${release.genres.join(", ")}.`;
      content = `${release.title} — ${release.artist?.name ?? "MONTYX"}. ${release.releaseType}. ${release.releaseDate ?? "Release date to be confirmed"}. ${release.genres.join(", ")}. ${release.description ?? ""}`;
      image =
        release.coverUrl && origin
          ? release.coverUrl.startsWith("http")
            ? release.coverUrl
            : `${origin}${release.coverUrl}`
          : image;
      pageType = "music.album";
    } else {
      status = 404;
      title = "Release not found — MONTYX RECORDS";
      description = "This release is not available in the public catalogue.";
      content = description;
      image = "";
    }
  } else if (pathname === "/releases") {
    const releases = await listPublicReleases();
    content = releases.length
      ? `Published releases: ${releases.map(item => `${item.title} by ${item.artist?.name ?? "MONTYX"}`).join("; ")}.`
      : staticPages[pathname].body;
  } else if (pathname.startsWith("/artists/")) {
    const slug = pathname.slice("/artists/".length);
    const artist =
      slug && !slug.includes("/") ? await getPublicArtist(slug) : null;
    if (artist) {
      title = `${artist.name} — Artist — MONTYX RECORDS`;
      description = `Meet ${artist.name}, an artist associated with MONTYX RECORDS.`;
      content = `${artist.name}. ${artist.biography} Genres: ${artist.genres.join(", ")}.`;
    } else {
      status = 404;
      title = "Artist profile not found — MONTYX RECORDS";
      description =
        "This artist profile is not public or its details have changed.";
      content = description;
      image = "";
    }
  } else if (staticPages[pathname]) {
    ({ title, description, body: content } = staticPages[pathname]);
  } else {
    status = 404;
    title = "Page not found — MONTYX RECORDS";
    description = "This MONTYX RECORDS page could not be found.";
    content = description;
    image = "";
  }

  const canonical = origin && status === 200 ? `${origin}${pathname}` : "";
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="${escapeHtml(pageType)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:site_name" content="MONTYX RECORDS" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    canonical
      ? `<link rel="canonical" href="${escapeHtml(canonical)}" /><meta property="og:url" content="${escapeHtml(canonical)}" />`
      : "",
    image
      ? `<meta property="og:image" content="${escapeHtml(image)}" /><meta name="twitter:image" content="${escapeHtml(image)}" />`
      : "",
    status === 404 || pathname === "/admin"
      ? `<meta name="robots" content="noindex,nofollow" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  const fallback = `<main id="seo-fallback" class="seo-fallback"><span>MONTYX RECORDS</span><h1>${escapeHtml(title.split(" — ")[0])}</h1><p>${escapeHtml(content)}</p><a href="/releases">Explore releases</a></main>`;
  return {
    html: template
      .replace("<!-- SEO_META -->", tags)
      .replace(
        "<title>MONTYX RECORDS — Independent Sound. No Limits.</title>",
        `<title>${escapeHtml(title)}</title>`
      )
      .replace("<!-- SEO_FALLBACK -->", fallback),
    status,
  };
}
