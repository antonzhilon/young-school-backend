import { Subject } from "../../subjects/interfaces/subject.interface";

export interface AdminSubjectDetails extends Subject {
  totalCourses: number;
  totalStudents: number;
  averageProgress: number;
}

export interface AdminSubjectStats {
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  popularCourses: {
    id: string;
    name: string;
    enrollments: number;
  }[];
}
