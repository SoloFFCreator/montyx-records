import {
  boolean,
  date,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const artists = mysqlTable("artists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  biography: text("biography").notNull(),
  genres: json("genres").$type<string[]>().notNull(),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const releases = mysqlTable("releases", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  releaseType: mysqlEnum("releaseType", ["single", "ep", "album"])
    .default("single")
    .notNull(),
  releaseDate: date("releaseDate", { mode: "string" }),
  genres: json("genres").$type<string[]>().notNull(),
  description: text("description"),
  coverUrl: varchar("coverUrl", { length: 1024 }),
  coverKey: varchar("coverKey", { length: 512 }),
  publicationStatus: mysqlEnum("publicationStatus", ["draft", "published"])
    .default("draft")
    .notNull(),
  distributionStatus: mysqlEnum("distributionStatus", [
    "pending",
    "scheduled",
    "live",
    "taken_down",
  ])
    .default("pending")
    .notNull(),
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
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const platformLinks = mysqlTable("platformLinks", {
  id: int("id").autoincrement().primaryKey(),
  releaseId: int("releaseId")
    .notNull()
    .references(() => releases.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 80 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const artistLinks = mysqlTable("artistLinks", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 80 }).notNull(),
  kind: mysqlEnum("kind", ["streaming", "social", "video", "other"])
    .default("social")
    .notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
});

export const siteSettings = mysqlTable("siteSettings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contactRequests = mysqlTable("contactRequests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  ipHash: varchar("ipHash", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["new", "in_review", "resolved"])
    .default("new")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type Release = typeof releases.$inferSelect;
export type PlatformLink = typeof platformLinks.$inferSelect;
