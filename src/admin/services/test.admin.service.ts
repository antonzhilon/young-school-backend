import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../database/supabase.service";
import { AdminCreateTestDto } from "../dto/test/create-test.admin.dto";
import { AdminTestFilterDto } from "../dto/test/test-filter.admin.dto";
import { AdminPaginatedResponse } from "../interfaces/admin-response.interface";
import {
  AdminTestDetails,
  AdminTestStats,
} from "../interfaces/test.admin.interface";

@Injectable()
export class TestAdminService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createTestDto: AdminCreateTestDto): Promise<AdminTestDetails> {
    const { tasks, ...testData } = createTestDto;

    // Create test
    const { data: test, error: testError } = await this.supabase.client
      .from("tests")
      .insert(testData)
      .select()
      .single();

    if (testError) throw testError;

    // Create tasks if provided
    if (tasks?.length) {
      const tasksWithTestId = tasks.map((task) => ({
        ...task,
        testId: test.id,
      }));

      const { error: tasksError } = await this.supabase.client
        .from("tasks")
        .insert(tasksWithTestId);

      if (tasksError) throw tasksError;
    }

    return this.findOne(test.id);
  }

  async findAll(
    filters: AdminTestFilterDto
  ): Promise<AdminPaginatedResponse<AdminTestDetails>> {
    let query = this.supabase.client.from("tests").select(
      `
        *,
        tasks:tasks(count),
        answers:answers(count)
      `,
      { count: "exact" }
    );

    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
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

    const testDetails = await Promise.all(
      data.map(async (test) => {
        const stats = await this.calculateTestStats(test.id);
        return {
          ...test,
          totalAttempts: test.answers,
          ...stats,
        };
      })
    );

    const totalPages = Math.ceil((count || 0) / filters.limit);

    return {
      data: testDetails,
      meta: {
        total: count || 0,
        page: filters.page,
        lastPage: totalPages,
        hasNextPage: filters.page < totalPages,
      },
    };
  }

  async findOne(id: string): Promise<AdminTestDetails> {
    const { data, error } = await this.supabase.client
      .from("tests")
      .select(
        `
        *,
        tasks:tasks(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Test not found");

    const stats = await this.calculateTestStats(id);

    return {
      ...data,
      ...stats,
    };
  }

  async update(
    id: string,
    updateTestDto: AdminCreateTestDto
  ): Promise<AdminTestDetails> {
    const { tasks, ...testData } = updateTestDto;

    const { data, error } = await this.supabase.client
      .from("tests")
      .update(testData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException("Test not found");

    if (tasks?.length) {
      // Delete existing tasks
      await this.supabase.client.from("tasks").delete().eq("test_id", id);

      // Create new tasks
      const tasksWithTestId = tasks.map((task) => ({
        ...task,
        testId: id,
      }));

      await this.supabase.client.from("tasks").insert(tasksWithTestId);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from("tests")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getTestStats(id: string): Promise<AdminTestStats> {
    const [attempts, scores, times] = await Promise.all([
      this.getTestAttempts(id),
      this.getTestScores(id),
      this.getCompletionTimes(id),
    ]);

    const uniqueStudents = new Set(attempts.map((a) => a.user_id)).size;
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passRate =
      scores.filter((score) => score >= 70).length / scores.length;
    const averageTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;

    const difficultyDistribution = await this.getTaskDifficultyDistribution(id);

    return {
      totalAttempts: attempts.length,
      uniqueStudents,
      averageScore,
      passRate,
      averageCompletionTime: averageTime,
      difficultyDistribution,
    };
  }

  async getTestResults(id: string) {
    const { data, error } = await this.supabase.client
      .from("answers")
      .select(
        `
        *,
        user:users(email),
        task:tasks(question, difficulty)
      `
      )
      .eq("test_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  private async calculateTestStats(testId: string) {
    const { data: answers } = await this.supabase.client
      .from("answers")
      .select("is_correct")
      .eq("test_id", testId);

    if (!answers?.length) {
      return {
        averageScore: 0,
        passRate: 0,
      };
    }

    const correctAnswers = answers.filter((a) => a.is_correct).length;
    const averageScore = (correctAnswers / answers.length) * 100;
    const passRate = averageScore >= 70 ? 1 : 0;

    return {
      averageScore,
      passRate,
    };
  }

  private async getTestAttempts(testId: string) {
    const { data } = await this.supabase.client
      .from("answers")
      .select("user_id, created_at")
      .eq("test_id", testId);
    return data || [];
  }

  private async getTestScores(testId: string) {
    const { data } = await this.supabase.client
      .from("answers")
      .select("is_correct")
      .eq("test_id", testId);
    return data?.map((a) => (a.is_correct ? 100 : 0)) || [];
  }

  private async getCompletionTimes(testId: string) {
    // Implementation depends on how you track completion times
    return [0];
  }

  private async getTaskDifficultyDistribution(testId: string) {
    const { data } = await this.supabase.client
      .from("tasks")
      .select("difficulty")
      .eq("test_id", testId);

    const distribution = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    data?.forEach((task) => {
      distribution[task.difficulty.toLowerCase()]++;
    });

    return distribution;
  }
}
