"use client";

import { useState, useTransition } from "react";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { STATUS_CONFIG } from "./status-badge";

const STATUS_OPTIONS = Object.values(SubmissionStatus);

interface StatusSelectProps {
  id: string;
  status: SubmissionStatus;
  onUpdate: (id: string, status: SubmissionStatus) => Promise<{ success: true } | { error: string }>;
}

export function StatusSelect({ id, status, onUpdate }: StatusSelectProps) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SubmissionStatus;
    setValue(next);
    startTransition(async () => {
      const result = await onUpdate(id, next);
      if ("error" in result) setValue(status);
    });
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border-0 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
}
