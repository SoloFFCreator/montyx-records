import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ReleaseCard,
  SectionHeading,
  usePageMeta,
} from "@/components/SiteLayout";

export default function Home() {
  const { data, isLoading } = trpc.content.home.useQuery(undefined, {
    staleTime: 30_000,
  });
  const { data: artist } = trpc.content.artist.useQuery(
    { slug: "montyx" },
    { staleTime: 60_000 }
  );
  const releases = data?.releases ?? [];
  const featured = releases.find(item => item.featured) ?? releases[0];
  const settings = data?.settings;
  usePageMeta(
    "MONTYX RECORDS — Independent Sound. No Limits.",
    "MONTYX RECORDS is an independent electronic music label from Nepal, focused on original releases across Brazilian Funk, Phonk and electronic music."
  );
  return (
    <main>
      <section className="hero">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-content content-width">
          <div className="hero-kicker">
            <span className="live-dot" /> INDEPENDENT LABEL · NEPAL
          </div>
          <h1>{settings?.homeHeadline || "INDEPENDENT SOUND. NO LIMITS."}</h1>
          <p>
            {settings?.homeSubhead ||
              "Independent electronic music from Nepal. Built on a sound of our own."}
          </p>
          <div className="hero-actions">
            <Link href="/releases" className="button button-primary">
              Explore releases <span>↗</span>
            </Link>
            {artist?.links?.find(
              link => link.kind === "streaming" && link.isPublic
            ) ? (
              <a
                href={
                  artist.links.find(
                    link => link.kind === "streaming" && link.isPublic
                  )!.url
                }
                target="_blank"
                rel="noreferrer"
                className="button button-ghost"
              >
                Listen to MONTYX <span>↗</span>
              </a>
            ) : (
              <Link href="/artists/montyx" className="button button-ghost">
                Meet MONTYX <span>↗</span>
              </Link>
            )}
          </div>
          <div className="hero-index">
            <span>01 / LABEL</span>
            <span>INDEPENDENT — NEPAL</span>
          </div>
        </div>
        <div className="hero-edge">
          <span>MONTYX RECORDS</span>
          <span>INDEPENDENT SOUND · NEPAL</span>
        </div>
      </section>
      <section className="release-feature content-width">
        <div className="feature-label">
          <span className="eyebrow red">
            {featured ? "FEATURED RELEASE" : "THE LABEL"}
          </span>
          <span className="feature-index">
            01 — {featured ? "LATEST" : "MUSIC"}
          </span>
        </div>
        {featured ? (
          <div className="feature-content">
            <Link href={`/releases/${featured.slug}`} className="feature-cover">
              {featured.coverUrl ? (
                <img src={featured.coverUrl} alt={`${featured.title} cover`} />
              ) : (
                <div className="cover-placeholder">
                  <span className="cover-mark">
                    M<span>X</span>
                  </span>
                  <span>
                    ARTWORK
                    <br />
                    COMING SOON
                  </span>
                </div>
              )}
            </Link>
            <div className="feature-copy">
              <span className="eyebrow">
                {featured.releaseType} ·{" "}
                {featured.releaseDate || "Date to be confirmed"}
              </span>
              <h2>{featured.title}</h2>
              <p className="feature-artist">
                {featured.artist?.name ?? "MONTYX"} <span>·</span>{" "}
                {featured.genres?.join(" / ")}
              </p>
              {featured.description && <p>{featured.description}</p>}
              <div className="feature-actions">
                <Link
                  className="button button-primary"
                  href={`/releases/${featured.slug}`}
                >
                  Release details <span>↗</span>
                </Link>
                {featured.links?.map((link: any) => (
                  <a
                    key={link.id}
                    className="button button-outline"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Listen on {link.platform} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="feature-empty">
            <div className="empty-art">
              <span className="cover-mark">
                M<span>X</span>
              </span>
            </div>
            <div>
              <span className="eyebrow">ORIGINAL MUSIC · IN DEVELOPMENT</span>
              <h2>Sound with a point of view.</h2>
              <p>
                Release information and artwork will appear here once they’re
                confirmed for publication.
              </p>
              <Link href="/artists/montyx" className="text-link">
                Meet the artist <span>↗</span>
              </Link>
            </div>
          </div>
        )}
      </section>
      <section className="latest-section">
        <div className="content-width">
          <SectionHeading
            kicker="FROM THE CATALOGUE"
            title="Latest releases"
            href="/releases"
            action="All releases"
          />
          {isLoading ? (
            <div className="loading-row">Loading catalogue…</div>
          ) : releases.length ? (
            <div className="release-grid">
              {releases.slice(0, 3).map(release => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          ) : (
            <div className="empty-catalogue">
              <span className="eyebrow">CATALOGUE IN PROGRESS</span>
              <p>
                There are no published releases yet. The label’s first release
                will appear here when its details are verified.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="statement-band">
        <div className="content-width statement-inner">
          <span className="eyebrow red">MONTYX RECORDS · NEPAL</span>
          <p>
            {settings?.labelIntro ||
              "An independent electronic music label focused on original music, distinct identity, and a professional presence across digital music platforms."}
          </p>
          <Link href="/about" className="text-link">
            More about the label <span>↗</span>
          </Link>
        </div>
        <div className="wave-rule" aria-hidden="true" />
      </section>
      <section className="listen-strip content-width">
        <div>
          <span className="eyebrow">FOLLOW THE SOUND</span>
          <h2>Wherever the next track takes you.</h2>
        </div>
        <div className="listen-links">
          {settings?.spotifyUrl && (
            <a href={settings.spotifyUrl} target="_blank" rel="noreferrer">
              Spotify <span>↗</span>
            </a>
          )}
          {settings?.youtubeUrl && (
            <a href={settings.youtubeUrl} target="_blank" rel="noreferrer">
              YouTube <span>↗</span>
            </a>
          )}
          {settings?.soundcloudUrl && (
            <a href={settings.soundcloudUrl} target="_blank" rel="noreferrer">
              SoundCloud <span>↗</span>
            </a>
          )}
          {settings?.tiktokUrl && (
            <a href={settings.tiktokUrl} target="_blank" rel="noreferrer">
              TikTok <span>↗</span>
            </a>
          )}
          {!settings?.spotifyUrl &&
            !settings?.youtubeUrl &&
            !settings?.soundcloudUrl &&
            !settings?.tiktokUrl && (
              <span className="muted">
                Official platform links will appear here when configured.
              </span>
            )}
        </div>
      </section>
    </main>
  );
}
