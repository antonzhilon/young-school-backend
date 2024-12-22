export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastActivity: Date;
}

export interface CourseProgressStats extends ProgressStats {
  courseId: string;
  courseName: string;
}

export interface SubjectProgressStats extends ProgressStats {
  subjectId: string;
  subjectName: string;
}
