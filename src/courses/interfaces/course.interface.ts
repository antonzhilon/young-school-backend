import { BaseEntity } from "../../common/interfaces/base.interface";

export interface Course extends BaseEntity {
  name: string;
  description?: string;
  subjectId: string;
  isPaid: boolean;
}
