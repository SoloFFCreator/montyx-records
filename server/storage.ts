import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "montyx-artwork";
let clientPromise: Promise<SupabaseClient> | undefined;
let bucketPromise: Promise<void> | undefined;

function getClient() {
  clientPromise ??= (async () => {
    const url =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key =
      process.env.SUPABASE_SECRET_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      "";
    if (!url || !key)
      throw new Error("Private artwork storage is not configured.");
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  })();
  return clientPromise;
}

async function ensurePrivateBucket() {
  bucketPromise ??= (async () => {
    const client = await getClient();
    const existing = await client.storage.getBucket(BUCKET);
    if (existing.data) {
      if (existing.data.public)
        throw new Error("Artwork bucket must remain private.");
      return;
    }
    if (
      existing.error &&
      !["404", "NotFound"].includes(
        String((existing.error as { statusCode?: unknown }).statusCode ?? "")
      )
    )
      throw new Error(
        `Could not inspect private artwork storage: ${existing.error.message}`
      );
    const created = await client.storage.createBucket(BUCKET, {
      public: false,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 3 * 1024 * 1024,
    });
    if (
      created.error &&
      !/already exists|duplicate/i.test(created.error.message)
    )
      throw new Error(
        `Could not create private artwork storage: ${created.error.message}`
      );
  })().catch(error => {
    bucketPromise = undefined;
    throw error;
  });
  return bucketPromise;
}

function safeObjectKey(key: string) {
  if (!/^artwork\/[a-f0-9-]{20,80}\.(?:jpg|png|webp)$/i.test(key))
    throw new Error("Invalid artwork storage key.");
  return key;
}

export async function storagePut(
  _relKey: string,
  data: Buffer | Uint8Array,
  requestedType: string = "image/jpeg"
): Promise<{ key: string; url: string }> {
  const bytes = Buffer.from(data);
  const signatureType =
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      ? "image/jpeg"
      : bytes[0] === 0x89 && bytes.subarray(1, 4).toString("ascii") === "PNG"
        ? "image/png"
        : bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
            bytes.subarray(8, 12).toString("ascii") === "WEBP"
          ? "image/webp"
          : null;
  const contentType = ["image/jpeg", "image/png", "image/webp"].includes(
    requestedType
  )
    ? (requestedType as "image/jpeg" | "image/png" | "image/webp")
    : signatureType;
  if (!signatureType || !contentType || signatureType !== contentType)
    throw new Error("Artwork bytes do not match a supported image format.");
  const ext = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
  const key = `artwork/${crypto.randomUUID()}.${ext}`;
  await ensurePrivateBucket();
  const client = await getClient();
  const result = await client.storage.from(BUCKET).upload(key, data, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (result.error)
    throw new Error(`Artwork upload failed: ${result.error.message}`);
  const signed = await client.storage
    .from(BUCKET)
    .createSignedUrl(key, 60 * 60);
  if (signed.error || !signed.data?.signedUrl)
    throw new Error(
      `Artwork preview URL could not be created: ${signed.error?.message ?? "unknown error"}`
    );
  return { key, url: signed.data.signedUrl };
}

export async function storageGetSignedUrl(key: string): Promise<string> {
  const objectKey = safeObjectKey(key);
  await ensurePrivateBucket();
  const client = await getClient();
  const result = await client.storage
    .from(BUCKET)
    .createSignedUrl(objectKey, 60 * 60);
  if (result.error || !result.data?.signedUrl)
    throw new Error(
      `Artwork preview URL could not be created: ${result.error?.message ?? "unknown error"}`
    );
  return result.data.signedUrl;
}

export async function storageDownloadPublishedObject(key: string) {
  const objectKey = safeObjectKey(key);
  await ensurePrivateBucket();
  const client = await getClient();
  const result = await client.storage.from(BUCKET).download(objectKey);
  if (result.error || !result.data)
    throw new Error(
      `Published artwork could not be retrieved: ${result.error?.message ?? "not found"}`
    );
  return result.data;
}
