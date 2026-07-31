"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "./actions";

const ROLES = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(role);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <select
        value={value}
        disabled={disabled || pending}
        aria-label="Role"
        onChange={(e) => {
          const next = e.target.value;
          const previous = value;
          setValue(next);
          setError("");
          startTransition(async () => {
            const result = await updateUserRole(userId, next);
            if ("error" in result) {
              setValue(previous); // roll back the optimistic change
              setError(result.error);
            }
          });
        }}
        className="rounded-lg bg-gray-50 px-3 py-1.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 max-w-[16rem] text-xs text-red-600">{error}</p>}
    </div>
  );
}
