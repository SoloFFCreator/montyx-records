# MONTYX RECORDS

The MONTYX RECORDS site is a responsive React/TypeScript website with an Express/tRPC API, PostgreSQL-backed content, private Supabase Storage for approved artwork, and a private administrator dashboard. The intended live host is the Vercel project connected to this repository. Public URLs currently verified against the Vercel deployment include `https://montyxlabel.cyou`, `https://www.montyxlabel.cyou`, and the Vercel deployment alias. Source: https://github.com/SoloFFCreator/montyx-records.

## Development and deployment

Use pnpm 10.18.0 and Node 22 or newer. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, and `pnpm build`. `pnpm dev` starts the local Express/Vite application; the Vercel functions import only `server/_core/app.ts`, never the Vite development server. `vercel.json` publishes `dist/public` and sends supported browser routes to the SPA entrypoint. Vercel handles `api/` functions from the repository.

Set server-only Vercel environment variables for `POSTGRES_URL` (or `DATABASE_URL`), `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`). Keep service credentials private; never use them in client variables. Set `MONTYX_ADMIN_USERNAME`, `MONTYX_ADMIN_PASSWORD`, `MONTYX_SESSION_SECRET` (a unique random secret of at least 32 bytes), and `PUBLIC_SITE_URL=https://montyxlabel.cyou`. The signing secret is used only server-side. If it is not set, the app accepts a Supabase/Manus server-only signing key as a fallback; prefer the dedicated key. The configured administrator login is managed in Vercel's encrypted environment variables; do not copy credentials into source, documentation, issue reports, or client code. Redeploy after changing environment variables.

## Supabase schema and migrations

The app uses Supabase PostgreSQL through Drizzle. The `drizzle/schema.ts` file is the typed application schema. Reviewed, additive SQL migrations live under `supabase/migrations/` and are applied to the connected Supabase project using a migration workflow (for example, link the CLI to the existing project, then run `supabase db push`). Do not use MySQL migration files or run database DDL during Vercel function startup. The runtime startup may idempotently seed the MONTYX artist and the initial release only when those slug records are absent.

Private cover images go to the non-public `montyx-artwork` Supabase Storage bucket. The server creates the bucket on the first authorized upload if needed, with JPEG/PNG/WebP and a 3 MB limit. Public artwork is served through a stable application endpoint only after a release referencing its object key has been published. Draft files remain private; never upload unreleased audio masters to this artwork bucket.

## Administrator and release process

Open `/admin` and sign in with the configured administrator username and password. The server compares credentials without exposing them, throttles repeated failures, issues a secure HTTP-only session cookie, and authorizes every administrator operation server-side. There is no public admin signup or role escalation. Set a high-entropy `MONTYX_SESSION_SECRET` in Vercel to isolate sessions from other service credentials.

Create or edit a release and keep it as a draft while checking title, artist, date, ISRC, UPC/EAN, actual distributor, exact label credit, ownership notes, approved artwork, and destinations against authoritative source records. The seeded `MONTAGEM DA SEDUÇÃO` entry is draft-only and contains ISRC `NL9KR2145620` and UPC/EAN `8721667789184`; these identifiers and all internal delivery/ownership notes remain private. Artists retain master ownership unless a separate written agreement says otherwise. Do not claim a distributor, release status, streaming URL, partnership, certification, statistic, or achievement that has not been verified.

The five internal publication attestations (rights, metadata, distribution, artwork, and public-link verification) are submitted with the release and checked again on the server. Publishing requires all five, a date, cover art and a label credit; a non-pending status also requires the actual distributor. Public API results are explicit allowlists and omit ISRC, UPC/EAN, delivery references, internal notes, master-ownership notes, audio keys and checklist details. Only verified configured destinations are shown. This application does not deliver audio to Spotify, Apple Music, YouTube, TikTok, or other platforms; distribution remains with the configured actual distributor.

## Contact and privacy

The contact form validates submissions and stores them in the private Supabase inbox. It does not send email until an actual provider and verified label contact address are configured; the UI must not claim messages were emailed. The admin inbox supports status updates. Contact messages contain personal data: retain them only as long as operationally needed and restrict access to authorized administrators.

Privacy, Terms, and Rights/Takedown content are editable website-use drafts, not legal advice or claims of regulatory compliance. Review them against the label's actual practices and applicable law before relying on them as legal documents.

## Environment variable reference

| Variable | Purpose | Public? |
| --- | --- | --- |
| `POSTGRES_URL` or `DATABASE_URL` | Supabase PostgreSQL connection string | No |
| `SUPABASE_URL` | Supabase project API endpoint | Server only in this application |
| `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | Server-side private Storage access | No; never expose to browsers |
| `MONTYX_ADMIN_USERNAME` | Administrator login name | No |
| `MONTYX_ADMIN_PASSWORD` | Administrator password | No |
| `MONTYX_SESSION_SECRET` | High-entropy cookie/session signing key | No |
| `PUBLIC_SITE_URL` | Verified canonical origin for sitemap metadata | Yes, non-secret; server configured |
| `PORT` | Local/managed server port | Runtime-provided |

After a successful code push, verify Vercel's build and deployment events, then test `/`, `/releases`, `/artists/montyx`, `/admin`, `/api/health`, `/api/trpc/content.home`, `/robots.txt`, and `/sitemap.xml` on both the Vercel deployment URL and intended custom domain. A GitHub push by itself does not prove that a production deployment succeeded.
