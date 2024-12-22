import { Lesson } from "../../lessons/interfaces/lesson.interface";

export interface AdminLessonDetails extends Lesson {
  totalViews: number;
  uniqueStudents: number;
  averageTimeSpent: number;
  completionRate: number;
  content?: string;
}

export interface AdminLessonStats {
  viewStats: {
    totalViews: number;
    uniqueStudents: number;
    averageTimeSpent: number;
    peakViewingHours: { hour: number; count: number }[];
  };
  progressStats: {
    completionRate: number;
    inProgress: number;
    notStarted: number;
  };
  resourceStats: {
    pdfDownloads: number;
    videoViews: number;
    averageWatchTime: number;
  };
}
