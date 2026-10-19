import { useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ExternalLink,
  PageIntro,
  ReleaseCard,
  usePageMeta,
} from "@/components/SiteLayout";

export default function ReleaseDetail() {
  const [match, params] = useRoute<{ slug: string }>("/releases/:slug");
  const { data, isLoading, error } = trpc.content.release.useQuery(
    { slug: params?.slug ?? "" },
    { enabled: Boolean(match && params?.slug) }
  );
  const [shareMessage, setShareMessage] = useState("");
  const nativeShare =
    typeof navigator === "undefined"
      ? undefined
      : (
          navigator as Navigator & {
            share?: (data: ShareData) => Promise<void>;
          }
        ).share;
  const canNativeShare = typeof nativeShare === "function";
  usePageMeta(
    data
      ? `${data.title} — ${data.artist?.name ?? "MONTYX"} | MONTYX RECORDS`
      : "Release — MONTYX RECORDS",
    data?.description ||
      "Release details from MONTYX RECORDS. Only confirmed information and configured destinations are shown."
  );

  if (isLoading)
    return <main className="content-width loading-row">Loading release…</main>;
  if (error || !data)
    return (
      <main>
        <PageIntro
          kicker="RELEASE NOT FOUND"
          title="Not in the catalogue."
          intro="This release may not be published or its details may have changed."
        />
        <div className="content-width">
          <Link className="button button-primary" href="/releases">
            Back to releases
          </Link>
        </div>
      </main>
    );

  const share = async () => {
    setShareMessage("");
    if (canNativeShare) {
      try {
        await nativeShare.call(navigator, {
          title: `${data.title} — MONTYX`,
          url: window.location.href,
        });
      } catch {
        /* The visitor dismissed the native share sheet. */
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied.");
    } else {
      setShareMessage(`Copy this link: ${window.location.href}`);
    }
  };
  const distributionLabel: Record<string, string> = {
    pending: "Distribution pending",
    scheduled: "Scheduled — not yet live",
    live: "Live — confirmed by the label",
    taken_down: "Taken down",
  };

  return (
    <main>
      <div className="content-width detail-back">
        <Link href="/releases">← All releases</Link>
      </div>
      <section className="detail-layout content-width">
        <div className="detail-art">
          {data.coverUrl ? (
            <img src={data.coverUrl} alt={`${data.title} cover artwork`} />
          ) : (
            <div className="art-empty detail-empty">
              <span className="cover-mark">
                M<span>X</span>
              </span>
              <span>OFFICIAL ARTWORK</span>
            </div>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow red">
            {data.releaseType.toUpperCase()} ·{" "}
            {data.releaseDate || "DATE TO BE CONFIRMED"}
          </span>
          <h1>{data.title}</h1>
          <p className="detail-artist">{data.artist?.name ?? "MONTYX"}</p>
          <div className="genre-tags">
            {data.genres.map(genre => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
          <span className="eyebrow">
            {distributionLabel[data.distributionStatus] ||
              "Distribution status to be confirmed"}
          </span>
          {data.description && (
            <p className="detail-description">{data.description}</p>
          )}
          <div className="detail-actions">
            {data.links.map(link => (
              <ExternalLink key={link.id} href={link.url}>
                Listen on {link.platform}
              </ExternalLink>
            ))}
            {data.officialVideoUrl && (
              <ExternalLink href={data.officialVideoUrl}>Official video</ExternalLink>
            )}
            <button
              className="button button-outline"
              onClick={() => void share()}
            >
              {canNativeShare ? "Share release" : "Copy link"} ↗
            </button>
          </div>
          {shareMessage && (
            <p className="muted small-note" role="status">
              {shareMessage}
            </p>
          )}
          {!data.links.length && (
            <p className="muted small-note">
              Official listening links will appear here once they are confirmed.
            </p>
          )}
          <p className="rights-note">
            Music rights remain subject to the applicable ownership and
            licensing agreements.{" "}
            <Link href="/rights">Read our rights policy</Link>.
          </p>
        </div>
      </section>
      {data.related?.length > 0 && (
        <section className="content-width related-section">
          <h2>More from MONTYX</h2>
          <div className="release-grid">
            {data.related.slice(0, 3).map((item: any) => (
              <ReleaseCard
                key={item.id}
                release={{ ...item, artist: data.artist }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
