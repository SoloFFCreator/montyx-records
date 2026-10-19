# MONTYX RECORDS website

A responsive official website and private release-management dashboard for MONTYX RECORDS. The source is React/TypeScript with an Express/tRPC API, Drizzle ORM and the managed MySQL database. The current deployment project uses managed Webdev services and object storage; Supabase is not provisioned. Migrations are committed under `drizzle/`. Source repository: https://github.com/SoloFFCreator/montyx-records.

## Local development

The project uses pinned pnpm 10.18.0. In the managed project environment, `DATABASE_URL`, Manus OAuth settings and managed-storage service variables are supplied by the host. For a schema change, update the Drizzle schema/relations, generate a migration with `pnpm exec drizzle-kit generate`, inspect the SQL, then apply it with `pnpm db:migrate`. Avoid direct `db:push` against the shared managed database. The development server is `pnpm dev`; the production build is `pnpm build`. For a direct production start, `pnpm start` applies pending migrations first and then starts the server. Never add secret values to this repository or browser bundle.

The production container builds without needing the database URL at image-build time. At runtime, it runs the migration ledger and only then starts the app. The initial MONTYX artist profile and `MONTAGEM DA SEDUÇÃO` release are inserted idempotently when the database tables are available. The release begins as a draft with distribution status `pending`; it is not in the public catalogue until an authorized admin verifies details and explicitly publishes it.

## First administrator

1. Open `/admin` and sign in with the Manus account that should administer the label. This creates an ordinary authenticated user record, not an admin account.
2. In a trusted project-owner terminal with the project database environment loaded, run `pnpm admin:bootstrap`. Choose the existing account belonging to the label owner and type the requested confirmation phrase. The script refuses to run if an admin already exists, and it cannot create or promote an account through a public website endpoint. In a non-interactive terminal, pass `pnpm admin:bootstrap -- --open-id <existing-oauth-open-id>` after confirming the exact ID in the secure project environment.
3. Refresh `/admin`. Future elevated-role changes must be performed through a trusted database/operator path; no public signup or public role-management control exists.

Retain access to the secure project terminal/database credentials. Do not put OAuth tokens, database URLs or the identity reference in source control or public support messages.

## Admin workflow for a release

In `/admin`, create or open a release, enter title, artist, slug, release type/date, genres and description, then save as a draft. The requested initial entry is pre-seeded with ISRC `NL9KR2145620` and UPC/EAN `8721667789184`; both remain private. Confirm all identifiers, release date, distributor, exact label credit, artist permissions and ownership terms against the actual source records. Upload approved artwork through the authenticated dashboard. Add only real HTTPS platform links, mark only intended verified links `public`, set distribution status only when confirmed, and use “Preview release” in the editor. Only then choose `Published`; the interface asks for an explicit confirmation. Drafts, delivery references, private master notes, audio storage references and contracts are never returned by public endpoints.

Use the catalogue filters and public release page to check the result after publishing. Unconfigured services and social destinations do not render as links. No play counts, audience statistics, reviews or playlist placements are generated.

## Contact form

Contact messages are validated and saved to the database inbox at `/admin`. The contact form does not currently send email: no SMTP/provider credentials or label email address were supplied. Success copy explicitly says the message was stored, not emailed. Set a verified contact email in Label settings before exposing a `mailto:` route. If email forwarding is added later, use protected server-side credentials and add delivery/error tracking; do not place credentials in browser variables. The form uses a honeypot and allows at most five messages per rate-limit hash per 15 minutes.

## Environment variables

| Name | Purpose | Source |
| --- | --- | --- |
| `DATABASE_URL` | Managed MySQL connection; server-side only | Provisioned by the managed project |
| `MANUS_PROJECT_ID` | OAuth application ID | Provisioned by the managed project |
| `MANUS_OAUTH_PORTAL_URL` | Browser authorization portal | Provisioned by the managed project |
| `MANUS_OAUTH_API_URL` | Server token exchange/user lookup | Provisioned by the managed project |
| `MANUS_JWT_SECRET` | Platform session validation/signing | Provisioned by the managed project |
| `MANUS_API_URL` | Managed service endpoint for storage | Provisioned by the managed project |
| `MANUS_API_KEY` | Server-only storage authorization | Provisioned by the managed project |
| `PUBLIC_SITE_URL` | Verified HTTPS root origin used for canonical/social metadata and dynamic sitemap/robots output | Set only after the public origin is verified; currently absent. Until then, the safe sitemap is empty and robots disallow crawling. |
| `PORT` | HTTP listener port | Set by the managed host (default 3000) |

`OWNER_OPEN_ID`, SMTP keys and external email-provider keys are not currently configured. Admin bootstrap uses an existing OAuth identity in the database rather than a production password.

## Rights, privacy and operations

The label’s policies are website-use drafts and do not claim legal compliance. Streaming services have their own terms. Artists retain master ownership unless a separate written agreement states otherwise; a label credit does not establish master ownership. Store actual agreements outside the public site and never upload unreleased audio through the public contact form.

The domain `montyxlabel.cyou` currently displays a NicNames parked page. The Webdev project has no custom-domain mapping, and no registrar/DNS credential is available in this session. After the published host provides its expected DNS target, the domain owner must configure those records at the registrar (or provide authorized DNS access); root and `www` HTTPS must then be tested. Until then, the managed host is not the custom-domain site. Do not claim the domain is deployed based solely on source or Preview.
