"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MentorForm } from "./mentor-form";

interface MentorDialogProps {
  initial?: { id: string; name: string; role: string; bio: string; photo: string | null };
  trigger: React.ReactNode;
}

export function MentorDialog({ initial, trigger }: MentorDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <DialogTitle>{initial ? "Edit Mentor" : "New Mentor"}</DialogTitle>
            <DialogDescription>
              {initial ? "Update this mentor's details" : "Add a mentor courses can be attached to"}
            </DialogDescription>
          </div>
        </DialogHeader>
        <MentorForm
          initial={initial}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
