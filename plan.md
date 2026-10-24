# MONTYX RECORDS Distribution — redesign plan (draft)

**Status: awaiting the owner's confirmation before application implementation.** The official-site reference review is in `docs/distribution-reference-review.md`.

## Product and architecture

Replace the public homepage with a single, scroll-first distribution landing page for MONTYX RECORDS, using the existing brand rather than inventing a separate product identity. The page will explain the offer, provide anchored navigation, display a carefully selected set of supported streaming/social destinations, describe a simple release journey, answer only policy-safe questions, and lead to the existing contact/inquiry route. Its structure draws on common category patterns observed across six official distributor sites; it will not reproduce any one company's copy, artwork, logo, signature composition, buttons, plan cards, or trade dress.

Use the current React 19, TypeScript, Vite and Express/tRPC application and keep the existing Supabase PostgreSQL, Storage and private admin integration. Keep `/contact`, `/privacy`, `/terms`, and `/rights`; remove the public `/admin` sign-in page while retaining server-side role checks on management procedures. The public catalogue, artist profile and label-story pages will no longer be in the primary navigation; legacy `/releases`, `/releases/:slug`, `/about`, and `/artists/:slug` requests should route visitors to relevant sections of the new landing page rather than deleting any database records. Keep private admin access server-authorized and keep the contact form's existing stored-in-inbox behavior and honest email-delivery notice. No new schema or data deletion is part of this redesign.

The landing page will have a benefit-led hero; an accessible destination-mark section; a concise explanation of distribution; a three-step release path; an artist-first statement grounded in the existing master-ownership policy; a compact FAQ that avoids unconfirmed operational details; and a closing contact CTA. The user has stated that MONTYX distributes to every popular streaming platform and more. A representative group of current official marks may identify supported destinations, but the exhaustive coverage wording, exact current partner/destination list, availability by territory, and permitted use of each mark must be confirmed before those claims are published. Brand marks identify destinations only and will not imply endorsement.

Do not invent MONTYX pricing, royalty shares, payment schedules, release delivery times, analytics, named clients/artists, usage statistics, testimonials, certifications, partnerships, guarantees, or direct platform integrations. Do not promise a signup/account creation path that does not exist; use the real contact form as the conversion route unless the owner supplies a working distribution onboarding URL.

For the hero, use a custom, abstract signal/orbit visual implemented as a lazy-loaded React Three Fiber/Three.js scene. Framer Motion is already installed and can provide restrained interface transitions. Defer WebGL work until needed; keep the destination names and page meaning in accessible HTML; provide a lightweight static/CSS fallback when WebGL is unavailable. Skip WebGL on small or touch devices, data-saving/slow connections, low-memory or low-core devices, and when reduced motion is requested. Do not use the downloaded stock-search images as website art because a reuse license was not established.

Use route-aware server-rendered initial metadata and a text-bearing SEO fallback for the landing page. Update the Vercel route mapping, SPA behavior, `robots.txt`, sitemap and `manus-routes.json` to reflect the public page set, with no public admin page and preserved legal/contact routes. Keep canonical and social URLs on the verified `https://montyxlabel.cyou` origin. Retain the deployed Vercel project, current GitHub repository `SoloFFCreator/montyx-records`, Supabase project and all production environment values; no new secrets or provider changes are planned. Build and deploy the approved source to the existing Vercel production site after testing.

## Design

**Three candidate directions:** “Signal Atlas / sonic cartography” (0.08); “Analog mastering suite” (0.06); “Monumental live-room brutalism” (0.04). **Chosen:** Signal Atlas / sonic cartography.

- **Design movement:** contemporary electronic editorial design, filtered through signal mapping and restrained industrial precision.
- **Core principles:** artist-first clarity; visible destination coverage; claims only when supplied or verified; high-impact visual motion with accessible fallbacks.
- **Color philosophy:** preserve MONTYX’s near-black and graphite foundation, warm off-white typography, and signature signal crimson. Avoid adopting another service's recognizable accent palette or layout treatment.
- **Layout paradigm:** an asymmetric text-and-orbit hero followed by wide, intentionally spaced horizontal chapters. Use a compact logo field and staggered editorial bands rather than a generic centered template or dense card grid.
- **Signature elements:** a custom M/X monogram; orbiting destination nodes around an abstract release object; thin crimson paths/topographic contours that guide the eye from creation to delivery.
- **Interaction philosophy:** anchor navigation stays direct; destination names remain readable without motion; CTAs have a clear action; no fake login, disabled-as-live buttons, modal traps, or auto-playing audio.
- **Animation:** a slow, low-amplitude 3D rotation with restrained node motion; no scroll-jacking or essential information hidden in animation. Lazy-load the WebGL scene, respect `prefers-reduced-motion`, stop unnecessary work when offscreen, and use a static fallback.
- **Typography system:** reuse Space Grotesk for high-contrast display headlines and DM Sans for readable body and metadata; preserve current system fallbacks and loading behavior.
- **Brand essence:** distribution for independent music moving from Nepal toward listeners wherever they listen; direct, independent, forward.
- **Brand voice:** clear and unembellished. Example lines: “Your music. More places to be heard.” and “From Nepal. Out into the world.”
- **Wordmark & logo:** use the custom record/signal icon with the existing MONTYX RECORDS wordmark; keep the recognizable crimson accent and avoid third-party brand associations.
- **Signature brand color:** MONTYX signal crimson `#E11D35`.

## Project structure

- `client/src/pages/Home.tsx` — one-page landing composition and content sections.
- `client/src/components/distribution/` — landing header, destination-logo field, release steps, FAQs, closing CTA, and lazily loaded 3D visual.
- `client/src/lib/` — destination icon metadata, accessible link helpers, and existing tRPC client.
- `client/src/pages/Contact.tsx` and `Legal.tsx` — public contact and legal pages; administrator sign-in UI is not part of the public site.
- `client/src/App.tsx` and `client/public/manus-routes.json` — public routes and static page manifest, including deliberate legacy-route handling.
- `client/index.html` and `server/_core/seo.ts` — public shell, route-specific initial metadata and meaningful non-JavaScript fallback content.
- `client/public/` and `vercel.json` — custom site mark/favicon, robots/sitemap delivery and Vercel route/redirect behavior.
- `server/`, `drizzle/`, and `supabase/` — existing APIs, data schema and migrations, preserved without data deletion or new DDL for this landing-page scope.
- `docs/distribution-reference-review.md` — cited UX research behind the original design direction.

## Material constraints

The actual current DSP delivery catalog and logo-use permissions have not yet been independently supplied; verify both before publishing an exhaustive network claim. There is no confirmed distribution signup URL, pricing, royalty/payout policy, delivery SLA, analytics feature, or verified customer proof; the landing page will not make those claims. The contact form stores submissions but does not email them; show `support@montyxlabel.cyou` as a direct mail link. The public admin password login is removed and legacy synthetic password sessions are rejected; protected management procedures remain role-checked. Preserve project data and unrelated provider credentials. Third-party streaming marks are trademarks of their respective owners and their display must not imply sponsorship or endorsement. Changes stay within the existing GitHub/Vercel/Supabase setup and must preserve all existing administrator credentials, project environment values and user data.
