import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateTaskDto } from "../dto/task/create-task.admin.dto";
import { AdminTaskFilterDto } from "../dto/task/task-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import {
  AdminTaskDetails,
  AdminTaskStats,
} from "../interfaces/task.admin.interface";

@Injectable()
export class TaskAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createTaskDto: AdminCreateTaskDto): Promise<AdminTaskDetails> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .insert({
        test_id: createTaskDto.testId,
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
    return this.enrichTaskDetails(data);
  }

  async findAll(
    filters: AdminTaskFilterDto
  ): Promise<AdminPaginatedResponse<AdminTaskDetails>> {
    let query = this.supabase.client
      .from("tasks")
      .select("*", { count: "exact" });

    if (filters.testId) {
      query = query.eq("test_id", filters.testId);
    }
    if (filters.question) {
      query = query.ilike("question", `%${filters.question}%`);
    }
    if (filters.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    if (filters.sortBy) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortDirection === "asc",
      });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const taskDetails = await Promise.all(
      data.map((task) => this.enrichTaskDetails(task))
    );

    const totalPages = Math.ceil((count || 0) / filters.limit);

    return {
      data: taskDetails,
      meta: {
        total: count || 0,
        page: filters.page,
        lastPage: totalPages,
        hasNextPage: filters.page < totalPages,
      },
    };
  }

  async findOne(id: string): Promise<AdminTaskDetails> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Task not found");

    return this.enrichTaskDetails(data);
  }

  async update(
    id: string,
    updateTaskDto: AdminCreateTaskDto
  ): Promise<AdminTaskDetails> {
    const { data, error } = await this.supabase.client
      .from("tasks")
      .update({
        test_id: updateTaskDto.testId,
        question: updateTaskDto.question,
        difficulty: updateTaskDto.difficulty,
        type: updateTaskDto.type,
        options: JSON.stringify(updateTaskDto.options),
        correct_answers: JSON.stringify(updateTaskDto.correctAnswers),
        explanation: updateTaskDto.explanation,
        points: updateTaskDto.points,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Task not found");

    return this.enrichTaskDetails(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getTaskStats(id: string): Promise<AdminTaskStats> {
    const [
      attempts,
      uniqueStudents,
      successRate,
      completionTime,
      difficultyRating,
      mistakes,
      timeDistribution,
    ] = await Promise.all([
      this.getTotalAttempts(id),
      this.getUniqueStudents(id),
      this.getSuccessRate(id),
      this.getAverageCompletionTime(id),
      this.calculateDifficultyRating(id),
      this.getCommonMistakes(id),
      this.getTimeDistribution(id),
    ]);

    return {
      totalAttempts: attempts,
      uniqueStudents,
      successRate,
      averageCompletionTime: completionTime,
      difficultyRating,
      commonMistakes: mistakes,
      timeDistribution,
    };
  }

  async getTaskAnswers(id: string) {
    const { data, error } = await this.supabase.client
      .from("answers")
      .select(
        `
        *,
        user:users(email),
        created_at
      `
      )
      .eq("task_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  private async enrichTaskDetails(task: any): Promise<AdminTaskDetails> {
    const [totalAttempts, correctAttempts, averageTime] = await Promise.all([
      this.getTotalAttempts(task.id),
      this.getCorrectAttempts(task.id),
      this.getAverageCompletionTime(task.id),
    ]);

    return {
      ...task,
      options: JSON.parse(task.options),
      correctAnswers: JSON.parse(task.correct_answers),
      totalAttempts,
      correctAttempts,
      successRate: totalAttempts ? (correctAttempts / totalAttempts) * 100 : 0,
      averageCompletionTime: averageTime,
    };
  }

  private async getTotalAttempts(taskId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("answers")
      .select("*", { count: "exact" })
      .eq("task_id", taskId);

    return count || 0;
  }

  private async getCorrectAttempts(taskId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("answers")
      .select("*", { count: "exact" })
      .eq("task_id", taskId)
      .eq("is_correct", true);

    return count || 0;
  }

  private async getUniqueStudents(taskId: string): Promise<number> {
    const { count } = await this.supabase.client
      .from("answers")
      .select("user_id", { count: "exact", distinct: true })
      .eq("task_id", taskId);

    return count || 0;
  }

  private async getSuccessRate(taskId: string): Promise<number> {
    const [total, correct] = await Promise.all([
      this.getTotalAttempts(taskId),
      this.getCorrectAttempts(taskId),
    ]);

    return total ? (correct / total) * 100 : 0;
  }

  private async getAverageCompletionTime(taskId: string): Promise<number> {
    const { data } = await this.supabase.client
      .from("answers")
      .select("completion_time")
      .eq("task_id", taskId);

    if (!data?.length) return 0;
    return (
      data.reduce((sum, record) => sum + (record.completion_time || 0), 0) /
      data.length
    );
  }

  private async calculateDifficultyRating(taskId: string): Promise<number> {
    const successRate = await this.getSuccessRate(taskId);
    return Math.max(1, Math.min(5, 6 - successRate / 20));
  }

  private async getCommonMistakes(taskId: string) {
    const { data } = await this.supabase.client
      .from("answers")
      .select("answer")
      .eq("task_id", taskId)
      .eq("is_correct", false);

    if (!data?.length) return [];

    const mistakes = new Map<string, number>();
    data.forEach((record) => {
      const answer = JSON.stringify(record.answer);
      mistakes.set(answer, (mistakes.get(answer) || 0) + 1);
    });

    return Array.from(mistakes.entries())
      .map(([answer, count]) => ({
        answer: JSON.parse(answer),
        count,
        percentage: (count / data.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getTimeDistribution(taskId: string) {
    const { data } = await this.supabase.client
      .from("answers")
      .select("completion_time")
      .eq("task_id", taskId);

    if (!data?.length) {
      return { fast: 0, average: 0, slow: 0 };
    }

    const times = data.map((r) => r.completion_time || 0);
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const stdDev = Math.sqrt(
      times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
        times.length
    );

    return {
      fast: times.filter((t) => t < avg - stdDev).length,
      average: times.filter((t) => t >= avg - stdDev && t <= avg + stdDev)
        .length,
      slow: times.filter((t) => t > avg + stdDev).length,
    };
  }
}
