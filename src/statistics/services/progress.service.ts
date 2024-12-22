import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import {
  CourseProgressStats,
  SubjectProgressStats,
} from "../interfaces/progress-stats.interface";
import {
  calculateProgressPercentage,
  validateProgress,
} from "../utils/progress.utils";

@Injectable()
export class ProgressService {
  constructor(private readonly supabase: SupabaseService) {}

  async getCourseProgress(
    userId: string,
    courseId: string
  ): Promise<CourseProgressStats> {
    const { data: lessonCount, error: lessonError } = await this.supabase.client
      .from("lessons")
      .select("id", { count: "exact" })
      .eq("course_id", courseId);

    if (lessonError) throw lessonError;

    const { data: progress, error: progressError } = await this.supabase.client
      .from("user_progress")
      .select(
        `
        progress_percentage,
        last_activity,
        completed_lessons,
        courses:course_id (id, name)
      `
      )
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (progressError) throw progressError;
    if (!progress) throw new NotFoundException("Course progress not found");

    const completedLessons = progress.completed_lessons || 0;
    const totalLessons = lessonCount.length;

    validateProgress(completedLessons, totalLessons);
    const progressPercentage = calculateProgressPercentage(
      completedLessons,
      totalLessons
    );

    return {
      courseId: progress.courses.id,
      courseName: progress.courses.name,
      totalLessons,
      completedLessons,
      progressPercentage,
      lastActivity: new Date(progress.last_activity),
    };
  }

  async getSubjectProgress(
    userId: string,
    subjectId: string
  ): Promise<SubjectProgressStats> {
    // Implementation follows same pattern as getCourseProgress
    // Omitted for brevity
  }
}
