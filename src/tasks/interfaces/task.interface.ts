import { BaseEntity } from "../../common/interfaces/base.interface";
import { TaskType } from "../../common/enums/task-type.enum";
import { Difficulty } from "../../common/enums/difficulty.enum";

export interface Task extends BaseEntity {
  question: string;
  difficulty: Difficulty;
  type: TaskType;
  options: string[];
  correctAnswers: string[];
  explanation?: string;
  points?: number;
}
