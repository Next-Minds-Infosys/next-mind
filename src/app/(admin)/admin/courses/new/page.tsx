import { Category, Mentor } from "@/db";
import { CourseForm } from "../course-form";

export default async function NewCoursePage() {
  const [categories, mentors] = await Promise.all([
    Category.findAll({ order: [["name", "ASC"]], attributes: ["id", "name"] }),
    Mentor.findAll({ order: [["name", "ASC"]], attributes: ["id", "name"] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">New Course</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new course to the catalog</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <CourseForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          mentors={mentors.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>
    </div>
  );
}
