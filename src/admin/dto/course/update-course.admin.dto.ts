import { PartialType } from "@nestjs/swagger";
import { AdminCreateCourseDto } from "./create-course.admin.dto";

export class AdminUpdateCourseDto extends PartialType(AdminCreateCourseDto) {}
