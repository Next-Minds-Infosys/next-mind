// import { User } from "./user";

import { Category } from "./models/category";
import { Course } from "./models/course";
import { Enrollment } from "./models/enrollment";
import { Mentor } from "./models/mentor";
import { User } from "./models/user";

// Each model file now caches its class on globalThis, so re-evaluating this
// file (Turbopack/Fast Refresh) always sees the same classes - but this guard
// still keeps association setup itself from running more than once per
// process, since it only needs to happen the first time.
const globalForAssociations = globalThis as unknown as { dbAssociated?: boolean };

if (!globalForAssociations.dbAssociated) {
  globalForAssociations.dbAssociated = true;

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
}

export { User, Category, Course, Enrollment, Mentor };
