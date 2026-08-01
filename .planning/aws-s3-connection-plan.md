# Connecting the App to AWS S3

## 0. Current State (confirmed by codebase audit)

The **application code side is already fully built** — this is not a "write the S3 integration" task, it's a "provision AWS and fill in env vars" task.

Already implemented:
- [`src/lib/s3.ts`](../src/lib/s3.ts) — S3 client, `presignUpload`/`presignView`/`presignDownload`/`deleteObject`, `buildKey()` (namespaced, collision-proof keys), `keyBelongsToBatch()` (ownership check), `isStorageConfigured()`.
- [`src/app/api/uploads/route.ts`](../src/app/api/uploads/route.ts) — mints presigned PUT URLs for direct browser→S3 uploads (bypasses Vercel's ~4.5MB serverless body limit), with a content-type allowlist per upload scope.
- [`src/app/api/media/[...key]/route.ts`](../src/app/api/media/[...key]/route.ts) — the *only* read path: checks batch membership, then redirects to a short-lived presigned GET (`presignView` inline for playback, `presignDownload` for attachments).
- [`src/components/lms/file-upload.tsx`](../src/components/lms/file-upload.tsx) — client component doing the two-step (presign → XHR PUT with progress) upload, used in instructor/student batch workspaces for videos, files, and submissions.
- DB migrations already store S3 **object keys only**, never public URLs (`src/db/migrations/20260728020000-add-lms-content.js`, `...billing-and-expenses.js`).
- `.env.example` already documents the four required vars with the security rationale (bucket must block all public access; CORS must allow PUT from the app origin).

**What's missing:** the actual AWS bucket, IAM identity, and the four env values. Checked `.env` — `AWS_REGION=ap-south-1` is set; `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` are all empty. Until they're filled, `isStorageConfigured()` returns false and every upload/media route no-ops or errors.

## 1. AWS-side provisioning

1. **Create the bucket**
   - Region `ap-south-1` (Mumbai — matches `AWS_REGION`, keeps latency low for Nepal-based users and avoids cross-region transfer cost).
   - Name: something globally-unique and non-guessable-but-descriptive, e.g. `nextminds-lms-prod` (and a separate `nextminds-lms-dev` for local/staging so a bad local test can't touch prod objects).
   - **Block all public access** — all four settings ON. Nothing in this codebase ever serves a public S3 URL; every read goes through `/api/media` → presigned GET.
   - Enable **default encryption** (SSE-S3 is sufficient; no code changes needed either way since the SDK doesn't set `ServerSideEncryption` explicitly).
   - Enable **versioning** — cheap insurance against an accidental `deleteObject` call or overwrite, given user-generated video/assignment content.

2. **Bucket CORS policy** (required — uploads are direct browser→S3 PUTs from `FileUpload`/`presignUpload`):
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://www.nextmindsinfosys.com"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
   Add the Vercel preview-deployment pattern (`https://*.vercel.app`) too if PRs get tested against real S3.

3. **Lifecycle rule (optional but recommended)**: abort incomplete multipart uploads after 1–7 days, and/or transition old objects to Infrequent Access after N days if storage cost becomes material — not required to get things working.

4. **IAM — least privilege, not root/admin keys**
   - Create a dedicated IAM user (e.g. `nextminds-app-s3`) for programmatic access only — **never use root account keys**.
   - Attach a bucket-scoped inline policy (not the AWS-managed `AmazonS3FullAccess`):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
           "Resource": "arn:aws:s3:::nextminds-lms-prod/*"
         },
         {
           "Effect": "Allow",
           "Action": ["s3:ListBucket"],
           "Resource": "arn:aws:s3:::nextminds-lms-prod"
         }
       ]
     }
     ```
   - Generate an access key pair for this user. Store nowhere except `.env` (local) and the hosting provider's encrypted env store (production) — never commit, never paste into Slack/issues.
   - If deploying on infra that supports IAM roles (ECS/EC2/Lambda) instead of Vercel, skip long-lived keys entirely — `src/lib/s3.ts` already falls back to the default credential chain when the key env vars are absent (see line `credentials: ... ? {...} : undefined`), so an attached role works with zero code changes.

## 2. App-side configuration (no code changes)

1. Fill in `.env` locally:
   ```
   AWS_REGION=ap-south-1
   S3_BUCKET=nextminds-lms-dev
   AWS_ACCESS_KEY_ID=<from the IAM user above>
   AWS_SECRET_ACCESS_KEY=<from the IAM user above>
   ```
2. Set the same four vars in the production host's environment settings (Vercel project → Settings → Environment Variables), pointing `S3_BUCKET` at the prod bucket. Keep dev/prod buckets and credentials separate so a local mistake can't delete production files.
3. Restart `pnpm dev` (env vars are read at process start / first `s3()` call).

## 3. Verification

1. `isStorageConfigured()` (`src/lib/s3.ts:40`) should now return `true` — sanity-check by hitting a page that calls it, or temporarily logging it.
2. End-to-end smoke test via the existing UI, no new code needed:
   - As an instructor: open a batch workspace (`src/app/(instructor)/instructor/batches/[id]/workspace.tsx`), upload a small test video/file through the existing `FileUpload` component, confirm the progress bar completes and no error toast appears.
   - Confirm the object actually landed in the bucket (AWS Console → bucket → the `scope/batchId/...` key from `buildKey()`).
   - As a student in that batch: open the corresponding lesson/submission view and confirm playback/download works (`video-player.tsx` / `/api/media/[...key]`) — this proves the presigned GET round-trip and the `keyBelongsToBatch` check both work.
   - As a student in a *different* batch, confirm the same media key 403s/404s (ownership check holding).
3. Check CloudTrail or S3 server access logs are quiet outside expected PUT/GET calls — catches an overly-broad CORS or bucket policy early.

## 4. Explicitly out of scope

- No new S3 client code, routes, or components — all of that already exists.
- No public asset hosting / CDN — this bucket is private-only by design (LMS video/assignment content, not marketing images). Marketing images continue to use `images.unsplash.com` per the existing `next.config` remote pattern.
- No migration of `src/data/v2-courses.json` static content — unrelated to this S3 path.
