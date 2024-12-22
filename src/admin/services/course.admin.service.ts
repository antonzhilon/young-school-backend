import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateCourseDto } from "../dto/course/create-course.admin.dto";
import { AdminUpdateCourseDto } from "../dto/course/update-course.admin.dto";
import { AdminCourseFilterDto } from "../dto/course/course-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import { Course } from "../../courses/interfaces/course.interface";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "../../common/utils/admin-pagination.util";

@Injectable()
export class CourseAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createCourseDto: AdminCreateCourseDto): Promise<Course> {
    const { data, error } = await this.supabase.client
      .from("courses")
      .insert(createCourseDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(
    filters: AdminCourseFilterDto
  ): Promise<AdminPaginatedResponse<Course>> {
    let query = this.supabase.client
      .from("courses")
      .select("*", { count: "exact" });

    if (filters.subjectId) {
      query = query.eq("subject_id", filters.subjectId);
    }
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (typeof filters.isPaid === "boolean") {
      query = query.eq("is_paid", filters.isPaid);
    }

    const { from, to, sortBy, sortDirection } = getPaginationParams(filters);

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === "asc" });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return createPaginatedResponse(data, count, filters);
  }

  async findOne(id: string): Promise<Course> {
    const { data, error } = await this.supabase.client
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Course not found");
    return data;
  }

  async update(
    id: string,
    updateCourseDto: AdminUpdateCourseDto
  ): Promise<Course> {
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

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getCourseStats(id: string) {
    const { data, error } = await this.supabase.client
      .from("courses")
      .select(
        `
        *,
        enrollments:course_access(count),
        completions:user_progress(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Course not found");

    return {
      id: data.id,
      enrollments: data.enrollments || 0,
      completions: data.completions || 0,
      averageProgress: await this.getAverageProgress(id),
      completionRate: data.enrollments
        ? (data.completions / data.enrollments) * 100
        : 0,
    };
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
