# MONTYX RECORDS Distribution — redesign plan

**Status: owner-approved; redesign is implemented in the current working tree. The Resend credential is stored production-only in Vercel. New standalone endpoints pass local checks, but the active production deployment still has failing dynamic routes and has not yet received this repair.** The cited official-site reference review is in `docs/distribution-reference-review.md`.

## Product and architecture

Replace the public homepage with a single, scroll-first distribution landing page for MONTYX RECORDS, using its existing brand rather than inventing a separate product identity. Explain the offer, provide anchored navigation, show an illustrative selection of streaming/social destinations, describe a plain-language release journey, answer only policy-safe questions, and lead to the existing contact route. Use category-level UX patterns observed across six official distributor sites; do not reproduce any competitor's copy, artwork, logo, signature composition, button treatment, plan cards, or trade dress.

Preserve the existing React 19, TypeScript, Vite and Supabase PostgreSQL/Storage data. The owner explicitly requested removal of admin login and all application-level management access: do not expose a public `/admin` page, login, release/artist/settings CRUD, inbox, artwork-upload API, or dormant CLI for granting an administrator role. Keep existing database records and storage objects; do not delete them. Preserve `/contact`, `/privacy`, `/terms`, and `/rights`; direct retired catalogue/story URLs to relevant landing sections. The public destination marks identify examples only and do not imply endorsement, sponsorship or a confirmed per-release delivery.

Implement the form through a standalone Node/Vercel endpoint: validate and rate-limit input, persist to the private Supabase contact table first, then call Resend with a fixed recipient of `support@montyxlabel.cyou`, a validated reply-to, bounded timeout, and secret-safe logging. Return separate `stored`, `emailDeliveryConfigured`, and `emailDelivered` states; only report delivery when Resend returns an accepted message ID. If sending is unavailable, keep the stored message and provide a prefilled `mailto:` draft. The owner selected Resend and supplied a key; `RESEND_API_KEY` has been stored as a sensitive production-only Vercel variable, without replacing existing environment values. Confirm that the default sender or optional `RESEND_FROM_EMAIL` belongs to a verified Resend sending domain before treating outbound email as operational. Disclose Resend processing in the privacy notice and owner docs.

The owner says coverage exceeds 150 destinations, but the active MONTYX release has no distributor recorded and no official MONTYX distribution inventory was supplied. Do not display a 150+ claim or 150-logo wall until the actual upstream distributor/current supported-service list, territory exceptions and logo-use permissions are confirmed. Do not make up pricing, royalties, payment schedules, delivery times, analytics, customers, testimonials, certifications, partnerships, guarantees or direct DSP integrations. Use the contact form rather than inventing a signup/account flow.

Use isolated, minimal Vercel Node handlers for `/api/health`, `/api/page`, `/api/sitemap`, `/api/settings` and `/api/contact`, rather than relying on the older Express catch-all for critical public pages and contact submissions. Keep the Express/tRPC adapter separate for legacy public API routes; it is not used by the current landing/contact UI and exposes no administrator namespace. Serve the built React site from `dist/public`; do not start Vite in production. Keep static assets and Vercel rewrites/redirects aligned with the route manifest.

## Design

**Three candidate directions:** “Signal Atlas / sonic cartography” (0.08); “Analog mastering suite” (0.06); “Monumental live-room brutalism” (0.04). **Chosen:** Signal Atlas / sonic cartography.

- **Design movement:** contemporary electronic editorial design, filtered through signal mapping and restrained industrial precision.
- **Core principles:** artist-first clarity; visible destination examples; claims only when supplied or verified; high-impact visual motion with accessible fallbacks.
- **Color philosophy:** preserve MONTYX's near-black and graphite foundation, warm off-white typography and signature signal crimson. Avoid adopting another service's recognizable accent palette or layout treatment.
- **Layout paradigm:** an asymmetric text-and-orbit hero followed by wide, intentionally spaced horizontal chapters. Use a compact logo field and staggered editorial bands rather than a generic centered template or dense card grid.
- **Signature elements:** a custom M/X monogram; orbiting destination nodes around an abstract release object; thin crimson paths/topographic contours that guide the eye from creation to delivery.
- **Interaction philosophy:** anchor navigation stays direct; destination names remain readable without motion; CTAs have a clear action; no fake login, disabled-as-live buttons, modal traps, or auto-playing audio.
- **Animation:** slow, low-amplitude 3D rotation with restrained node motion; no scroll-jacking or essential information hidden in animation. Lazy-load WebGL, respect reduced motion, stop unnecessary work offscreen and use a static fallback.
- **Typography system:** reuse Space Grotesk for high-contrast display headlines and DM Sans for readable body and metadata; preserve current system fallbacks and loading behavior.
- **Brand essence:** distribution for independent music moving from Nepal toward listeners wherever they listen; direct, independent, forward.
- **Brand voice:** clear and unembellished. Example lines: “Your music. More places to be heard.” and “From Nepal. Out into the world.”
- **Wordmark & logo:** use the custom record/signal icon with the existing MONTYX RECORDS wordmark; keep the recognizable crimson accent and avoid third-party brand associations.
- **Signature brand color:** MONTYX signal crimson `#E11D35`.

## Project structure

- `client/src/pages/Home.tsx` — one-page landing composition and content sections.
- `client/src/components/distribution/` — destination marks, process steps, FAQs, closing CTA, and lazily loaded 3D visual.
- `client/src/components/SiteLayout.tsx` — shared header/footer; fetches only allowlisted social-link settings through the standalone endpoint.
- `client/src/pages/Contact.tsx` — public contact form, saved-only vs sent status, and email draft fallback.
- `api/health.ts`, `api/page.ts`, `api/sitemap.ts`, `api/settings.ts`, `api/contact.ts` — minimal standalone Vercel handlers for health, SEO, public metadata, and contact submission.
- `server/contactEmail.ts` — Resend adapter; the production key stays server-side.
- `client/src/App.tsx` and `client/public/manus-routes.json` — public routes and static page manifest, including deliberate legacy-route handling.
- `client/index.html` and `server/_core/seo.ts` — public shell, route-specific initial metadata and meaningful non-JavaScript fallback content.
- `client/public/` and `vercel.json` — custom site mark/favicon, robots/sitemap delivery and Vercel route/redirect behavior.
- `server/`, `drizzle/`, and `supabase/` — existing data/API schema and migrations, preserved without data deletion or new DDL for this landing scope.
- `docs/distribution-reference-review.md` — cited UX research behind the original design direction.

## Material constraints

The actual upstream DSP catalog and logo-use permissions have not been supplied, and the active release distributor field is blank. Verify them before publishing a 150-plus claim or 150 logos. There is no confirmed signup URL, price, royalty/payout policy, delivery SLA, analytics feature or verified customer proof; do not make those claims. Contact messages are stored in Supabase and now sent through Resend when accepted; the API key is production-only in Vercel, but sender-domain verification and a live accepted submission remain unverified. The owner requested removing admin login and all application-level management APIs; preserve private data and make `/admin` a genuine non-indexable 404. Existing production environment values remain unchanged except the added Resend secret. Third-party marks must not imply sponsorship or endorsement.
