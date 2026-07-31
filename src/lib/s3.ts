import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3 access.
 *
 * The bucket must block all public access. Nothing is ever served from a public
 * URL - the browser only ever receives a presigned URL that this server minted
 * *after* checking the caller's batch membership.
 *
 * Uploads are presigned PUTs so the file goes browser -> S3 directly. Routing
 * them through a Next handler is not an option: Vercel caps a serverless
 * request body at roughly 4.5 MB, which a lecture recording blows past.
 */

const REGION = process.env.AWS_REGION ?? "ap-south-1";
export const S3_BUCKET = process.env.S3_BUCKET ?? "";

let client: S3Client | null = null;

function s3() {
  if (!client) {
    if (!S3_BUCKET) {
      throw new Error("S3_BUCKET is not set - file features are unavailable. See .env.example.");
    }
    client = new S3Client({
      region: REGION,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined, // fall back to the instance/role credential chain
    });
  }
  return client;
}

export function isStorageConfigured() {
  return Boolean(S3_BUCKET);
}

/** Namespaced, collision-proof object key. */
export function buildKey(scope: string, batchId: string, filename: string) {
  const safe = filename
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(-120);
  return `${scope}/${batchId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safe}`;
}

/**
 * Confirms a key the client handed back really is one this batch was allowed to
 * upload. /api/uploads mints `<scope>/<batchId>/...` and never accepts a key
 * from the caller - but the *action* that stores the key does receive it, so
 * without this an instructor could attach another batch's object to their own
 * lesson and expose it to their students through /api/media.
 */
export function keyBelongsToBatch(key: string, scope: string, batchId: string) {
  return key.startsWith(`${scope}/${batchId}/`) && !key.includes("..");
}

/** Presigned PUT for a direct browser upload. */
export async function presignUpload(key: string, contentType: string, expiresIn = 900) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn },
  );
}

/**
 * Presigned GET.
 *
 * `inline` streams in the player instead of triggering a save dialog - the
 * "watch only" behaviour. It is a deterrent, not protection: within the URL's
 * lifetime the object can still be fetched directly. Keep the window short.
 */
export async function presignView(key: string, expiresIn = 600) {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ResponseContentDisposition: "inline",
    }),
    { expiresIn },
  );
}

/** Presigned GET that deliberately downloads - used for assignment briefs. */
export async function presignDownload(key: string, filename: string, expiresIn = 600) {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
    }),
    { expiresIn },
  );
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}
