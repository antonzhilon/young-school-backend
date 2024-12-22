import { IsNotEmpty, IsString, IsEnum, IsArray, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { TaskType } from "../../common/enums/task-type.enum";
import { Difficulty } from "../../common/enums/difficulty.enum";

export class CreateTaskDto {
  @ApiProperty({ description: "Test ID" })
  @IsNotEmpty()
  @IsUUID()
  testId: string;

  @ApiProperty({ description: "Question text" })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ enum: Difficulty, description: "Task difficulty level" })
  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ enum: TaskType, description: "Task type" })
  @IsNotEmpty()
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({ description: "Answer options", type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ description: "Correct answers", type: [String] })
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}
