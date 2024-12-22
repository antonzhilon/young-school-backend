import { Task } from "../../tasks/interfaces/task.interface";

export interface TestTask {
  task: Task;
  sequence_number: number;
}

export interface TestTaskResponse {
  tasks: TestTask[];
}
