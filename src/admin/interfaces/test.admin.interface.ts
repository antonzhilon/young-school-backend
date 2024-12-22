import { Test } from "../../tests/interfaces/test.interface";
import { Task } from "../../tasks/interfaces/task.interface";

export interface AdminTestDetails extends Test {
  tasks: Task[];
  totalAttempts: number;
  averageScore: number;
  passRate: number;
}

export interface AdminTestStats {
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  passRate: number;
  averageCompletionTime: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}
