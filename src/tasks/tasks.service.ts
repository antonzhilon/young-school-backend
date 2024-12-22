import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../database/supabase.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Task } from "./interfaces/task.interface";

@Injectable()
export class TasksService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .insert({
        ...createTaskDto,
        options: JSON.stringify(createTaskDto.options),
        correct_answers: JSON.stringify(createTaskDto.correctAnswers),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTaskResponse(data);
  }

  async findAll(): Promise<Task[]> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .select("*");

    if (error) throw error;
    return data.map(this.mapTaskResponse);
  }

  async findOne(id: string): Promise<Task> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Task not found");
    return this.mapTaskResponse(data);
  }

  async findByTest(testId: string): Promise<Task[]> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .select("*")
      .eq("test_id", testId)
      .order("created_at");

    if (error) throw error;
    return data.map(this.mapTaskResponse);
  }

  private mapTaskResponse(data: any): Task {
    return {
      ...data,
      options: JSON.parse(data.options),
      correctAnswers: JSON.parse(data.correct_answers),
    };
  }
}
