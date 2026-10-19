import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageIntro, ReleaseCard, usePageMeta } from "@/components/SiteLayout";

export default function Releases() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "single" | "ep" | "album">("all");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [visible, setVisible] = useState(12);
  const {
    data = [],
    isLoading,
    error,
  } = trpc.content.listReleases.useQuery({
    query,
    type,
    genre: genre || undefined,
    sort,
  });
  const genres = useMemo(
    () => Array.from(new Set(data.flatMap(item => item.genres ?? []))).sort(),
    [data]
  );
  usePageMeta(
    "Releases — MONTYX RECORDS",
    "Explore the published music catalogue from MONTYX RECORDS. Browse confirmed singles, EPs and albums."
  );
  return (
    <main>
      <PageIntro
        kicker="THE CATALOGUE"
        title="Releases"
        intro="A growing collection of original sound. Every release listed here has been confirmed for publication."
      />
      <section className="content-width catalogue-section">
        <div className="filters">
          <label className="search-field">
            <span className="sr-only">Search releases</span>
            <input
              type="search"
              placeholder="Search title or artist"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setVisible(12);
              }}
            />
            <span aria-hidden="true">⌕</span>
          </label>
          <label>
            <span className="sr-only">Release type</span>
            <select
              value={type}
              onChange={event => {
                setType(event.target.value as typeof type);
                setVisible(12);
              }}
            >
              <option value="all">All types</option>
              <option value="single">Singles</option>
              <option value="ep">EPs</option>
              <option value="album">Albums</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Genre</span>
            <select
              value={genre}
              onChange={event => {
                setGenre(event.target.value);
                setVisible(12);
              }}
            >
              <option value="">All genres</option>
              {genres.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort catalogue</span>
            <select
              value={sort}
              onChange={event => setSort(event.target.value as typeof sort)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        {isLoading ? (
          <div className="loading-row">Loading releases…</div>
        ) : error ? (
          <div className="empty-catalogue">
            <h2>Catalogue unavailable</h2>
            <p>We couldn’t load releases just now. Please try again shortly.</p>
          </div>
        ) : data.length ? (
          <>
            <div className="release-grid catalogue-grid">
              {data.slice(0, visible).map(item => (
                <ReleaseCard key={item.id} release={item} />
              ))}
            </div>
            {visible < data.length && (
              <button
                className="button button-outline load-more"
                onClick={() => setVisible(value => value + 12)}
              >
                Load more
              </button>
            )}
          </>
        ) : (
          <div className="empty-catalogue">
            <span className="eyebrow">NO PUBLISHED MATCHES</span>
            <h2>Nothing in the catalogue yet.</h2>
            <p>
              Try a different search, or come back when the next release is
              ready.
            </p>
            <Link href="/artists/montyx" className="text-link">
              Meet MONTYX <span>↗</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
