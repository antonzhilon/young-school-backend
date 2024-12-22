import { Test } from './test.interface';
import { Task } from '@/tasks/interfaces/task.interface';

export interface TestResponse extends Test {
    tasks?: {
        task: Task;
        sequence_number: number;
    }[];
}

export interface TestData {
    id: string;
    name: string;
    description?: string;
    tasks?: {
        task: Task;
        sequence_number: number;
    }[];
}
