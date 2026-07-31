"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostFormValues, type PostInput } from "@/lib/schemas";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createPost, updatePost } from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";

export function PostForm({
  initial,
  onDone,
}: {
  initial?: PostInput & { id: string };
  onDone?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues, unknown, PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: initial ?? {
      title: "",
      excerpt: "",
      contentMd: "",
      category: "Career",
      emoji: "📝",
      readTime: "5 min read",
      authorName: "",
      featured: false,
      published: false,
    },
  });

  const err = (n: keyof PostFormValues) =>
    errors[n] && <p className="mt-1 text-xs text-red-600">{errors[n]?.message}</p>;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        setServerError("");
        const r = initial ? await updatePost(initial.id, values) : await createPost(values);
        if ("error" in r) return setServerError(r.error);
        if (!initial) reset();
        onDone?.();
        router.refresh();
      })}
      className="space-y-4"
    >
      <div>
        <label className={label}>Title</label>
        <input {...register("title")} placeholder="Top 10 IT Skills in Nepal" className={input} />
        {err("title")}
      </div>

      <div>
        <label className={label}>Excerpt</label>
        <textarea rows={2} {...register("excerpt")} className={input} />
        <p className="mt-1 text-xs text-gray-500">The blurb shown on the blog card.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={label}>Category</label>
          <select {...register("category")} className={input}>
            {["Career", "Technology", "Industry", "Tutorials"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Emoji</label>
          <input {...register("emoji")} className={input} />
        </div>
        <div>
          <label className={label}>Read time</label>
          <input {...register("readTime")} placeholder="5 min read" className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Author</label>
        <input {...register("authorName")} placeholder="Next Minds Team" className={input} />
      </div>

      <div>
        <label className={label}>Content</label>
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
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("published")} className="accent-teal-600" />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("featured")} className="accent-teal-600" />
          Featured
        </label>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : initial ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
