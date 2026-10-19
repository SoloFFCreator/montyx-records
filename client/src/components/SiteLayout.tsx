import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${compact ? "brand-compact" : ""}`}
      aria-label="MONTYX RECORDS home"
    >
      <svg className="brand-mark" viewBox="0 0 48 42" aria-hidden="true">
        <path
          d="M3 38V4h8l13 18L37 4h8v34h-9V18L24 34 12 18v20z"
          fill="currentColor"
        />
        <path d="M38 4h7v34h-7z" fill="#e11d35" />
      </svg>
      <span className="brand-type">
        <b>MONTYX</b>
        <small>RECORDS</small>
      </span>
    </Link>
  );
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
    const host = window.location.hostname.toLowerCase();
    if (host === "montyxlabel.cyou" || host === "www.montyxlabel.cyou") {
      const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
      let canonical = document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
      const ogUrl =
        document.querySelector<HTMLMetaElement>('meta[property="og:url"]') ??
        document.head.appendChild(
          Object.assign(document.createElement("meta"), { property: "og:url" })
        );
      ogUrl.content = canonicalUrl;
    }
  }, [title, description]);
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const [path] = useLocation();
  const { data: settings } = trpc.content.settings.useQuery(undefined, {
    staleTime: 60_000,
  });
  const nav = [
    ["Releases", "/releases"],
    ["About", "/about"],
    ["Artist", "/artists/montyx"],
    ["Contact", "/contact"],
  ] as const;
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="nav-inner">
          <BrandMark />
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={path === href ? "nav-link active" : "nav-link"}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link className="header-cta" href="/releases">
            Explore music <span aria-hidden="true">↗</span>
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">
              <span></span>
              <span></span>
            </summary>
            <nav aria-label="Mobile navigation">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <BrandMark compact />
            <p className="footer-note">
              Independent electronic music from Nepal.
            </p>
          </div>
          <div className="footer-links">
            <span className="eyebrow">Explore</span>
            <Link href="/releases">Releases</Link>
            <Link href="/about">About the label</Link>
            <Link href="/artists/montyx">MONTYX</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-links">
            <span className="eyebrow">Information</span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/rights">Copyright & rights</Link>
            {settings?.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            ) : (
              <span className="muted">Contact email not configured</span>
            )}
          </div>
          <div className="footer-social">
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            )}
            {settings?.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noreferrer">
                YouTube ↗
              </a>
            )}
            {settings?.soundcloudUrl && (
              <a href={settings.soundcloudUrl} target="_blank" rel="noreferrer">
                SoundCloud ↗
              </a>
            )}
            {settings?.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">
                TikTok ↗
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MONTYX RECORDS</span>
          <span>Independent by design. Nepal.</span>
          <Link href="/admin">Label admin</Link>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  href,
  action,
}: {
  kicker: string;
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {action ?? "View all"} <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}

export function ReleaseCard({ release }: { release: any }) {
  return (
    <article className="release-card">
      <Link href={`/releases/${release.slug}`} className="release-card-main">
        <div className="release-art">
          {release.coverUrl ? (
            <img src={release.coverUrl} alt={`${release.title} cover artwork`} loading="lazy" />
          ) : (
            <div className="art-empty">
              <BrandMark compact />
              <span>ARTWORK<br />TO BE ADDED</span>
            </div>
          )}
          <span className="art-open" aria-hidden="true">↗</span>
        </div>
        <div className="release-card-meta">
          <span>{release.releaseType} <i>·</i> {release.releaseDate || "Date to be confirmed"}</span>
          <span>{release.genres?.[0] || "Electronic"}</span>
        </div>
        <h3>{release.title}</h3>
        <p>{release.artist?.name ?? "MONTYX"}</p>
      </Link>
      {release.links?.length > 0 && <div className="release-card-links">{release.links.map((link: any) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer">{link.platform} ↗</a>)}</div>}
    </article>
  );
}

export function PageIntro({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="page-intro content-width">
      <span className="eyebrow red">{kicker}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
      <span className="intro-line" aria-hidden="true" />
    </section>
  );
}

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="platform-link">
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
