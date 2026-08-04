"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import {
  profileSchema,
  secondaryEmailSchema,
  type ProfileInput,
  type SecondaryEmailInput,
} from "@/lib/schemas";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUpload, type UploadedFile } from "@/components/lms/file-upload";
import { publicMediaSrc } from "@/lib/media-image";
import {
  cancelSecondaryEmail,
  removeAvatar,
  requestSecondaryEmailVerification,
  resendSecondaryEmailVerification,
  updateAvatar,
  updateProfile,
} from "./actions";

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";
const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

interface ProfileFormProps {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  secondaryEmail: string | null;
  secondaryEmailVerified: boolean;
  role: string;
}

export function ProfileForm({
  userId,
  name,
  email,
  image,
  secondaryEmail,
  secondaryEmailVerified,
  role,
}: ProfileFormProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <AvatarSection userId={userId} name={name} email={email} image={image} />
      <NameSection name={name} email={email} role={role} onSaved={() => router.refresh()} />
      <SecondaryEmailSection
        secondaryEmail={secondaryEmail}
        secondaryEmailVerified={secondaryEmailVerified}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}

function AvatarSection({
  userId,
  name,
  email,
  image,
}: {
  userId: string;
  name: string;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(image);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleUploaded(file: UploadedFile) {
    setError("");
    setBusy(true);
    const result = await updateAvatar(file.key);
    setBusy(false);
    if ("error" in result) return setError(result.error);
    setCurrent(file.key);
    router.refresh();
  }

  async function handleRemove() {
    setError("");
    setBusy(true);
    const result = await removeAvatar();
    setBusy(false);
    if ("error" in result) return setError(result.error);
    setCurrent(null);
    router.refresh();
  }

  return (
    <section className={panel}>
      <h2 className="mb-4 font-semibold text-gray-900">Photo</h2>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {publicMediaSrc(current) && <AvatarImage src={publicMediaSrc(current)!} alt={name} />}
          <AvatarFallback className="text-base">{getInitials(name, email)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileUpload
              resourceId={userId}
              scope="avatar"
              accept="image/png,image/jpeg,image/webp"
              label="Upload photo"
              onUploaded={handleUploaded}
            />
            {current && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={15} />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">PNG, JPEG, or WebP. Up to 5 MB.</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}

function NameSection({
  name,
  email,
  role,
  onSaved,
}: {
  name: string;
  email: string;
  role: string;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: { name } });

  const onSubmit = async (data: ProfileInput) => {
    setStatus({});
    const result = await updateProfile(data);
    if ("error" in result) return setStatus({ error: result.error });
    setStatus({ ok: "Saved." });
    onSaved();
  };

  return (
    <section className={panel}>
      <h2 className="mb-4 font-semibold text-gray-900">Account</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className={label} htmlFor="name">
            Name
          </label>
          <input id="name" className={input} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <p className={label}>Email</p>
          <p className="mt-1 text-sm text-gray-500">{email}</p>
        </div>
        <div>
          <p className={label}>Role</p>
          <p className="mt-1 text-sm text-gray-500">{role}</p>
        </div>

        {status.error && <p className="text-sm text-red-600">{status.error}</p>}
        {status.ok && <p className="text-sm text-teal-600">{status.ok}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}

function SecondaryEmailSection({
  secondaryEmail,
  secondaryEmailVerified,
  onChanged,
}: {
  secondaryEmail: string | null;
  secondaryEmailVerified: boolean;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SecondaryEmailInput>({ resolver: zodResolver(secondaryEmailSchema) });

  const onSubmit = async (data: SecondaryEmailInput) => {
    setStatus({});
    const result = await requestSecondaryEmailVerification(data);
    if ("error" in result) return setStatus({ error: result.error });
    setStatus({ ok: "Verification email sent — check that inbox." });
    reset();
    onChanged();
  };

  async function handleResend() {
    setStatus({});
    setBusy(true);
    const result = await resendSecondaryEmailVerification();
    setBusy(false);
    if ("error" in result) return setStatus({ error: result.error });
    setStatus({ ok: "Verification email re-sent." });
  }

  async function handleRemove() {
    setStatus({});
    setBusy(true);
    const result = await cancelSecondaryEmail();
    setBusy(false);
    if ("error" in result) return setStatus({ error: result.error });
    setStatus({});
    onChanged();
  }

  return (
    <section className={panel}>
      <h2 className="mb-4 font-semibold text-gray-900">Secondary email</h2>

      {secondaryEmail ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{secondaryEmail}</p>
            <Badge variant={secondaryEmailVerified ? "default" : "secondary"} className="mt-1">
              {secondaryEmailVerified ? "Verified" : "Pending verification"}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!secondaryEmailVerified && (
              <button
                type="button"
                onClick={handleResend}
                disabled={busy}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-60"
              >
                Resend
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          No secondary email set. Add one below — it must be confirmed before it&apos;s shown as
          verified.
        </p>
      )}

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex-1">
          <input
            type="email"
            placeholder={secondaryEmail ? "Replace with a new address" : "you@example.com"}
            className={input}
            {...register("secondaryEmail")}
          />
          {errors.secondaryEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.secondaryEmail.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : secondaryEmail ? "Replace" : "Send verification"}
        </button>
      </form>

      {status.error && <p className="mt-2 text-sm text-red-600">{status.error}</p>}
      {status.ok && <p className="mt-2 text-sm text-teal-600">{status.ok}</p>}
    </section>
  );
}
