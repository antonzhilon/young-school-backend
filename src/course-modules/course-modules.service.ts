import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";
import { CreateCourseModuleDto } from "./dto/create-course-module.dto";
import { CourseModule } from "./interfaces/course-module.interface";

@Injectable()
export class CourseModulesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createModuleDto: CreateCourseModuleDto): Promise<CourseModule> {
    const { data, error } = await this.supabase.client
      .from("course_modules")
      .insert(createModuleDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(): Promise<CourseModule[]> {
    const { data, error } = await this.supabase.client
      .from("course_modules")
      .select(
        `
        *,
        course:courses(name)
      `
      )
      .order("sequence_number");

    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<CourseModule> {
    const { data, error } = await this.supabase.client
      .from("course_modules")
      .select(
        `
        *,
        course:courses(name)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Course module not found");
    return data;
  }

  async findByCourse(courseId: string): Promise<CourseModule[]> {
    const { data, error } = await this.supabase.client
      .from("course_modules")
      .select(
        `
        *,
        course:courses(name)
      `
      )
      .eq("course_id", courseId)
      .order("sequence_number");

    if (error) throw error;
    return data;
  }
}
