// import { User } from "./user";

import { Category } from "./models/category";
import { Course } from "./models/course";
import { Enrollment } from "./models/enrollment";
import { Mentor } from "./models/mentor";
import { Batch } from "./models/batch";
import { BatchStudent } from "./models/batch-student";
import { Post } from "./models/post";
import { Policy } from "./models/policy";
import { RolePolicy } from "./models/role-policy";
import { Lesson } from "./models/lesson";
import { LessonProgress } from "./models/lesson-progress";
import { Material } from "./models/material";
import { Assignment } from "./models/assignment";
import { Submission } from "./models/submission";
import { Message } from "./models/message";
import { Invoice } from "./models/invoice";
import { Expense } from "./models/expense";
import { User } from "./models/user";
// Re-exported here too so every runtime import can go through "@/db". Importing
// a model straight from "@/db/models/*" skips this file, and with it the
// association setup below - any `include:` in that module would then throw.
import { ContactSubmission } from "./models/contact-submission";
import { EnterpriseInquiry } from "./models/entrise-query";
import { EmailJob } from "./models/email-job";

// Guard on the models themselves rather than a globalThis boolean. A
// process-wide flag is wrong here: a production build evaluates this module in
// more than one graph, and the first graph would flip the flag so later graphs
// skip association setup entirely - or worse, run it with a mix of classes from
// different graphs. Checking an association that this block defines is
// self-scoping, because associations live on the model classes.
if (!Course.associations.category) {
  User.hasMany(Course, { foreignKey: "createdById", as: "coursesAuthored" });
  Course.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

  Category.hasMany(Course, { foreignKey: "categoryId", as: "courses" });
  Course.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });
  Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

  User.hasMany(Enrollment, { foreignKey: "userId", as: "enrollments" });
  Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });

  Mentor.hasMany(Course, { foreignKey: "mentorId", as: "coursesMentored" });
  Course.belongsTo(Mentor, { foreignKey: "mentorId", as: "mentor" });

  // A batch runs exactly one course and is owned by one instructor.
  Course.hasMany(Batch, { foreignKey: "courseId", as: "batches" });
  Batch.belongsTo(Course, { foreignKey: "courseId", as: "course" });

  User.hasMany(Batch, { foreignKey: "instructorId", as: "batchesTaught" });
  Batch.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });

  // BatchStudent is the join every instructor/student query scopes against.
  Batch.hasMany(BatchStudent, { foreignKey: "batchId", as: "students" });
  BatchStudent.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });

  User.hasMany(BatchStudent, { foreignKey: "userId", as: "batchMemberships" });
  BatchStudent.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
  Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

  Policy.hasMany(RolePolicy, { foreignKey: "policyId", as: "roleAttachments" });
  RolePolicy.belongsTo(Policy, { foreignKey: "policyId", as: "policy" });

  // Everything below hangs off Batch, which is the access boundary.
  Batch.hasMany(Lesson, { foreignKey: "batchId", as: "lessons" });
  Lesson.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });

  Lesson.hasMany(LessonProgress, { foreignKey: "lessonId", as: "progress" });
  LessonProgress.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });
  User.hasMany(LessonProgress, { foreignKey: "userId", as: "lessonProgress" });
  LessonProgress.belongsTo(User, { foreignKey: "userId", as: "user" });

  Batch.hasMany(Material, { foreignKey: "batchId", as: "materials" });
  Material.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });
  Lesson.hasMany(Material, { foreignKey: "lessonId", as: "materials" });
  Material.belongsTo(Lesson, { foreignKey: "lessonId", as: "lesson" });

  Batch.hasMany(Assignment, { foreignKey: "batchId", as: "assignments" });
  Assignment.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });

  Assignment.hasMany(Submission, { foreignKey: "assignmentId", as: "submissions" });
  Submission.belongsTo(Assignment, { foreignKey: "assignmentId", as: "assignment" });
  User.hasMany(Submission, { foreignKey: "userId", as: "submissions" });
  Submission.belongsTo(User, { foreignKey: "userId", as: "user" });

  Batch.hasMany(Message, { foreignKey: "batchId", as: "messages" });
  Message.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });
  User.hasMany(Message, { foreignKey: "authorId", as: "messages" });
  Message.belongsTo(User, { foreignKey: "authorId", as: "author" });
  // Threaded: a null parentId is an announcement, a set one is a reply.
  Message.hasMany(Message, { foreignKey: "parentId", as: "replies" });
  Message.belongsTo(Message, { foreignKey: "parentId", as: "parent" });

  User.hasMany(Invoice, { foreignKey: "userId", as: "invoices" });
  Invoice.belongsTo(User, { foreignKey: "userId", as: "student" });
  Batch.hasMany(Invoice, { foreignKey: "batchId", as: "invoices" });
  Invoice.belongsTo(Batch, { foreignKey: "batchId", as: "batch" });
}

export {
  User,
  Category,
  Course,
  Enrollment,
  Mentor,
  Batch,
  BatchStudent,
  Post,
  Policy,
  RolePolicy,
  Lesson,
  LessonProgress,
  Material,
  Assignment,
  Submission,
  Message,
  Invoice,
  Expense,
  ContactSubmission,
  EnterpriseInquiry,
  EmailJob,
};
