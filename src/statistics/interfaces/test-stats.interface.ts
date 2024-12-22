export interface TestStats {
  testId: string;
  testName: string;
  totalAttempts: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate: Date;
}

export interface UserTestStats {
  userId: string;
  tests: TestStats[];
}
