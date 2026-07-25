"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { createCourseColumns, type CourseRow } from "./columns";

interface CoursesTableProps {
  courses: CourseRow[];
  categories: { id: string; name: string }[];
}

export function CoursesTable({ courses, categories }: CoursesTableProps) {
  const columns = useMemo(() => createCourseColumns(categories), [categories]);

  return <DataTable columns={columns} data={courses} emptyMessage="No courses yet." pageSize={10} />;
}
