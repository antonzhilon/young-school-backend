import { BaseEntity } from "../../common/interfaces/base.interface";

export interface Lesson extends BaseEntity {
  name: string;
  description?: string;
  moduleId: string;
  subjectId: string;
  testId?: string;
  pdfLink?: string;
  videoLink?: string;
  sequenceNumber: number;
}
