import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { Subject } from "./interfaces/subject.interface";

@Injectable()
export class SubjectsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const { data, error } = await this.supabase.client
      .from("subjects")
      .insert(createSubjectDto)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(): Promise<Subject[]> {
    const { data, error } = await this.supabase.client
      .from("subjects")
      .select("*");

    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Subject> {
    const { data, error } = await this.supabase.client
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }
}
