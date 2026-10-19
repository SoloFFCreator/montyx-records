import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageIntro, ReleaseCard, usePageMeta } from "@/components/SiteLayout";

export default function Artist() {
  const [match, params] = useRoute<{ slug: string }>("/artists/:slug");
  const slug = params?.slug ?? "montyx";
  const { data, isLoading } = trpc.content.artist.useQuery({ slug }, { enabled: Boolean(match && slug), staleTime: 60_000 });
  const name = data?.name ?? "Artist";
  usePageMeta(data ? `${name} — Artist — MONTYX RECORDS` : "Artist — MONTYX RECORDS", data ? `Meet ${name}, an artist associated with MONTYX RECORDS.` : "Artist profiles from MONTYX RECORDS.");
  if (isLoading) return <main className="content-width loading-row">Loading artist profile…</main>;
  if (!data) return <main><PageIntro kicker="PROFILE UNAVAILABLE" title="Artist not found." intro="This artist profile is not public or its details have changed." /><div className="content-width"><Link className="button button-primary" href="/artists/montyx">Meet MONTYX ↗</Link></div></main>;
  const genres = data.genres ?? [];
  return (
    <main>
      <section className="artist-hero content-width">
        <div className="artist-art">
          {data.photoUrl ? <img src={data.photoUrl} alt={`${name} artist portrait`} /> : <div className="artist-emblem"><span>{name.slice(0, 1)}</span><i>{name.slice(1, 2) || "X"}</i></div>}
          <span className="eyebrow">MONTYX RECORDS · ARTIST</span>
        </div>
        <div className="artist-intro">
          <span className="eyebrow red">ARTIST PROFILE</span>
          <h1>{name}</h1>
          <p>{data.biography}</p>
          <div className="genre-tags">{genres.map(genre => <span key={genre}>{genre}</span>)}</div>
          <div className="artist-links">{data.links.map(link => <a key={link.id} className="platform-link" href={link.url} target="_blank" rel="noreferrer">{link.platform} ↗</a>)}</div>
          {!data.links.length && <p className="muted small-note">Official listening, social and video links will appear here once verified.</p>}
        </div>
      </section>
      <section className="content-width artist-discography">
        <div className="section-heading"><div><span className="eyebrow">{name} · DISCOGRAPHY</span><h2>Selected releases</h2></div></div>
        {data.discography.length ? <div className="release-grid">{data.discography.map(item => <ReleaseCard key={item.id} release={{ ...item, artist: { name } }} />)}</div> : <div className="empty-catalogue"><p>No releases are currently published. Confirmed releases will be listed here.</p><Link href="/releases" className="text-link">Browse the catalogue ↗</Link></div>}
      </section>
    </main>
  );
}
