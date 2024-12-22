import { Injectable, NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { SupabaseService } from "../database/supabase.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CourseFilterDto } from "./dto/course-filter.dto";
import { Course } from "./interfaces/course.interface";
import { PaginatedResponse } from "../common/interfaces/paginated-response.interface";
import {
  getPaginationRange,
  createPaginatedResponse,
} from "../common/utils/pagination.util";

@Injectable()
export class CoursesService {
  constructor(
    private readonly supabase: SupabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getCacheKey(filters: CourseFilterDto): string {
    return `courses:${JSON.stringify(filters)}`;
  }

  async findAll(filters: CourseFilterDto): Promise<PaginatedResponse<Course>> {
    const cacheKey = this.getCacheKey(filters);
    const cachedData = await this.cacheManager.get<PaginatedResponse<Course>>(
      cacheKey
    );

    if (cachedData) {
      return cachedData;
    }

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

    const { from, to } = getPaginationRange(filters);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const response = createPaginatedResponse(data, count || 0, filters);
    await this.cacheManager.set(cacheKey, response, 60 * 5); // Cache for 5 minutes

    return response;
  }

  async findOne(id: string): Promise<Course> {
    const cacheKey = `course:${id}`;
    const cachedCourse = await this.cacheManager.get<Course>(cacheKey);

    if (cachedCourse) {
      return cachedCourse;
    }

    const { data, error } = await this.supabase.client
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Course not found");

    await this.cacheManager.set(cacheKey, data, 60 * 5); // Cache for 5 minutes
    return data;
  }
}
