import { relations } from "drizzle-orm";
import { artists, artistLinks, platformLinks, releases } from "./schema";

export const artistsRelations = relations(artists, ({ many }) => ({
  releases: many(releases),
  links: many(artistLinks),
}));

export const releasesRelations = relations(releases, ({ one, many }) => ({
  artist: one(artists, {
    fields: [releases.artistId],
    references: [artists.id],
  }),
  links: many(platformLinks),
}));

export const artistLinksRelations = relations(artistLinks, ({ one }) => ({
  artist: one(artists, {
    fields: [artistLinks.artistId],
    references: [artists.id],
  }),
}));

export const platformLinksRelations = relations(platformLinks, ({ one }) => ({
  release: one(releases, {
    fields: [platformLinks.releaseId],
    references: [releases.id],
  }),
}));
