"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { toggleCoursePublished } from "./actions";

interface PublishToggleProps {
  id: string;
  published: boolean;
}

export function PublishToggle({ id, published }: PublishToggleProps) {
  const [value, setValue] = useState(published);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !value;
    setValue(next);
    startTransition(async () => {
      const result = await toggleCoursePublished(id, next);
      if ("error" in result) setValue(!next);
    });
  }

  return (
    <button onClick={handleClick} disabled={pending} className="disabled:opacity-50">
      <Badge variant={value ? "default" : "secondary"}>{value ? "Published" : "Unpublished"}</Badge>
    </button>
  );
}
