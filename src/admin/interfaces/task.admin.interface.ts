import { Task } from "../../tasks/interfaces/task.interface";

export interface AdminTaskDetails extends Task {
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  averageCompletionTime: number;
}

export interface AdminTaskStats {
  totalAttempts: number;
  uniqueStudents: number;
  successRate: number;
  averageCompletionTime: number;
  difficultyRating: number;
  commonMistakes: {
    answer: string;
    count: number;
    percentage: number;
  }[];
  timeDistribution: {
    fast: number;
    average: number;
    slow: number;
  };
}
