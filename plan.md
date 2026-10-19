# MONTYX RECORDS — implementation plan

## Product and architecture

Build the complete official, responsive MONTYX RECORDS site in the initialized managed Webdev project. The project is React 19 + TypeScript + Vite, Express, tRPC, Drizzle, and the provisioned managed MySQL database. The database is the supported backend in this environment; Supabase is not provisioned. Keep public content and internal administration on the same server, with public reads restricted to published content and write procedures guarded by an authenticated administrator role. Use the supplied Manus OAuth flow for identity, and do not offer public account creation. Keep secrets server-side.

Model artists, releases, platform links, settings, and contact messages using committed, additive Drizzle SQL migrations. Seed only the requested MONTYX release as a draft, without making its verification-sensitive distributor, label credit, identifiers, links, artwork, or status public. Public release pages will omit unconfigured streaming links and private metadata. The owner/admin dashboard will manage drafts, publication state, release metadata, platform links, artwork references, site settings, and the private contact inbox. Artwork uploads go through a server-authorized managed-storage path and store stable asset references. Contact form submissions persist to the database with validation and spam controls; no email address or SMTP integration is assumed. Document the missing email-delivery setup and offer a mail link only when the owner has supplied an address.

Serve the requested routes: `/`, `/releases`, `/releases/:slug`, `/about`, `/artists/montyx`, `/contact`, `/privacy`, `/terms`, `/rights`, and `/admin`, including a not-found state. Use route-aware metadata, sitemap and robots files, responsive social metadata, a custom favicon, and meaningful initial HTML for public routes. Maintain internal links, search/filter/sort, and safe share links. Keep admin-only views out of public search.

The Webdev server capability and managed database are enabled. Package deployment through the managed server/container route after a successful checkpoint; test the built server and health endpoint. Publish using the available managed host, then configure the requested domain only if the project dashboard exposes a supported mapping and the necessary registrar/DNS access is available. The domain currently resolves to a parked NicNames page; no registrar credentials or domain mapping are present. Do not claim custom-domain or HTTPS success before testing.

## GitHub delivery

Use the explicitly selected existing public repository `SoloFFCreator/minimax-code-termux`. Replace its tracked project files on `main` with the complete site source, while preserving the existing commit history and using a normal non-forced push. Rename the repository slug to `montyx-records` (the human-readable title is MONTYX RECORDS). The web project remains in its managed project workspace and is deployed through its supported host; GitHub receives the website source, not secrets or generated database contents.

## Design

- **Design movement:** contemporary electronic-label editorial design with restrained industrial/club-culture cues.
- **Core principles:** confident hierarchy; spacious dark composition; real information only; mobile-first usability.
- **Color philosophy:** near-black and graphite give the music room; a deep crimson signal marks key actions and moments; white and cool-gray type preserve clarity.
- **Layout paradigm:** wide editorial bands and asymmetric image/text splits, followed by compact release rows and a deliberate catalogue grid.
- **Signature elements:** a custom angular M/X monogram; thin crimson waveform/divider strokes; small tracked uppercase metadata labels.
- **Interaction philosophy:** links and controls feel precise and direct; obvious focus rings, clear statuses, and no fake or disabled-as-if-live actions.
- **Animation:** short opacity/position transitions and subtle waveform movement only; disable nonessential motion with `prefers-reduced-motion`.
- **Typography system:** a strong geometric display face with a neutral sans-serif body stack; oversized condensed-feeling uppercase headlines, readable body copy, and carefully spaced metadata. Preserve system-font fallbacks for slow connections.
- **Brand essence:** independent electronic sound from Nepal, built with its own identity; bold, exacting, independent.
- **Brand voice:** direct and unembellished. Examples: “INDEPENDENT SOUND. NO LIMITS.” and “New music, when it’s ready to be heard.”
- **Wordmark & logo:** custom drawn angular M/X monogram paired with a purpose-spaced MONTYX RECORDS wordmark; do not rely on generated lettering.
- **Signature brand color:** signal crimson `#E11D35`.

## Project structure

- `client/src/pages/` — public route pages and admin dashboard.
- `client/src/components/` — shared navigation, footer, release cards, forms, and admin controls.
- `client/src/lib/` — typed tRPC client and safe browser helpers.
- `client/public/` — original visual assets, favicon, route manifest, and gateway-compatible small static assets.
- `server/_core/` — existing Express, OAuth, and server runtime.
- `server/routers.ts` — authenticated and public tRPC procedures.
- `server/db.ts` and `drizzle/` — database queries, schema, and committed migrations.
- `scripts/` — controlled seed/bootstrap and operational commands with no embedded secrets.
- Root docs — deployment, environment, migrations, first-admin bootstrap, content workflow, privacy/rights/terms text, and this implementation plan.

## Material constraints

The domain `montyxlabel.cyou` currently shows a NicNames parked page; the active Webdev project has no deployment or custom-domain mapping yet. The account/DNS provider is not connected. External email delivery credentials are absent. The contact backend will still receive and persist form submissions; email delivery and the custom domain will remain explicitly unverified until owner setup is available. Never expose service-role credentials, unreleased audio, private notes, unverified release metadata, or invented business claims.
