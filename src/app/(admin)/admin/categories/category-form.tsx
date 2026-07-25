"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCategory, updateCategory } from "./actions";

interface CategoryFormProps {
  initial?: { id: string; name: string; description: string | null };
  onSuccess: () => void;
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow";

export function CategoryForm({ initial, onSuccess }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = initial
      ? await updateCategory(initial.id, { name, description })
      : await createCategory({ name, description });

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
          placeholder="Development"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional short description"
          className={inputClass}
        />
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
          "Create Category"
        )}
      </Button>
    </form>
  );
}
