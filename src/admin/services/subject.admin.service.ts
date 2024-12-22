import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateSubjectDto } from "../dto/subject/create-subject.admin.dto";
import { AdminSubjectFilterDto } from "../dto/subject/subject-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import { AdminSubjectDetails } from "../interfaces/subject.admin.interface";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "../../common/utils/admin-pagination.util";

@Injectable()
export class SubjectAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(
    createSubjectDto: AdminCreateSubjectDto
  ): Promise<AdminSubjectDetails> {
    const { data, error } = await this.supabase.client
      .from("subjects")
      .insert(createSubjectDto)
      .select()
      .single();

    if (error) throw error;
    return this.enrichSubjectDetails(data);
  }

  async findAll(
    filters: AdminSubjectFilterDto
  ): Promise<AdminPaginatedResponse<AdminSubjectDetails>> {
    let query = this.supabase.client
      .from("subjects")
      .select("*", { count: "exact" });

    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }

    const { from, to, sortBy, sortDirection } = getPaginationParams(filters);

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === "asc" });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const subjectDetails = await Promise.all(
      data.map((subject) => this.enrichSubjectDetails(subject))
    );

    return createPaginatedResponse(subjectDetails, count, filters);
  }

  async findOne(id: string): Promise<AdminSubjectDetails> {
    const { data, error } = await this.supabase.client
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Subject not found");

    return this.enrichSubjectDetails(data);
  }

  private async enrichSubjectDetails(
    subject: any
  ): Promise<AdminSubjectDetails> {
    const [totalCourses, totalStudents, averageProgress] = await Promise.all([
      this.getCoursesCount(subject.id),
      this.getStudentsCount(subject.id),
      this.getAverageProgress(subject.id),
    ]);

    return {
      ...subject,
      totalCourses,
      totalStudents,
      averageProgress,
    };
  }

  private async getCoursesCount(subjectId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("courses")
      .select("*", { count: "exact" })
      .eq("subject_id", subjectId);

    return count || 0;
  }

  private async getStudentsCount(subjectId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("user_id")
      .eq("subject_id", subjectId);

    return new Set(data?.map((d) => d.user_id)).size;
  }

  private async getAverageProgress(subjectId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("user_progress")
      .select("progress_percentage")
      .eq("subject_id", subjectId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.progress_percentage || 0), 0) /
      data.length
    );
  }
}
