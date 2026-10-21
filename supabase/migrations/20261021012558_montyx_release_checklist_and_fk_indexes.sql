ALTER TABLE public.releases
  ADD COLUMN IF NOT EXISTS "releaseChecklist" jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS "artistLinks_artistId_idx"
  ON public."artistLinks" ("artistId");

CREATE INDEX IF NOT EXISTS "platformLinks_releaseId_idx"
  ON public."platformLinks" ("releaseId");

CREATE INDEX IF NOT EXISTS "releases_artistId_idx"
  ON public.releases ("artistId");
