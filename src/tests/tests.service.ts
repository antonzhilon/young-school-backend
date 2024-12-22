import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@/database/supabase.service';
import { CreateTestDto } from './dto/create-test.dto';
import { Test, TestWithTasks } from './interfaces/test.interface';
import {TestResponse} from "@/tests/interfaces/test-response.interface";

interface TestTaskData {
  task: {
    id: string;
    [key: string]: any;
  };
  sequence_number: number;
}

interface TestData extends Test {
  tasks?: TestTaskData[];
}

@Injectable()
export class TestsService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(createTestDto: CreateTestDto): Promise<Test> {
    const { data, error } = await this.supabase.client
        .from('tests')
        .insert(createTestDto)
        .select()
        .single();

    if (error || !data) throw error;
    return data;
  }

  async findAll(): Promise<Test[]> {
    const { data, error } = await this.supabase.client
        .from('tests')
        .select<string, TestResponse>(`
        *,
        tasks:test_tasks(
          task:tasks(*)
        )
      `);

    if (error || !data) throw error;

    return data.map((test) => ({
      ...test,
      tasks: test.tasks?.map(t => t.task)
    }));
  }

  async findOne(id: string): Promise<TestWithTasks> {
    const { data, error } = await this.supabase.client
        .from('tests')
        .select(`
        *,
        tasks:test_tasks(
          task:tasks(*),
          sequence_number
        )
      `)
        .eq('id', id)
        .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Test not found');

    return {
      ...data,
      tasks: data.tasks
          ?.sort((a: TestTaskData, b: TestTaskData) => a.sequence_number - b.sequence_number)
          .map((t: TestTaskData) => t.task) || []
    };
  }
}
