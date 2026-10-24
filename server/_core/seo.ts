const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!
  );

const baseUrl = () => {
  const configured = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  try {
    const parsed = new URL(configured || "https://montyxlabel.cyou");
    if (
      parsed.protocol === "https:" &&
      parsed.origin === (configured || parsed.origin)
    )
      return parsed.origin;
  } catch {
    // Use the known verified public origin below when configuration is invalid.
  }
  return "https://montyxlabel.cyou";
};

const staticPages: Record<
  string,
  { title: string; description: string; body: string }
> = {
  "/": {
    title: "MONTYX RECORDS Distribution — Music from Nepal to the world",
    description:
      "Independent music distribution from Nepal. Confirm current destination support and territory availability with MONTYX before scheduling a release.",
    body: "MONTYX RECORDS is an independent music distribution platform rooted in Nepal. The destination marks are illustrative examples; confirm current support for your release and territory with MONTYX. Artists retain master ownership unless a separate written agreement says otherwise.",
  },
  "/contact": {
    title: "Contact MONTYX RECORDS Distribution",
    description:
      "Contact MONTYX RECORDS about music distribution, release questions, rights or general enquiries.",
    body: "Contact MONTYX RECORDS for distribution, artist, rights or general enquiries. Contact form messages are stored for authorized label administrators; email forwarding is not configured.",
  },
  "/privacy": {
    title: "Privacy Policy — MONTYX RECORDS",
    description:
      "Privacy information for the MONTYX RECORDS website and contact form.",
    body: "Contact submissions include a name, email address, subject and message. They are used to review enquiries and are visible only to authorized label administrators.",
  },
  "/terms": {
    title: "Terms — MONTYX RECORDS",
    description:
      "Website-use terms for MONTYX RECORDS. Streaming services have their own terms.",
    body: "Streaming services have their own terms. These website terms do not transfer ownership of artist music to MONTYX RECORDS.",
  },
  "/rights": {
    title: "Copyright and Rights — MONTYX RECORDS",
    description: "Music ownership and rights information for MONTYX RECORDS.",
    body: "Music rights depend on applicable ownership and licensing agreements. Artists retain master ownership unless a separate written agreement states otherwise.",
  },
};

const landingSections = `
  <h2>Major music destinations</h2>
  <p>Selected streaming and social services are examples only, not a live or exhaustive supported-store list. Confirm the current destination and territory with MONTYX before scheduling. Service marks identify destinations and do not imply endorsement.</p>
  <h2>A clear release path</h2>
  <p>Prepare your final audio, approved artwork and release details; contact MONTYX to confirm current requirements and terms; then discuss delivery to supported destinations and their schedules.</p>
  <h2>Artist ownership</h2>
  <p>Artists retain master ownership unless a separate written agreement says otherwise. A distribution request or label credit does not, by itself, transfer ownership.</p>
  <a href="/contact">Talk distribution</a>
`;

export async function renderSeoDocument(template: string, rawUrl: string) {
  const pathname =
    new URL(rawUrl, "https://preview.invalid").pathname.replace(/\/$/, "") ||
    "/";
  const origin = baseUrl();
  const page = staticPages[pathname];
  const status = page ? 200 : 404;
  const title = page?.title ?? "Page not found — MONTYX RECORDS";
  const description =
    page?.description ?? "This MONTYX RECORDS page could not be found.";
  const content = page?.body ?? description;
  const image =
    status === 200 ? `${origin}/images/montyx-distribution-hero.webp` : "";
  const canonical = status === 200 ? `${origin}${pathname}` : "";
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
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
    status === 404
      ? `<meta name="robots" content="noindex,nofollow" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  const fallback =
    pathname === "/" && status === 200
      ? `<main id="seo-fallback" class="seo-fallback"><span>MONTYX RECORDS DISTRIBUTION · NEPAL</span><h1>Your music. Going further.</h1><p>${escapeHtml(content)}</p>${landingSections}</main>`
      : `<main id="seo-fallback" class="seo-fallback"><span>MONTYX RECORDS</span><h1>${escapeHtml(title.split(" — ")[0])}</h1><p>${escapeHtml(content)}</p><a href="/contact">Contact MONTYX RECORDS</a></main>`;

  return {
    html: template
      .replace("<!-- SEO_META -->", tags)
      .replace(
        /<title>[\s\S]*?<\/title>/,
        `<title>${escapeHtml(title)}</title>`
      )
      .replace("<!-- SEO_FALLBACK -->", fallback),
    status,
  };
}
