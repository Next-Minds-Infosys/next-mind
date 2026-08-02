/**
 * Folder every admin-uploaded public image lands under - course covers and
 * mentor photos both use it (see /api/uploads "courseImage"/"mentorPhoto"
 * scopes). Both are teacher-side content (a course's cover, a mentor's own
 * photo), publicly readable, unrelated to per-batch LMS content.
 */
const PUBLIC_MEDIA_PREFIX = "videos/teacher/";

/** True when `value` is an S3 object key this app minted, not an external (e.g. Unsplash) URL. */
export function isPublicMediaKey(value: string) {
  return value.startsWith(PUBLIC_MEDIA_PREFIX);
}

/**
 * Resolves a stored image value (external URL or S3 key) to something an
 * `<img>`/`next/image` can load directly. S3 keys are private and only ever
 * readable through the presigned redirect at /api/media; external URLs
 * (existing Unsplash-style entries) are already directly loadable.
 */
export function publicMediaSrc(value: string | null): string | null {
  if (!value) return null;
  return isPublicMediaKey(value) ? `/api/media/${value}` : value;
}
