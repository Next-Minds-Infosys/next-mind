"use client";

import { useState, useTransition } from "react";
import { updateCourseCategory } from "./actions";

interface CategorySelectProps {
  courseId: string;
  categoryId: string;
  categories: { id: string; name: string }[];
}

export function CategorySelect({ courseId, categoryId, categories }: CategorySelectProps) {
  const [value, setValue] = useState(categoryId);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const result = await updateCourseCategory(courseId, next);
      if ("error" in result) setValue(previous);
    });
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border-0 bg-gray-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
