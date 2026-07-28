"use client";

import { useState, useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => Promise<{ success: true } | { error: string }>;
}

export function ConfirmDeleteDialog({
  trigger,
  title = "Delete this item?",
  description = "This cannot be undone.",
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const result = await onConfirm();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError("");
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
            <TriangleAlert size={20} />
          </div>
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-200/60"
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
