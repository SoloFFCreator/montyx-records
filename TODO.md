# MONTYX RECORDS Distribution redesign — delivery checklist

## Public one-page distribution landing
- [x] Replace the public home page with a single scroll-first landing page for MONTYX RECORDS Distribution. Use anchored navigation for the platform network, release process, artist-first approach, FAQs, and a clear contact action. Use the existing contact/inquiry route until a real distribution signup URL is supplied; do not invent an account-registration flow.
- [x] Give the landing page a professional, mobile-first identity consistent with MONTYX RECORDS. Research popular music-distribution sites for category-level UX patterns, but do not copy any competitor’s exact interface, text, marks, artwork, signature components, screenshots, layout, or trade dress.
- [x] Include a readable set of current official marks for popular music streaming and social destinations, including names such as Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL, SoundCloud, TikTok, Instagram, Facebook, Audiomack, Pandora, Anghami, Boomplay, and JioSaavn only where appropriate. Marks identify destinations, are not represented as endorsements/partnerships, and carry a note that service availability can vary. Do not claim an exhaustive or unconditional destination list without verifying the actual supported catalog and mark-use requirements.
- [x] Explain the distribution offer and release journey plainly, retain the Nepal-rooted independent identity and applicable artist master-ownership statement, and include a compact FAQ and closing CTA. Do not invent pricing, royalty share, payment schedules, delivery times, analytics, clients, testimonials, certifications, partnerships, guarantees, platform integrations, or audience/performance statistics.
- [x] Preserve contact, legal, rights, private data and protected server-side admin procedures. Remove the public `/admin` password-login page; keep `/contact`, `/privacy`, `/terms`, and `/rights`; direct legacy `/releases`, `/releases/:slug`, `/about`, and `/artists/:slug` traffic to relevant landing sections or a clear route without deleting catalog records or making private metadata public.

## Original 3D visual and interaction
- [x] Add an original abstract signal/orbit 3D visual using Three.js/React Three Fiber, with the existing Framer Motion library for restrained interface transitions. Treat the 3D as decorative; preserve essential copy, destination names and controls as accessible HTML.
- [x] Lazy-load or defer WebGL, skip it on small/touch, data-saving/slow-connection, low-memory or low-core devices, provide a static fallback for reduced motion, keep the experience responsive, and avoid heavy always-running animation or essential text hidden in the scene.
- [x] Use only original or properly authorized visual assets; the stock-image search results with unverified reuse terms are not website assets.

## Preserved backend, security and policy pages
- [x] Remove the public `/admin` sign-in UI and password-login API, reject legacy synthetic password-admin sessions, and retain server-side role checks for management procedures. Do not expose private data or production secrets.
- [x] Preserve the Supabase PostgreSQL content, schema, storage and fail-closed access policies. Existing public data remains allowlisted; internal release fields, credentials, contracts and unreleased masters are not exposed.
- [x] Keep the existing `/contact` form's validation, spam control, and restricted stored inbox. Add a direct mail link to `support@montyxlabel.cyou`; the form itself stores messages and does not claim to email them.
- [x] Preserve `/privacy`, `/terms`, and `/rights`; maintain the statement that artists retain master ownership unless a separate written agreement says otherwise and avoid unsupported legal-compliance claims.
- [x] Do not delete or migrate Supabase records as part of this visual redesign. Keep Vercel and its production environment values unchanged.

## Routes, SEO and reliability
- [x] Ensure the root landing page has meaningful server-rendered/initial HTML, distinct title and description, Open Graph/Twitter metadata, canonical URL for the verified origin, accessible internal links, custom logo mark/favicon, sitemap, robots, and a synchronized `manus-routes.json`. The former `/admin` page returns a non-indexable 404.
- [ ] Keep root anchors and contact/legal pages loadable; ensure the retired admin path is a genuine 404. Apply legacy-route handling without breaking tRPC, API, storage or static-asset requests.
- [ ] TypeScript diagnostics, production build, and existing tests pass. Production-domain deployment and browser-facing checks still require confirmation after publish.

## Publication and handoff
- [ ] Commit and push only the intended source and documentation to `SoloFFCreator/montyx-records` `main` with a normal non-forced push. Confirm a new Vercel production deployment for the pushed commit and verify the Vercel URL plus `montyxlabel.cyou`/`www.montyxlabel.cyou` before claiming the redesign is live.
- [x] Existing code and database setup documentation is present. Add the six-site reference findings for this redesign and update the owner handoff to explain destination-mark caveats, unsupported/unknown commercial terms, the real contact route, and preserved admin/data boundaries.


## Owner-requested site refinements
- [x] Reduce work on low-end devices by skipping WebGL for small/touch screens, Save-Data/slow connections, devices with 4 GB or less reported memory, and CPUs with four or fewer cores; keep the static hero, reduced-motion support, and responsive layout.
- [x] Remove the public administrator page and password-login API; reject sessions issued by that retired password flow while keeping admin API procedures role-protected.
- [x] Add an original, transparent MONTYX record/signal logo mark, optimize it for site use, and use it for the wordmark icon and browser/touch icon.
- [x] Add `support@montyxlabel.cyou` as a direct mail link in site-wide footer and contact page without claiming the contact form sends email.
- [x] Validate with TypeScript, production build, and automated tests.
