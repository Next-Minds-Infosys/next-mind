"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/lms/file-upload";
import { publicMediaSrc } from "@/lib/media-image";
import { createMentor, updateMentor } from "./actions";

interface MentorFormProps {
  initial?: { id: string; name: string; role: string; bio: string; photo: string | null };
  onSuccess: () => void;
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";

export function MentorForm({ initial, onSuccess }: MentorFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // A new mentor has no id yet to namespace the S3 upload under; a stable
  // per-form draft id fills that role until the mentor is actually saved.
  const [draftId] = useState(() => initial?.id ?? crypto.randomUUID());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = initial
      ? await updateMentor(initial.id, { name, role, bio, photo })
      : await createMentor({ name, role, bio, photo });

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ujjwal Thapa"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor="role">
          Role
        </label>
        <input
          id="role"
          name="role"
          type="text"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="SEO Mentor"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Shown on the course detail page's Mentor section"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor="photo">
          Photo
        </label>
        <div className="flex items-start gap-3">
          {publicMediaSrc(photo || null) && (
            // eslint-disable-next-line @next/next/no-img-element -- small admin preview, source may be an arbitrary external URL not in next.config's remotePatterns
            <img
              src={publicMediaSrc(photo || null)!}
              alt="Mentor photo preview"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-gray-950/5"
            />
          )}
          <div className="flex-1 space-y-2">
            <input
              id="photo"
              name="photo"
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://images.unsplash.com/... or upload below"
              className={inputClass}
            />
            <FileUpload
              resourceId={draftId}
              scope="mentorPhoto"
              accept="image/png,image/jpeg,image/webp"
              label="Upload photo"
              onUploaded={(file) => setPhoto(file.key)}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">Optional</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : initial ? (
          "Save Changes"
        ) : (
          "Create Mentor"
        )}
      </Button>
    </form>
  );
}
