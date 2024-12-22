import { BaseEntity } from "@/common/interfaces/base.interface";
import { Task } from "@/tasks/interfaces/task.interface";

export interface Test extends BaseEntity {
  name: string;
  description?: string;
  tasks?: Task[];
}

export interface TestWithTasks extends Test {
  tasks: Task[];
}
