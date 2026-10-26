import { COOKIE_NAME } from "@shared/const";
import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { sendContactEmail } from "./contactEmail";
import {
  getPublicArtist,
  getPublicRelease,
  listPublicReleases,
  readSettings,
  submitContact,
} from "./content";

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
        const emailDeliveryConfigured = Boolean(
          process.env.RESEND_API_KEY?.trim()
        );
        const emailDelivered = await sendContactEmail(input);
        return { stored: true, emailDeliveryConfigured, emailDelivered };
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
});

export type AppRouter = typeof appRouter;
