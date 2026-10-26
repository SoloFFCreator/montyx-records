# MONTYX RECORDS Distribution redesign — delivery checklist

## Public one-page distribution landing

- [x] Replace the public home page with a single scroll-first landing page for MONTYX RECORDS Distribution. Use anchored navigation for the destination network, release process, artist-first approach, FAQs, and a clear contact action. Use the existing contact/inquiry route until a real distribution signup URL is supplied; do not invent an account-registration flow.
- [x] Give the landing page a professional, mobile-first identity consistent with MONTYX RECORDS. Research popular music-distribution sites for category-level UX patterns, but do not copy any competitor’s exact interface, text, marks, artwork, signature components, screenshots, layout, or trade dress.
- [x] Include readable official marks for popular music streaming and social destinations, including Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL, SoundCloud, TikTok, Instagram, Facebook, Audiomack, Pandora, Anghami, Boomplay, and JioSaavn only where appropriate. Marks identify destinations, are not represented as endorsements/partnerships, and carry an availability caveat. Do not claim an exhaustive or unconditional destination list without verifying the actual supported catalog and mark-use requirements.
- [x] Explain the distribution offer and release journey plainly, retain the Nepal-rooted independent identity and applicable artist master-ownership statement, and include a compact FAQ and closing CTA. Do not invent pricing, royalty share, payment schedules, delivery times, analytics, clients, testimonials, certifications, partnerships, guarantees, platform integrations, or audience/performance statistics.
- [x] Preserve contact, legal, rights and private data. Remove the public `/admin` page and all application-level management APIs; keep `/contact`, `/privacy`, `/terms`, and `/rights`; direct legacy `/releases`, `/releases/:slug`, `/about`, and `/artists/:slug` traffic to relevant landing sections without deleting catalog records or making private metadata public.

## Original 3D visual and interaction

- [x] Add an original abstract signal/orbit 3D visual using Three.js/React Three Fiber, with existing Framer Motion for restrained transitions. Treat 3D as decorative; preserve essential copy, destination names and controls as accessible HTML.
- [x] Defer WebGL and skip it on small/touch, data-saving/slow-connection, low-memory or low-core devices; retain static/reduced-motion fallbacks, responsive layout and no heavy always-running animation.
- [x] Use only original or properly authorized visual assets; do not use stock-search images without verified reuse terms.

## Preserved backend, security and policy pages

- [x] Remove the public `/admin` UI, password-login API, mounted CRUD/inbox/settings API namespace and dormant administrator-bootstrap CLI; reject legacy synthetic password-admin sessions. Do not expose private data or production secrets.
- [x] Preserve Supabase PostgreSQL content, schema, storage and fail-closed access policies. Keep existing records; do not expose internal release fields, credentials, contracts or unreleased masters.
- [ ] Keep `/contact` validation, spam control and restricted message storage; save to Supabase first, then deliver through Resend to `support@montyxlabel.cyou` only when the configured verified sender is accepted. The production-only `RESEND_API_KEY` is now stored in Vercel; sender-domain verification and live provider acceptance remain to be confirmed. Report saved-only if the provider does not accept a message and retain the prefilled email draft fallback.
- [x] Preserve `/privacy`, `/terms`, and `/rights`; retain the statement that artists retain master ownership unless a separate written agreement says otherwise and avoid unsupported legal-compliance claims.
- [x] Preserve all existing Vercel environment values; add only the new sensitive production `RESEND_API_KEY`. No Supabase records or storage objects were deleted.

## Routes, SEO and reliability

- [x] Provide meaningful initial landing metadata, distinct title/description, Open Graph/Twitter metadata, canonical URL for the verified origin, accessible links, custom logo/favicon, sitemap, robots, and synchronized `manus-routes.json`. `/admin` is a non-indexable 404 in server-rendered page logic.
- [ ] Repair production serverless 500s. New standalone Vercel handlers now isolate health, page SEO HTML, sitemap, public social settings and contact from the legacy Express catch-all; this source change is not yet deployed, so live route confirmation remains open.
- [x] TypeScript diagnostics, production build, and 20 automated tests pass locally. [ ] Confirm production-domain deployment and browser-facing routes after publishing.

## Publication and handoff

- [ ] Commit and push intended source/documentation to `SoloFFCreator/montyx-records` `main` with a normal non-forced push. Confirm a new Vercel production deployment and verify the deployment URL plus `montyxlabel.cyou`/`www.montyxlabel.cyou` before claiming the repair is live.
- [x] Keep the cited six-site review and owner handoff documenting destination-mark caveats, unsupported/unknown commercial terms, the real contact route, and preserved data/admin boundaries.

## Owner-requested site refinements

- [x] Skip WebGL on small/touch screens, Save-Data/slow connections, devices reporting 4 GB or less memory, and CPUs with four or fewer cores; keep static hero, reduced-motion support and responsive layout.
- [x] Remove public administrator page, password-login API, mounted admin CRUD/inbox/settings procedures and dormant administrator-bootstrap CLI; reject sessions from the retired password flow without deleting Supabase records.
- [x] Add the original transparent MONTYX record/signal logo mark and use it for the wordmark icon and browser/touch icon.
- [x] Add `support@montyxlabel.cyou` as a site-wide direct mail link and contact page address; provide a prefilled device email draft when automatic delivery is unavailable.

## Owner-requested repair — 2026-10-26

- [ ] Fix and verify production routes currently returning `FUNCTION_INVOCATION_FAILED`. The active deployment is still commit `739166f`; its dynamic page/API checks currently return 500. Vercel runtime logs are unavailable on the Hobby retention window, so the specific platform exception is not yet evidenced.
- [ ] Deploy the new independent Vercel route handlers and verify health, contact, settings, sitemap, legal pages, `/admin` 404, and normal static assets. The old `/api/trpc` Express adapter remains separate; active landing/contact UI no longer depends on it.
- [ ] Verify Resend's configured `support@montyxlabel.cyou` sender domain and an actual form submission after deployment. Key setup is complete, but provider acceptance has not yet been observed.
- [ ] Expand destination marks/count beyond the illustrative set only after identifying MONTYX's real upstream distributor and validating its official current services, territory exceptions and mark permissions. The active MONTAGEM release has no `distributorName`; do not attribute another distributor's catalog to MONTYX.
