"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChangePasswordForm } from "@/app/account/change-password/form";

/**
 * Wraps the same form/action used by the forced-password-change page
 * (src/app/account/change-password) so a voluntary change doesn't require
 * navigating away from wherever it was triggered. Success still redirects
 * the whole browser (see form.tsx) - that unmounts the dialog on its own,
 * so there's no onSuccess/setOpen(false) to wire up here.
 */
export function ChangePasswordDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white">
            <KeyRound size={20} />
          </div>
          <div>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Pick a new password for your account.</DialogDescription>
          </div>
        </DialogHeader>
        <ChangePasswordForm forced={false} />
      </DialogContent>
    </Dialog>
  );
}
