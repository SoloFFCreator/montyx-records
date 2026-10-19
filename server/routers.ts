import { COOKIE_NAME } from "@shared/const";
import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  deleteRelease,
  getPublicArtist,
  getPublicRelease,
  listAdminArtists,
  listAdminReleases,
  listContactRequests,
  listPublicReleases,
  readSettings,
  saveArtist,
  saveRelease,
  saveSettings,
  submitContact,
  updateContactStatus,
} from "./content";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";

const safeHttpsUrl = z
  .string()
  .trim()
  .url()
  .max(1024)
  .refine(value => new URL(value).protocol === "https:", "Use an HTTPS URL");
const artworkUrl = z
  .string()
  .max(1024)
  .refine(
    value =>
      !value ||
      value.startsWith("/manus-storage/") ||
      (() => {
        try {
          return new URL(value).protocol === "https:";
        } catch {
          return false;
        }
      })(),
    "Use an HTTPS or managed-storage artwork URL"
  );
const linkSchema = z.object({
  platform: z.string().trim().max(80),
  url: safeHttpsUrl,
  isPublic: z.boolean().default(false),
});
const siteSettingsSchema = z
  .object({
    labelName: z.string().trim().min(1).max(80).optional(),
    labelIntro: z.string().max(1200).optional(),
    contactEmail: z
      .union([z.literal(""), z.string().trim().email().max(320)])
      .optional(),
    instagramUrl: z.union([z.literal(""), safeHttpsUrl]).optional(),
    youtubeUrl: z.union([z.literal(""), safeHttpsUrl]).optional(),
    soundcloudUrl: z.union([z.literal(""), safeHttpsUrl]).optional(),
    tiktokUrl: z.union([z.literal(""), safeHttpsUrl]).optional(),
    spotifyUrl: z.union([z.literal(""), safeHttpsUrl]).optional(),
    homeHeadline: z.string().trim().min(1).max(120).optional(),
    homeSubhead: z.string().max(500).optional(),
  })
  .strict();
const releaseSchema = z.object({
  id: z.number().int().positive().optional(),
  artistId: z.number().int().positive(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  releaseType: z.enum(["single", "ep", "album"]),
  releaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  genres: z.array(z.string().trim().min(1).max(80)).max(12),
  description: z.string().max(5000),
  coverUrl: artworkUrl,
  coverKey: z.string().max(512),
  publicationStatus: z.enum(["draft", "published"]),
  distributionStatus: z.enum(["pending", "scheduled", "live", "taken_down"]),
  featured: z.boolean(),
  isrc: z.string().max(32),
  upcEan: z.string().max(32),
  distributorName: z.string().max(200),
  deliveryReference: z.string().max(500),
  labelCredit: z.string().max(200),
  masterOwnershipNotes: z.string().max(5000),
  internalNotes: z.string().max(10000),
  audioMasterKey: z.string().max(512),
  officialVideoUrl: z.union([safeHttpsUrl, z.literal("")]),
  links: z.array(linkSchema).max(20),
});
const artistSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  biography: z.string().max(5000),
  genres: z.array(z.string().trim().min(1).max(80)).max(12),
  photoUrl: z.union([safeHttpsUrl, z.literal("")]),
  isPublic: z.boolean(),
  links: z
    .array(
      z.object({
        platform: z.string().trim().max(80),
        kind: z.enum(["streaming", "social", "video", "other"]),
        url: safeHttpsUrl,
        isPublic: z.boolean(),
      })
    )
    .max(30),
});

const contentRouter = router({
  home: publicProcedure.query(async () => {
    const [settings, releases] = await Promise.all([
      readSettings(),
      listPublicReleases(),
    ]);
    return { settings, releases };
  }),
  listReleases: publicProcedure
    .input(
      z
        .object({
          query: z.string().max(120).optional(),
          type: z.enum(["single", "ep", "album", "all"]).optional(),
          genre: z.string().max(80).optional(),
          sort: z.enum(["newest", "oldest"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const results = await listPublicReleases();
      const query = input?.query?.trim().toLocaleLowerCase() ?? "";
      return results
        .filter(
          item =>
            (!query ||
              `${item.title} ${item.artist?.name ?? ""}`
                .toLocaleLowerCase()
                .includes(query)) &&
            (!input?.type ||
              input.type === "all" ||
              item.releaseType === input.type) &&
            (!input?.genre || item.genres.includes(input.genre))
        )
        .sort((a, b) => {
          const order = (a.releaseDate ?? "").localeCompare(
            b.releaseDate ?? ""
          );
          return input?.sort === "oldest" ? order : -order;
        });
    }),
  release: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(({ input }) => getPublicRelease(input.slug)),
  artist: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(180) }))
    .query(({ input }) => getPublicArtist(input.slug)),
  settings: publicProcedure.query(() => readSettings()),
  contact: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(160),
        email: z.string().trim().email().max(320),
        subject: z.string().trim().min(1).max(200),
        message: z.string().trim().min(10).max(5000),
        company: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.company)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This submission could not be accepted.",
        });
      const ip = ctx.req.ip || "unknown";
      const ipHash = createHash("sha256")
        .update(`${ENV.cookieSecret}:${ip}`)
        .digest("hex");
      try {
        await submitContact({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          ipHash,
        });
        return { stored: true, emailDeliveryConfigured: false };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "We could not save this message. Please try again.",
        });
      }
    }),
});

const adminRouter = router({
  overview: adminProcedure.query(async () => {
    const [releases, artists, settings, messages] = await Promise.all([
      listAdminReleases(),
      listAdminArtists(),
      readSettings(),
      listContactRequests(),
    ]);
    return { releases, artists, settings, messages };
  }),
  saveRelease: adminProcedure
    .input(releaseSchema)
    .mutation(async ({ input }) => {
      try {
        return { id: await saveRelease(input) };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error
              ? error.message
              : "Release could not be saved.",
        });
      }
    }),
  deleteRelease: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await deleteRelease(input.id);
      return { success: true };
    }),
  saveArtist: adminProcedure.input(artistSchema).mutation(async ({ input }) => {
    try {
      return { id: await saveArtist(input) };
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          error instanceof Error ? error.message : "Artist could not be saved.",
      });
    }
  }),
  saveSettings: adminProcedure
    .input(siteSettingsSchema)
    .mutation(async ({ input }) => {
      await saveSettings(
        Object.fromEntries(
          Object.entries(input).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
      );
      return { success: true };
    }),
  uploadArtwork: adminProcedure
    .input(
      z.object({
        fileName: z.string().max(180),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        dataBase64: z.string().min(1).max(7_000_000),
      })
    )
    .mutation(async ({ input }) => {
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (!bytes.length || bytes.length > 5 * 1024 * 1024)
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Artwork must be 5 MB or smaller.",
        });
      const valid =
        input.contentType === "image/png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : input.contentType === "image/jpeg"
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP";
      if (!valid)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The image file does not match its declared format.",
        });
      const ext =
        input.contentType === "image/jpeg"
          ? "jpg"
          : input.contentType.split("/")[1];
      const uploaded = await storagePut(
        `montyx/artwork/${Date.now()}-${crypto.randomUUID()}.${ext}`,
        bytes,
        input.contentType
      );
      return { url: uploaded.url, key: uploaded.key };
    }),
  updateContactStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["new", "in_review", "resolved"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateContactStatus(input.id, input.status);
      return { success: true };
    }),
});

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  content: contentRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
