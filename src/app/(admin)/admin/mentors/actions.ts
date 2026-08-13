"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicCourses } from "@/lib/revalidate";
import { Course, Mentor } from "@/db";
import { mentorSchema, parseInput, type MentorInput } from "@/lib/schemas";
import { RESOURCES, type Action } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

async function requireMentors(action: Action) {
  const { allowed } = await sessionCan(RESOURCES.MENTORS, action);
  return allowed;
}

export async function createMentor(
  data: MentorInput,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireMentors("create"))) return { error: "Unauthorized" };

  const parsed = parseInput(mentorSchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  await Mentor.create({
    name: data.name,
    role: data.role,
    bio: data.bio,
    photo: data.photo.trim() || null,
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/admin/courses");
  revalidatePath("/admin");
  revalidatePublicCourses();
  return { success: true };
}

export async function updateMentor(
  id: string,
  data: MentorInput,
): Promise<{ success: true } | { error: string }> {
  if (!(await requireMentors("update"))) return { error: "Unauthorized" };

  const parsed = parseInput(mentorSchema, data);
  if (!parsed.success) return { error: parsed.error };
  data = parsed.data;

  const mentor = await Mentor.findByPk(id);
  if (!mentor) return { error: "Mentor not found." };

  await mentor.update({
    name: data.name,
    role: data.role,
    bio: data.bio,
    photo: data.photo.trim() || null,
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/admin/courses");
  revalidatePublicCourses();
  return { success: true };
}

export async function deleteMentor(id: string): Promise<{ success: true } | { error: string }> {
  if (!(await requireMentors("delete"))) return { error: "Unauthorized" };

  const courseCount = await Course.count({ where: { mentorId: id } });
  if (courseCount > 0) {
    return {
      error: `Cannot delete: ${courseCount} course${courseCount === 1 ? "" : "s"} still assign this mentor.`,
    };
  }

  await Mentor.destroy({ where: { id } });
  revalidatePath("/admin/mentors");
  revalidatePath("/admin");
  revalidatePublicCourses();
  return { success: true };
}
