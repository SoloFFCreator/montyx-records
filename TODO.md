# MONTYX RECORDS Distribution redesign — delivery checklist

## Public one-page distribution landing
- [x] Replace the public home page with a single scroll-first landing page for MONTYX RECORDS Distribution. Use anchored navigation for the platform network, release process, artist-first approach, FAQs, and a clear contact action. Use the existing contact/inquiry route until a real distribution signup URL is supplied; do not invent an account-registration flow.
- [x] Give the landing page a professional, mobile-first identity consistent with MONTYX RECORDS. Research popular music-distribution sites for category-level UX patterns, but do not copy any competitor’s exact interface, text, marks, artwork, signature components, screenshots, layout, or trade dress.
- [x] Include a readable set of current official marks for popular music streaming and social destinations, including names such as Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, TIDAL, SoundCloud, TikTok, Instagram, Facebook, Audiomack, Pandora, Anghami, Boomplay, and JioSaavn only where appropriate. Marks identify destinations, are not represented as endorsements/partnerships, and carry a note that service availability can vary. Do not claim an exhaustive or unconditional destination list without verifying the actual supported catalog and mark-use requirements.
- [x] Explain the distribution offer and release journey plainly, retain the Nepal-rooted independent identity and applicable artist master-ownership statement, and include a compact FAQ and closing CTA. Do not invent pricing, royalty share, payment schedules, delivery times, analytics, clients, testimonials, certifications, partnerships, guarantees, platform integrations, or audience/performance statistics.
- [x] Preserve existing admin, contact, legal, rights and private data. Keep `/admin`, `/contact`, `/privacy`, `/terms`, and `/rights`; direct legacy `/releases`, `/releases/:slug`, `/about`, and `/artists/:slug` traffic to relevant landing sections or a clear route without deleting catalog records or making private metadata public.

## Original 3D visual and interaction
- [x] Add an original abstract signal/orbit 3D visual using Three.js/React Three Fiber, with the existing Framer Motion library for restrained interface transitions. Treat the 3D as decorative; preserve essential copy, destination names and controls as accessible HTML.
- [x] Lazy-load or defer WebGL, provide a useful static fallback for unsupported devices and reduced motion, keep the experience touch-friendly and responsive, and avoid autoplay audio, scroll-jacking, heavy always-running animation, or essential text hidden in the scene.
- [x] Use only original or properly authorized visual assets; the stock-image search results with unverified reuse terms are not website assets.

## Preserved backend, security and policy pages
- [x] Keep `/admin` private and authentication-protected, with supported sessions, logout, protected server-side operations, no public access, no production secrets hardcoded in source, and no public admin signup.
- [x] Preserve the Supabase PostgreSQL content, schema, storage and fail-closed access policies. Existing public data remains allowlisted; internal release fields, credentials, contracts and unreleased masters are not exposed.
- [x] Keep the existing `/contact` form's validation, spam control, and administrator-only stored inbox. Email delivery is not configured; the interface must continue to say messages are stored rather than claiming email was sent or inventing an address.
- [x] Preserve `/privacy`, `/terms`, and `/rights`; maintain the statement that artists retain master ownership unless a separate written agreement says otherwise and avoid unsupported legal-compliance claims.
- [x] Do not delete or migrate Supabase records as part of this visual redesign. Keep Vercel and its production environment values unchanged.

## Routes, SEO and reliability
- [x] Ensure the root landing page has meaningful server-rendered/initial HTML, distinct title and description, Open Graph/Twitter metadata, canonical URL for the verified origin, accessible internal links, custom icon, sitemap, robots, and a synchronized `manus-routes.json`. Keep private admin content noindex and preserve correct HTTP statuses for unknown paths.
- [ ] Update Vercel route handling and browser navigation so root anchors and preserved contact/legal/admin pages load directly and refresh correctly. Apply legacy-route handling without breaking tRPC, API, storage or static-asset requests.
- [ ] Verify TypeScript diagnostics, build and existing tests; inspect narrow mobile layouts, reduced-motion behavior and 3D fallback; run production-mode HTTP checks for landing HTML/metadata, legacy paths, contact/legal/admin routing, sitemap, robots and genuine 404s.

## Publication and handoff
- [ ] Commit and push only the intended source and documentation to `SoloFFCreator/montyx-records` `main` with a normal non-forced push. Confirm a new Vercel production deployment for the pushed commit and verify the Vercel URL plus `montyxlabel.cyou`/`www.montyxlabel.cyou` before claiming the redesign is live.
- [x] Existing code and database setup documentation is present. Add the six-site reference findings for this redesign and update the owner handoff to explain destination-mark caveats, unsupported/unknown commercial terms, the real contact route, and preserved admin/data boundaries.
