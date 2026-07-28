import { Plus, Users } from "lucide-react";
import { Course, Mentor } from "@/db";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DeleteMentorButton } from "./delete-button";
import { MentorDialog } from "./mentor-dialog";

export default async function AdminMentorsPage() {
  const mentors = await Mentor.findAll({
    order: [["name", "ASC"]],
    include: [{ model: Course, as: "coursesMentored", attributes: ["id"] }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mentors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Instructors students see attached to a course
          </p>
        </div>
        <MentorDialog
          trigger={
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow hover:shadow-lg hover:shadow-teal-200/60 transition-all active:scale-[0.98]">
              <Plus size={16} />
              New Mentor
            </button>
          }
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                No mentors yet.
              </TableCell>
            </TableRow>
          ) : (
            mentors.map((mentor) => {
              const courseCount = mentor.coursesMentored?.length ?? 0;
              return (
                <TableRow key={mentor.id}>
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white">
                        {mentor.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mentor.photo}
                            alt={mentor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users size={16} />
                        )}
                      </span>
                      {mentor.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{mentor.role}</TableCell>
                  <TableCell>{courseCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <MentorDialog
                        initial={{
                          id: mentor.id,
                          name: mentor.name,
                          role: mentor.role,
                          bio: mentor.bio,
                          photo: mentor.photo,
                        }}
                        trigger={
                          <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
                            Edit
                          </button>
                        }
                      />
                      <DeleteMentorButton id={mentor.id} disabled={courseCount > 0} />
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
