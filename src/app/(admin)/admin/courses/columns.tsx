"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { CategorySelect } from "./category-select";
import { PublishToggle } from "./publish-toggle";
import type { CurriculumModule, Faq } from "@/db/models/course";
import { deleteCourse } from "./actions";

export interface CourseRow {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  shortDesc: string | null;
  contentMd: string;
  tools: string[];
  whoIsItFor: string[];
  skills: string[];
  curriculum: CurriculumModule[];
  faqs: Faq[];
  badge: string | null;
  color: string | null;
  students: number;
  duration: string;
  level: string;
  price: number;
  imageUrl: string | null;
  published: boolean;
  enrollmentCount: number;
}

export function createCourseColumns(
  categories: { id: string; name: string }[],
): ColumnDef<CourseRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.title}</span>,
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => (
        <CategorySelect
          courseId={row.original.id}
          categoryId={row.original.categoryId}
          categories={categories}
        />
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
    },
    {
      accessorKey: "duration",
      header: "Duration",
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "enrollmentCount",
      header: "Enrollments",
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => <PublishToggle id={row.original.id} published={row.original.published} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              Edit
            </Link>
            <ConfirmDeleteDialog
              title="Delete course?"
              description={
                course.enrollmentCount > 0
                  ? `${course.enrollmentCount} enrollment${course.enrollmentCount === 1 ? "" : "s"} reference this course. Deleting it cannot be undone.`
                  : "This cannot be undone."
              }
              onConfirm={() => deleteCourse(course.id)}
              trigger={
                <button className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600">
                  <Trash2 size={14} />
                  Delete
                </button>
              }
            />
          </div>
        );
      },
    },
  ];
}
