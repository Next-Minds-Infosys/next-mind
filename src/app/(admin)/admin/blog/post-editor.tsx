"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { postSchema, type PostFormValues, type PostInput } from "@/lib/schemas";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { FileUpload } from "@/components/lms/file-upload";
import { publicMediaSrc } from "@/lib/media-image";
import { estimateReadTime, slugify } from "@/lib/utils";
import { createPost, updatePost } from "./actions";

const CATEGORIES = ["Career", "Technology", "Industry", "Tutorials"];

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";
const box = "space-y-4 rounded-2xl bg-white p-5 ring-1 ring-gray-950/5";

type SeoStatus = "good" | "bad";
type SeoCheck = { status: SeoStatus; message: string };

const check = (ok: boolean, good: string, bad: string): SeoCheck =>
  ok ? { status: "good", message: good } : { status: "bad", message: bad };

function SeoStatusIcon({ status }: { status: SeoStatus }) {
  return status === "good" ? (
    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-600" />
  ) : (
    <XCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
  );
}

export function PostEditor({ initial }: { initial?: PostInput & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  // A new post has no id yet to namespace the S3 cover upload under.
  const [draftId] = useState(() => initial?.id ?? crypto.randomUUID());

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues, unknown, PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: initial ?? {
      title: "",
      slug: "",
      excerpt: "",
      contentMd: "",
      category: "Career",
      emoji: "📝",
      coverKey: "",
      authorName: "",
      featured: false,
      published: false,
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
    },
  });

  const err = (n: keyof PostFormValues) =>
    errors[n] && <p className="mt-1 text-xs text-red-600">{errors[n]?.message}</p>;

  const values = useWatch({ control }) as PostFormValues;
  const contentMd = values.contentMd || "";
  const slugPreview = slugify(values.slug || values.title || "");
  const seoTitle = values.metaTitle || values.title || "";
  const seoDescription = values.metaDescription || values.excerpt || "";
  const readTime = estimateReadTime(contentMd);
  const wordCount = contentMd.trim().split(/\s+/).filter(Boolean).length;
  const keyword = (values.focusKeyword || "").trim().toLowerCase();

  const checks: SeoCheck[] = [
    check(
      seoTitle.length >= 40 && seoTitle.length <= 60,
      "SEO title length is good for search results.",
      seoTitle.length === 0
        ? "SEO title is empty."
        : seoTitle.length < 40
          ? "SEO title is short — aim for 40-60 characters."
          : "SEO title is long and may be truncated in search results.",
    ),
    check(
      seoDescription.length >= 120 && seoDescription.length <= 156,
      "Meta description length is good for search results.",
      seoDescription.length === 0
        ? "Meta description is empty."
        : seoDescription.length < 120
          ? "Meta description is short — aim for 120-156 characters."
          : "Meta description is long and may be truncated.",
    ),
    check(wordCount >= 300, "Content is a healthy length for SEO.", `Content is only ${wordCount} words — aim for at least 300.`),
  ];

  if (keyword) {
    checks.unshift(
      check(
        contentMd.toLowerCase().includes(keyword),
        "Focus keyword appears in the content.",
        "Focus keyword is missing from the content body.",
      ),
      check(
        slugPreview.includes(slugify(keyword)),
        "Focus keyword appears in the URL slug.",
        "Focus keyword is missing from the URL slug.",
      ),
      check(
        seoDescription.toLowerCase().includes(keyword),
        "Focus keyword appears in the meta description.",
        "Focus keyword is missing from the meta description.",
      ),
      check(
        seoTitle.toLowerCase().includes(keyword),
        "Focus keyword appears in the SEO title.",
        "Focus keyword is missing from the SEO title.",
      ),
    );
  }

  async function onSubmit(v: PostInput) {
    setServerError("");
    const r = initial ? await updatePost(initial.id, v) : await createPost(v);
    if ("error" in r) return setServerError(r.error);
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back to posts"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {initial ? "Edit post" : "Add new post"}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-gray-950/5">
          <div>
            <input
              {...register("title")}
              placeholder="Add title"
              className="w-full border-0 bg-transparent p-0 font-display text-3xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-0"
            />
            {err("title")}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
              <span>Permalink:</span>
              <span className="text-gray-400">/blog/</span>
              {editingSlug ? (
                <>
                  <input
                    {...register("slug")}
                    placeholder={slugify(values.title || "")}
                    className="rounded-lg bg-gray-50 px-2 py-1 text-sm text-gray-700 ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingSlug(false)}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    OK
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-700">
                    {slugPreview || "your-post-title"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingSlug(true)}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          <Controller
            control={control}
            name="contentMd"
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Write the article…"
              />
            )}
          />
          <p className="text-xs text-gray-400">
            {wordCount} words · {readTime}
          </p>

          <div className="space-y-1.5 border-t border-gray-950/5 pt-5">
            <label className={label}>Excerpt</label>
            <textarea rows={2} {...register("excerpt")} className={input} />
            <p className="text-xs text-gray-500">The blurb shown on the blog card.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={box}>
            <h2 className="font-semibold text-gray-900">Publish</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <Controller
                control={control}
                name="published"
                render={({ field }) => (
                  <select
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="rounded-lg bg-gray-50 px-2 py-1.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="false">Draft</option>
                    <option value="true">Published</option>
                  </select>
                )}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("featured")} className="accent-teal-600" />
              Featured
            </label>
            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving…"
                : values.published
                  ? initial
                    ? "Update"
                    : "Publish"
                  : "Save draft"}
            </button>
          </div>

          <div className={box}>
            <h2 className="font-semibold text-gray-900">Featured image</h2>
            <Controller
              control={control}
              name="coverKey"
              render={({ field }) => (
                <div className="space-y-2">
                  {publicMediaSrc(field.value || null) && (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin preview, source may be an arbitrary external URL not in next.config's remotePatterns
                    <img
                      src={publicMediaSrc(field.value || null)!}
                      alt="Cover preview"
                      className="h-32 w-full rounded-lg object-cover ring-1 ring-gray-950/5"
                    />
                  )}
                  <FileUpload
                    resourceId={draftId}
                    scope="postCover"
                    accept="image/png,image/jpeg,image/webp"
                    label="Upload cover image"
                    onUploaded={(file) => field.onChange(file.key)}
                  />
                </div>
              )}
            />
          </div>

          <div className={box}>
            <h2 className="font-semibold text-gray-900">Details</h2>
            <div className="space-y-1.5">
              <label className={label}>Category</label>
              <select {...register("category")} className={input}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={label}>Emoji</label>
                <input {...register("emoji")} className={input} />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Author</label>
                <input {...register("authorName")} placeholder="Next Minds Team" className={input} />
              </div>
            </div>
          </div>

          <div className={box}>
            <h2 className="font-semibold text-gray-900">SEO</h2>

            <div className="space-y-1.5">
              <label className={label}>Focus keyword</label>
              <input
                {...register("focusKeyword")}
                placeholder="e.g. python course kathmandu"
                className={input}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={label}>SEO title</label>
                <span
                  className={`text-xs ${
                    seoTitle.length > 60
                      ? "text-red-500"
                      : seoTitle.length >= 40
                        ? "text-teal-600"
                        : "text-gray-400"
                  }`}
                >
                  {seoTitle.length}/60
                </span>
              </div>
              <input
                {...register("metaTitle")}
                placeholder={values.title || "Defaults to the post title"}
                className={input}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={label}>Meta description</label>
                <span
                  className={`text-xs ${
                    seoDescription.length > 156
                      ? "text-red-500"
                      : seoDescription.length >= 120
                        ? "text-teal-600"
                        : "text-gray-400"
                  }`}
                >
                  {seoDescription.length}/156
                </span>
              </div>
              <textarea
                rows={3}
                {...register("metaDescription")}
                placeholder={values.excerpt || "Defaults to the excerpt"}
                className={input}
              />
            </div>

            <div className="space-y-1.5">
              <label className={label}>
                Canonical URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                {...register("canonicalUrl")}
                placeholder="https://…"
                className={input}
              />
            </div>

            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-950/5">
              <p className="truncate text-xs text-gray-500">
                nextmindsinfosys.com › blog › {slugPreview || "…"}
              </p>
              <p className="truncate text-base text-blue-700">{seoTitle || "Post title"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                {seoDescription ||
                  "Write a meta description to control how this post appears in search results."}
              </p>
            </div>

            <ul className="space-y-1.5">
              {checks.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <SeoStatusIcon status={c.status} />
                  {c.message}
                </li>
              ))}
              {!keyword && (
                <li className="flex items-start gap-2 text-xs text-amber-600">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  Add a focus keyword to get keyword-specific checks.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
