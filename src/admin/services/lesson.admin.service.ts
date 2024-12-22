import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateLessonDto } from "../dto/lesson/create-lesson.admin.dto";
import { AdminLessonFilterDto } from "../dto/lesson/lesson-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import {
  AdminLessonDetails,
  AdminLessonStats,
} from "../interfaces/lesson.admin.interface";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "../../common/utils/admin-pagination.util";

@Injectable()
export class LessonAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(
    createLessonDto: AdminCreateLessonDto
  ): Promise<AdminLessonDetails> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .insert(createLessonDto)
      .select()
      .single();

    if (error) throw error;
    return this.enrichLessonDetails(data);
  }

  async findAll(
    filters: AdminLessonFilterDto
  ): Promise<AdminPaginatedResponse<AdminLessonDetails>> {
    let query = this.supabase.client
      .from("lessons")
      .select("*", { count: "exact" });

    if (filters.moduleId) {
      query = query.eq("module_id", filters.moduleId);
    }
    if (filters.subjectId) {
      query = query.eq("subject_id", filters.subjectId);
    }
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.content) {
      query = query.ilike("content", `%${filters.content}%`);
    }

    const { from, to, sortBy, sortDirection } = getPaginationParams(filters);

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === "asc" });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const lessonDetails = await Promise.all(
      data.map((lesson) => this.enrichLessonDetails(lesson))
    );

    return createPaginatedResponse(lessonDetails, count, filters);
  }

  async findOne(id: string): Promise<AdminLessonDetails> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Lesson not found");

    return this.enrichLessonDetails(data);
  }

  async update(
    id: string,
    updateLessonDto: AdminCreateLessonDto
  ): Promise<AdminLessonDetails> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .update(updateLessonDto)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Lesson not found");

    return this.enrichLessonDetails(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from("lessons")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getLessonStats(id: string): Promise<AdminLessonStats> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        views:learning_activities(count),
        students:user_progress(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Lesson not found");

    return {
      viewStats: {
        totalViews: data.views || 0,
        uniqueStudents: data.students || 0,
        averageTimeSpent: await this.getAverageTimeSpent(id),
        peakViewingHours: await this.getPeakViewingHours(id),
      },
      progressStats: await this.getProgressStats(id),
      resourceStats: await this.getResourceStats(id),
    };
  }

  async getStudentProgress(id: string) {
    const { data, error } = await this.supabase.client
      .from("user_progress")
      .select(
        `
        *,
        user:users(email)
      `
      )
      .eq("lesson_id", id)
      .order("last_activity", { ascending: false });

    if (error) throw error;
    return data;
  }

  private async enrichLessonDetails(lesson: any): Promise<AdminLessonDetails> {
    const [totalViews, uniqueStudents, averageTimeSpent, completionRate] =
      await Promise.all([
        this.getTotalViews(lesson.id),
        this.getUniqueStudents(lesson.id),
        this.getAverageTimeSpent(lesson.id),
        this.getCompletionRate(lesson.id),
      ]);

    return {
      ...lesson,
      totalViews,
      uniqueStudents,
      averageTimeSpent,
      completionRate,
    };
  }

  private async getTotalViews(lessonId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("learning_activities")
      .select("*", { count: "exact" })
      .eq("lesson_id", lessonId);

    return count || 0;
  }

  private async getUniqueStudents(lessonId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("learning_activities")
      .select("student_id")
      .eq("lesson_id", lessonId);

    return new Set(data?.map((d) => d.student_id)).size;
  }

  private async getAverageTimeSpent(lessonId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("learning_activities")
      .select("duration")
      .eq("lesson_id", lessonId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.duration || 0), 0) /
      data.length
    );
  }

  private async getCompletionRate(lessonId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("lesson_id", lessonId);

    if (!data?.length) return 0;

    const completedCount = data.filter(
      (record) => record.progress_percentage === 100
    ).length;
    return (completedCount / data.length) * 100;
  }

  private async getPeakViewingHours(lessonId: string) {
    const { data } = await this.supabase.client
      .from("learning_activities")
      .select("timestamp")
      .eq("lesson_id", lessonId);

    if (!data?.length) return [];

    const hourCounts = new Map<number, number>();
    data.forEach((activity) => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getProgressStats(lessonId: string) {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("lesson_id", lessonId);

    if (!data?.length) {
      return {
        completionRate: 0,
        inProgress: 0,
        notStarted: 0,
      };
    }

    return {
      completionRate:
        (data.filter((p) => p.progress_percentage === 100).length /
          data.length) *
        100,
      inProgress: data.filter(
        (p) => p.progress_percentage > 0 && p.progress_percentage < 100
      ).length,
      notStarted: data.filter((p) => p.progress_percentage === 0).length,
    };
  }

  private async getResourceStats(lessonId: string) {
    return {
      pdfDownloads: await this.getPdfDownloads(lessonId),
      videoViews: await this.getVideoViews(lessonId),
      averageWatchTime: await this.getAverageWatchTime(lessonId),
    };
  }

  private async getPdfDownloads(lessonId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("learning_activities")
      .select("*", { count: "exact" })
      .eq("lesson_id", lessonId)
      .eq("activity_type", "resource_access")
      .eq("resource_type", "pdf");

    return count || 0;
  }

  private async getVideoViews(lessonId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("learning_activities")
      .select("*", { count: "exact" })
      .eq("lesson_id", lessonId)
      .eq("activity_type", "resource_access")
      .eq("resource_type", "video");

    return count || 0;
  }

  private async getAverageWatchTime(lessonId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("learning_activities")
      .select("duration")
      .eq("lesson_id", lessonId)
      .eq("activity_type", "resource_access")
      .eq("resource_type", "video");

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.duration || 0), 0) /
      data.length
    );
  }
}
