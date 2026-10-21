import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  artists,
  artistLinks,
  contactRequests,
  platformLinks,
  releases,
  siteSettings,
} from "../drizzle/schema";
import { getDb } from "./db";
import { storageGetSignedUrl } from "./storage";

export const defaultSettings = {
  labelName: "MONTYX RECORDS",
  labelIntro:
    "An independent electronic music label from Nepal, releasing original sound with a distinct identity.",
  contactEmail: "",
  instagramUrl: "",
  youtubeUrl: "",
  soundcloudUrl: "",
  tiktokUrl: "",
  spotifyUrl: "",
  homeHeadline: "INDEPENDENT SOUND. NO LIMITS.",
  homeSubhead:
    "Independent electronic music from Nepal. Built on a sound of our own.",
};
const publicSettingKeys = new Set(Object.keys(defaultSettings));

export async function readSettings() {
  const db = await getDb();
  if (!db) return defaultSettings;
  const rows = await db.select().from(siteSettings);
  return {
    ...defaultSettings,
    ...Object.fromEntries(
      rows
        .filter(row => publicSettingKeys.has(row.key))
        .map(row => [row.key, row.value])
    ),
  };
}

export async function saveSettings(values: Record<string, string>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  for (const [key, value] of Object.entries(values)) {
    if (!publicSettingKeys.has(key)) throw new Error("Unknown public setting");
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value } });
  }
}

export async function listPublicReleases() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(releases)
    .where(eq(releases.publicationStatus, "published"))
    .orderBy(desc(releases.releaseDate));
  return Promise.all(
    rows.map(async release => ({
      id: release.id,
      slug: release.slug,
      title: release.title,
      releaseType: release.releaseType,
      releaseDate: release.releaseDate,
      genres: release.genres,
      description: release.description,
      coverUrl: release.coverKey
        ? `/api/artwork?key=${encodeURIComponent(release.coverKey)}`
        : release.coverUrl,
      featured: release.featured,
      distributionStatus: release.distributionStatus,
      officialVideoUrl: release.officialVideoUrl,
      artist:
        (
          await db
            .select({ id: artists.id, name: artists.name, slug: artists.slug })
            .from(artists)
            .where(eq(artists.id, release.artistId))
            .limit(1)
        )[0] ?? null,
      links: await db
        .select()
        .from(platformLinks)
        .where(
          and(
            eq(platformLinks.releaseId, release.id),
            eq(platformLinks.isPublic, true)
          )
        )
        .orderBy(platformLinks.sortOrder),
    }))
  );
}

export async function getPublicRelease(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const release = (
    await db
      .select()
      .from(releases)
      .where(
        and(
          eq(releases.slug, slug),
          eq(releases.publicationStatus, "published")
        )
      )
      .limit(1)
  )[0];
  if (!release) return null;
  const artist =
    (
      await db
        .select({ id: artists.id, name: artists.name, slug: artists.slug })
        .from(artists)
        .where(eq(artists.id, release.artistId))
        .limit(1)
    )[0] ?? null;
  const links = await db
    .select()
    .from(platformLinks)
    .where(
      and(
        eq(platformLinks.releaseId, release.id),
        eq(platformLinks.isPublic, true)
      )
    )
    .orderBy(platformLinks.sortOrder);
  const related = await db
    .select()
    .from(releases)
    .where(
      and(
        eq(releases.publicationStatus, "published"),
        eq(releases.artistId, release.artistId)
      )
    )
    .orderBy(desc(releases.releaseDate))
    .limit(4);
  const publicRelease = {
    id: release.id,
    artistId: release.artistId,
    slug: release.slug,
    title: release.title,
    releaseType: release.releaseType,
    releaseDate: release.releaseDate,
    genres: release.genres,
    description: release.description,
    coverUrl: release.coverKey
      ? `/api/artwork?key=${encodeURIComponent(release.coverKey)}`
      : release.coverUrl,
    featured: release.featured,
    distributionStatus: release.distributionStatus,
    officialVideoUrl: release.officialVideoUrl,
  };
  const publicRelated = related
    .filter(item => item.id !== release.id)
    .map(item => ({
      id: item.id,
      artistId: item.artistId,
      slug: item.slug,
      title: item.title,
      releaseType: item.releaseType,
      releaseDate: item.releaseDate,
      genres: item.genres,
      description: item.description,
      coverUrl: item.coverKey
        ? `/api/artwork?key=${encodeURIComponent(item.coverKey)}`
        : item.coverUrl,
      featured: item.featured,
      distributionStatus: item.distributionStatus,
    }));
  return { ...publicRelease, artist, links, related: publicRelated };
}

export async function getPublicArtist(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const artist = (
    await db
      .select()
      .from(artists)
      .where(and(eq(artists.slug, slug), eq(artists.isPublic, true)))
      .limit(1)
  )[0];
  if (!artist) return null;
  const [links, releasesFound] = await Promise.all([
    db
      .select()
      .from(artistLinks)
      .where(
        and(eq(artistLinks.artistId, artist.id), eq(artistLinks.isPublic, true))
      )
      .orderBy(artistLinks.sortOrder),
    db
      .select()
      .from(releases)
      .where(
        and(
          eq(releases.artistId, artist.id),
          eq(releases.publicationStatus, "published")
        )
      )
      .orderBy(desc(releases.releaseDate)),
  ]);
  const discography = releasesFound.map(release => ({
    id: release.id,
    artistId: release.artistId,
    slug: release.slug,
    title: release.title,
    releaseType: release.releaseType,
    releaseDate: release.releaseDate,
    genres: release.genres,
    description: release.description,
    coverUrl: release.coverKey
      ? `/api/artwork?key=${encodeURIComponent(release.coverKey)}`
      : release.coverUrl,
    featured: release.featured,
    distributionStatus: release.distributionStatus,
  }));
  return { ...artist, links, discography };
}

export async function listPublicArtists() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ slug: artists.slug })
    .from(artists)
    .where(eq(artists.isPublic, true));
}

export async function isPublishedArtworkKey(key: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: releases.id })
    .from(releases)
    .where(
      and(
        eq(releases.coverKey, key),
        eq(releases.publicationStatus, "published")
      )
    )
    .limit(1);
  return result.length > 0;
}

export async function listAdminReleases() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(releases)
    .orderBy(desc(releases.updatedAt));
  return Promise.all(
    rows.map(async row => ({
      ...row,
      coverUrl: row.coverKey
        ? await storageGetSignedUrl(row.coverKey).catch(() => "")
        : row.coverUrl,
      links: await db
        .select()
        .from(platformLinks)
        .where(eq(platformLinks.releaseId, row.id))
        .orderBy(platformLinks.sortOrder),
    }))
  );
}

export async function saveRelease(input: {
  id?: number;
  artistId: number;
  slug: string;
  title: string;
  releaseType: "single" | "ep" | "album";
  releaseDate: string | null;
  genres: string[];
  description: string;
  coverUrl: string;
  coverKey: string;
  publicationStatus: "draft" | "published";
  distributionStatus: "pending" | "scheduled" | "live" | "taken_down";
  featured: boolean;
  isrc: string;
  upcEan: string;
  distributorName: string;
  releaseChecklist: string[];
  deliveryReference: string;
  labelCredit: string;
  masterOwnershipNotes: string;
  internalNotes: string;
  audioMasterKey: string;
  officialVideoUrl: string;
  links: Array<{ platform: string; url: string; isPublic: boolean }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const { id, links, releaseChecklist: _releaseChecklist, ...fields } = input;
  const data = {
    ...fields,
    releaseDate: fields.releaseDate || null,
    publishedAt: fields.publicationStatus === "published" ? new Date() : null,
  };
  let releaseId = id;
  if (id) {
    await db.update(releases).set(data).where(eq(releases.id, id));
  } else {
    const result = await db
      .insert(releases)
      .values(data)
      .returning({ id: releases.id });
    releaseId = result[0]?.id;
  }
  if (!releaseId) throw new Error("Could not save the release");
  await db.delete(platformLinks).where(eq(platformLinks.releaseId, releaseId));
  const normalizedLinks = links
    .filter(link => link.platform.trim() && link.url.trim())
    .map((link, index) => ({
      releaseId,
      platform: link.platform.trim().slice(0, 80),
      url: link.url.trim(),
      isPublic: link.isPublic,
      sortOrder: index,
    }));
  if (normalizedLinks.length)
    await db.insert(platformLinks).values(normalizedLinks);
  return releaseId;
}

export async function deleteRelease(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(platformLinks).where(eq(platformLinks.releaseId, id));
  await db.delete(releases).where(eq(releases.id, id));
}

export async function listAdminArtists() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(artists);
  return Promise.all(
    rows.map(async row => ({
      ...row,
      links: await db
        .select()
        .from(artistLinks)
        .where(eq(artistLinks.artistId, row.id))
        .orderBy(artistLinks.sortOrder),
    }))
  );
}

export async function saveArtist(input: {
  id?: number;
  name: string;
  slug: string;
  biography: string;
  genres: string[];
  photoUrl: string;
  isPublic: boolean;
  links: Array<{
    platform: string;
    kind: "streaming" | "social" | "video" | "other";
    url: string;
    isPublic: boolean;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const { id, links, ...fields } = input;
  let artistId = id;
  if (id) await db.update(artists).set(fields).where(eq(artists.id, id));
  else {
    const result = await db
      .insert(artists)
      .values(fields)
      .returning({ id: artists.id });
    artistId = result[0]?.id;
  }
  if (!artistId) throw new Error("Could not save the artist");
  await db.delete(artistLinks).where(eq(artistLinks.artistId, artistId));
  const normalized = links
    .filter(link => link.platform.trim() && link.url.trim())
    .map((link, index) => ({
      ...link,
      artistId,
      platform: link.platform.trim().slice(0, 80),
      url: link.url.trim(),
      sortOrder: index,
    }));
  if (normalized.length) await db.insert(artistLinks).values(normalized);
  return artistId;
}

export async function submitContact(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Contact service is not available");
  const recent = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactRequests)
    .where(
      and(
        eq(contactRequests.ipHash, input.ipHash),
        gte(contactRequests.createdAt, new Date(Date.now() - 15 * 60_000))
      )
    );
  if (Number(recent[0]?.count ?? 0) >= 5)
    throw new Error("Too many messages. Please try again later.");
  await db.insert(contactRequests).values({ ...input, status: "new" });
}

export async function listContactRequests() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: contactRequests.id,
      name: contactRequests.name,
      email: contactRequests.email,
      subject: contactRequests.subject,
      message: contactRequests.message,
      status: contactRequests.status,
      createdAt: contactRequests.createdAt,
    })
    .from(contactRequests)
    .orderBy(desc(contactRequests.createdAt))
    .limit(200);
}

export async function updateContactStatus(
  id: number,
  status: "new" | "in_review" | "resolved"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(contactRequests)
    .set({ status })
    .where(eq(contactRequests.id, id));
}

export async function seedInitialContent() {
  const db = await getDb();
  if (!db) return;
  const artist = (
    await db.select().from(artists).where(eq(artists.slug, "montyx")).limit(1)
  )[0];
  let artistId = artist?.id;
  if (!artistId) {
    const result = await db
      .insert(artists)
      .values({
        name: "MONTYX",
        slug: "montyx",
        biography:
          "MONTYX is the artist project associated with MONTYX RECORDS. The sound moves through Brazilian Funk, Phonk and electronic music. Profile details and official links will be updated as they are confirmed.",
        genres: ["Brazilian Funk", "Phonk", "Electronic"],
        photoUrl: null,
        isPublic: true,
      })
      .returning({ id: artists.id });
    artistId = result[0]?.id;
  }
  const existing = await db
    .select()
    .from(releases)
    .where(eq(releases.slug, "montagem-da-seducao"))
    .limit(1);
  if (!existing.length) {
    await db.insert(releases).values({
      artistId,
      slug: "montagem-da-seducao",
      title: "MONTAGEM DA SEDUÇÃO",
      releaseType: "single",
      releaseDate: "2026-09-29",
      genres: ["Electronic"],
      description: "",
      coverUrl: "",
      coverKey: "",
      publicationStatus: "draft",
      distributionStatus: "pending",
      featured: false,
      isrc: "NL9KR2145620",
      upcEan: "8721667789184",
      distributorName: "",
      releaseChecklist: [],
      deliveryReference: "",
      labelCredit:
        "MONTYX RECORDS — verify the exact credit against current distributor metadata before publishing.",
      masterOwnershipNotes:
        "Artists retain master ownership unless a separate written agreement states otherwise.",
      internalNotes:
        "Draft only. Confirm date, identifiers, label credit, actual distributor, cover artwork, and genuine streaming URLs before publication.",
      audioMasterKey: "",
      officialVideoUrl: "",
      publishedAt: null,
    });
  }
}
