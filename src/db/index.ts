// import { User } from "./user";

import { Category } from "./models/category";
import { Course } from "./models/course";
import { Enrollment } from "./models/enrollment";
import { Mentor } from "./models/mentor";
import { User } from "./models/user";

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
}

export { User, Category, Course, Enrollment, Mentor };
