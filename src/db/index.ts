// import { User } from "./user";

import { Course } from "./models/course";
import { Enrollment } from "./models/enrollment";
import { User } from "./models/user";

User.hasMany(Course, { foreignKey: "createdById", as: "coursesAuthored" });
Course.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

Course.hasMany(Enrollment, { foreignKey: "courseId", as: "enrollments" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

User.hasMany(Enrollment, { foreignKey: "userId", as: "enrollments" });
Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Course, Enrollment };