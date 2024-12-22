import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { CreateCourseDto } from "../../courses/dto/create-course.dto";

@Injectable()
export class CourseManagementService {
  constructor(private readonly supabase: SupabaseService) {}

  async createCourse(createCourseDto: CreateCourseDto) {
    const { data, error } = await this.supabase.client
      .from("courses")
      .insert(createCourseDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCourse(id: string, updateCourseDto: CreateCourseDto) {
    const { data, error } = await this.supabase.client
      .from("courses")
      .update(updateCourseDto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Course not found");
    return data;
  }

  async deleteCourse(id: string) {
    const { error } = await this.supabase.client
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getCourseAnalytics(id: string) {
    const [enrollments, completions, averageProgress] = await Promise.all([
      this.getEnrollmentCount(id),
      this.getCompletionCount(id),
      this.getAverageProgress(id),
    ]);

    return {
      id,
      enrollments,
      completions,
      averageProgress,
      completionRate: enrollments ? (completions / enrollments) * 100 : 0,
    };
  }

  private async getEnrollmentCount(courseId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("course_access")
      .select("*", { count: "exact" })
      .eq("course_id", courseId);

    return count || 0;
  }

  private async getCompletionCount(courseId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("user_progress")
      .select("*", { count: "exact" })
      .eq("course_id", courseId)
      .eq("progress_percentage", 100);

    return count || 0;
  }

  private async getAverageProgress(courseId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("course_id", courseId);

    if (!data?.length) return 0;

    return (
      data.reduce((sum, record) => sum + (record.progress_percentage || 0), 0) /
      data.length
    );
  }
}
