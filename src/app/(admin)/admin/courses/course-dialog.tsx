"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CourseForm, type CourseFormInitial } from "./course-form";

interface CourseDialogProps {
  initial?: CourseFormInitial;
  categories: { id: string; name: string }[];
  trigger: React.ReactNode;
}

export function CourseDialog({ initial, categories, trigger }: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <DialogTitle>{initial ? "Edit Course" : "New Course"}</DialogTitle>
            <DialogDescription>
              {initial ? "Update this course's details" : "Add a new course to the catalog"}
            </DialogDescription>
          </div>
        </DialogHeader>
        <CourseForm
          initial={initial}
          categories={categories}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
