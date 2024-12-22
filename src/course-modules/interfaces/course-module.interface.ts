import { BaseEntity } from "../../common/interfaces/base.interface";

export interface CourseModule extends BaseEntity {
  name: string;
  description?: string;
  courseId: string;
  sequenceNumber: number;
}
