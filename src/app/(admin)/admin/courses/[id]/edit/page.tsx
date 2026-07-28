import { notFound } from "next/navigation";
import { Category, Course, Mentor } from "@/db";
import { CourseForm } from "../../course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [course, categories, mentors] = await Promise.all([
    Course.findByPk(id),
    Category.findAll({ order: [["name", "ASC"]], attributes: ["id", "name"] }),
    Mentor.findAll({ order: [["name", "ASC"]], attributes: ["id", "name"] }),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Course</h1>
        <p className="text-sm text-gray-500 mt-1">{course.title}</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <CourseForm
          initial={{
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
            mentorId: course.mentorId,
            published: course.published,
          }}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          mentors={mentors.map((m) => ({ id: m.id, name: m.name }))}
        />
      </div>
    </div>
  );
}
