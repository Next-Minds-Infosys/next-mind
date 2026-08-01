import { Plus } from "lucide-react";
import { Category, Course, Enrollment } from "@/db";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteCategoryButton } from "./delete-button";
import { CategoryDialog } from "./category-dialog";

export default async function AdminCategoriesPage() {
  await requireResource(RESOURCES.CATEGORIES);
  const categories = await Category.findAll({
    order: [["name", "ASC"]],
    include: [
      {
        model: Course,
        as: "courses",
        attributes: ["id"],
        include: [{ model: Enrollment, as: "enrollments", attributes: ["id"] }],
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Group courses into the tracks students browse by
          </p>
        </div>
        <CategoryDialog
          trigger={
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow hover:shadow-lg hover:shadow-teal-200/60 transition-all active:scale-[0.98]">
              <Plus size={16} />
              New Category
            </button>
          }
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                No categories yet.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const courseList = category.courses ?? [];
              const enrollmentCount = courseList.reduce(
                (sum, course) => sum + (course.enrollments?.length ?? 0),
                0,
              );
              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-gray-900">{category.name}</TableCell>
                  <TableCell className="text-gray-400">{category.slug}</TableCell>
                  <TableCell>{courseList.length}</TableCell>
                  <TableCell>{enrollmentCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CategoryDialog
                        initial={{
                          id: category.id,
                          name: category.name,
                          description: category.description,
                        }}
                        trigger={
                          <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
                            Edit
                          </button>
                        }
                      />
                      <DeleteCategoryButton id={category.id} disabled={courseList.length > 0} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
