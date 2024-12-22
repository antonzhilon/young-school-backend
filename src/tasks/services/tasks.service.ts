import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { Task } from "../interfaces/task.interface";

@Injectable()
export class TasksService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .insert({
        question: createTaskDto.question,
        difficulty: createTaskDto.difficulty,
        type: createTaskDto.type,
        options: JSON.stringify(createTaskDto.options),
        correct_answers: JSON.stringify(createTaskDto.correctAnswers),
        explanation: createTaskDto.explanation,
        points: createTaskDto.points || 1,
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
      .from("test_tasks")
      .select(
        `
        task:tasks(*)
      `
      )
      .eq("test_id", testId)
      .order("sequence_number");

    if (error) throw error;
    return data.map((item) => this.mapTaskResponse(item.task));
  }

  private mapTaskResponse(data: any): Task {
    return {
      ...data,
      options: JSON.parse(data.options),
      correctAnswers: JSON.parse(data.correct_answers),
    };
  }
}
