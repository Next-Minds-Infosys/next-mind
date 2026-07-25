import { Plus } from "lucide-react";
import { Category, Course, Enrollment } from "@/db";
import { CoursesTable } from "./courses-table";
import { CourseDialog } from "./course-dialog";

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    Course.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: Enrollment, as: "enrollments", attributes: ["id"] },
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    }),
    Category.findAll({ order: [["name", "ASC"]], attributes: ["id", "name"] }),
  ]);

  const categoryOptions = categories.map((category) => ({ id: category.id, name: category.name }));

  const courseRows = courses.map((course) => ({
    id: course.id,
    title: course.title,
    categoryId: course.categoryId,
    description: course.description,
    shortDesc: course.shortDesc,
    contentMd: course.contentMd,
    tools: course.tools,
    whoIsItFor: course.whoIsItFor,
    skills: course.skills,
    curriculum: course.curriculum,
    faqs: course.faqs,
    badge: course.badge,
    color: course.color,
    students: course.students,
    duration: course.duration,
    level: course.level,
    price: course.price,
    imageUrl: course.imageUrl,
    published: course.published,
    enrollmentCount: course.enrollments?.length ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Industry-aligned programs from Next Minds</p>
        </div>
        <CourseDialog
          categories={categoryOptions}
          trigger={
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow hover:shadow-lg hover:shadow-teal-200/60 transition-all active:scale-[0.98]">
              <Plus size={16} />
              New Course
            </button>
          }
        />
      </div>
      <CoursesTable courses={courseRows} categories={categoryOptions} />
    </div>
  );
}
