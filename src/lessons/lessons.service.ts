import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { Lesson } from "./interfaces/lesson.interface";

@Injectable()
export class LessonsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .insert(createLessonDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(): Promise<Lesson[]> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        module:course_modules(name),
        subject:subjects(name),
        test:tests(name)
      `
      )
      .order("sequence_number");

    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Lesson> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        module:course_modules(name),
        subject:subjects(name),
        test:tests(name)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Lesson not found");
    return data;
  }

  async findByModule(moduleId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        module:course_modules(name),
        subject:subjects(name),
        test:tests(name)
      `
      )
      .eq("module_id", moduleId)
      .order("sequence_number");

    if (error) throw error;
    return data;
  }

  async findBySubject(subjectId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase.client
      .from("lessons")
      .select(
        `
        *,
        module:course_modules(name),
        subject:subjects(name),
        test:tests(name)
      `
      )
      .eq("subject_id", subjectId)
      .order("sequence_number");

    if (error) throw error;
    return data;
  }
}
