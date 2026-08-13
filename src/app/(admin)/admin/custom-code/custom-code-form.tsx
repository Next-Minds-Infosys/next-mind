"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  siteSettingSchema,
  type SiteSettingInput,
  type SiteSettingFormValues,
} from "@/lib/schemas";
import { updateSiteSetting } from "./actions";

const textareaClass =
  "w-full rounded-xl border-0 bg-gray-50 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const labelClass = "text-sm font-medium text-gray-700";
const panel = "rounded-2xl bg-white p-6 ring-1 ring-gray-950/5";

export function CustomCodeForm({
  customScript,
  customCss,
}: {
  customScript: string;
  customCss: string;
}) {
  const [status, setStatus] = useState<{ ok?: string; error?: string }>({});
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingFormValues, unknown, SiteSettingInput>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: { customScript, customCss },
  });

  const onSubmit = async (data: SiteSettingInput) => {
    setStatus({});
    const result = await updateSiteSetting(data);
    if ("error" in result) return setStatus({ error: result.error });
    setStatus({ ok: "Saved. Live on the public site now." });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <section className={panel}>
        <label className={labelClass} htmlFor="customScript">
          Script
        </label>
        <p className="mb-3 mt-1 text-xs text-gray-500">
          Paste one or more full <code>&lt;script&gt;</code> tags exactly as given to you (an
          external <code>src=</code> tag, an inline snippet, or both) — e.g. a chat widget or
          tracking pixel embed code. Executes on every public page.
        </p>
        <textarea
          id="customScript"
          rows={8}
          spellCheck={false}
          placeholder={'<script src="https://widget.example.com/embed.js" async></script>'}
          className={textareaClass}
          {...register("customScript")}
        />
        {errors.customScript && (
          <p className="mt-1 text-xs text-red-600">{errors.customScript.message}</p>
        )}
      </section>

      <section className={panel}>
        <label className={labelClass} htmlFor="customCss">
          CSS
        </label>
        <p className="mb-3 mt-1 text-xs text-gray-500">
          Raw CSS rules only — no surrounding <code>&lt;style&gt;</code> tag. Applied on every
          public page.
        </p>
        <textarea
          id="customCss"
          rows={8}
          spellCheck={false}
          placeholder={".nm-gradient-text { letter-spacing: 0.01em; }"}
          className={textareaClass}
          {...register("customCss")}
        />
        {errors.customCss && <p className="mt-1 text-xs text-red-600">{errors.customCss.message}</p>}
      </section>

      {status.error && <p className="text-sm text-red-600">{status.error}</p>}
      {status.ok && <p className="text-sm text-teal-600">{status.ok}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save changes"
        )}
      </button>
    </form>
  );
}
