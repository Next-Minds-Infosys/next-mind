"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tags } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";

interface CategoryDialogProps {
  initial?: { id: string; name: string; description: string | null };
  trigger: React.ReactNode;
}

export function CategoryDialog({ initial, trigger }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Tags size={20} />
          </div>
          <div>
            <DialogTitle>{initial ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              {initial ? "Update this course category" : "Create a category courses can belong to"}
            </DialogDescription>
          </div>
        </DialogHeader>
        <CategoryForm
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
