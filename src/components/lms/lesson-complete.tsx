"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { setLessonComplete } from "@/app/(student)/student/actions";

export function LessonComplete({ lessonId, done }: { lessonId: string; done: boolean }) {
  const router = useRouter();
  // Optimistic: the checkbox flips immediately, then reconciles on refresh.
  const [on, setOn] = useState(done);
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        start(async () => {
          const r = await setLessonComplete(lessonId, next);
          if ("error" in r) setOn(!next);
          router.refresh();
        });
      }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
        on
          ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          on ? "border-teal-600 bg-teal-600 text-white" : "border-gray-400"
        }`}
      >
        {on && <Check size={11} strokeWidth={3} />}
      </span>
      {on ? "Completed" : "Mark complete"}
    </button>
  );
}
