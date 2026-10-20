import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  biography: text("biography").notNull(),
  genres: jsonb("genres").$type<string[]>().notNull().default([]),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const releases = pgTable("releases", {
  id: serial("id").primaryKey(),
  artistId: integer("artistId").notNull().references(() => artists.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  releaseType: text("releaseType").$type<"single" | "ep" | "album">().default("single").notNull(),
  releaseDate: date("releaseDate", { mode: "string" }),
  genres: jsonb("genres").$type<string[]>().notNull().default([]),
  description: text("description"),
  coverUrl: varchar("coverUrl", { length: 1024 }),
  coverKey: varchar("coverKey", { length: 512 }),
  publicationStatus: text("publicationStatus").$type<"draft" | "published">().default("draft").notNull(),
  distributionStatus: text("distributionStatus").$type<"pending" | "scheduled" | "live" | "taken_down">().default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  isrc: varchar("isrc", { length: 32 }),
  upcEan: varchar("upcEan", { length: 32 }),
  distributorName: varchar("distributorName", { length: 200 }),
  deliveryReference: varchar("deliveryReference", { length: 500 }),
  labelCredit: varchar("labelCredit", { length: 200 }),
  masterOwnershipNotes: text("masterOwnershipNotes"),
  internalNotes: text("internalNotes"),
  audioMasterKey: varchar("audioMasterKey", { length: 512 }),
  officialVideoUrl: varchar("officialVideoUrl", { length: 1024 }),
  publishedAt: timestamp("publishedAt", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const platformLinks = pgTable("platformLinks", {
  id: serial("id").primaryKey(),
  releaseId: integer("releaseId").notNull().references(() => releases.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 80 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const artistLinks = pgTable("artistLinks", {
  id: serial("id").primaryKey(),
  artistId: integer("artistId").notNull().references(() => artists.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 80 }).notNull(),
  kind: text("kind").$type<"streaming" | "social" | "video" | "other">().default("social").notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
});

export const siteSettings = pgTable("siteSettings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const contactRequests = pgTable("contactRequests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  ipHash: varchar("ipHash", { length: 64 }).notNull(),
  status: text("status").$type<"new" | "in_review" | "resolved">().default("new").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type Release = typeof releases.$inferSelect;
export type PlatformLink = typeof platformLinks.$inferSelect;
