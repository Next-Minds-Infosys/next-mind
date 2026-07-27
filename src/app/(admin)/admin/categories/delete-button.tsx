"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteCategory } from "./actions";

interface DeleteCategoryButtonProps {
  id: string;
  disabled?: boolean;
}

const triggerClass =
  "text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50 inline-flex items-center gap-1";

export function DeleteCategoryButton({ id, disabled }: DeleteCategoryButtonProps) {
  const [blockedMessage, setBlockedMessage] = useState("");

  if (disabled) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setBlockedMessage("Reassign or remove its courses first.")}
          className={triggerClass}
        >
          <Trash2 size={14} />
          Delete
        </button>
        {blockedMessage && (
          <p className="absolute right-0 top-full mt-1 w-48 text-xs text-red-500">
            {blockedMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <ConfirmDeleteDialog
      title="Delete category?"
      onConfirm={() => deleteCategory(id)}
      trigger={
        <button type="button" className={triggerClass}>
          <Trash2 size={14} />
          Delete
        </button>
      }
    />
  );
}
