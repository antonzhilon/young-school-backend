import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";
import { Difficulty } from "../../../common/enums/difficulty.enum";
import { TaskType } from "../../../common/enums/task-type.enum";

export class AdminTaskFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by test ID" })
  @IsOptional()
  @IsUUID()
  testId?: string;

  @ApiPropertyOptional({ description: "Filter by question text" })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({
    description: "Filter by difficulty",
    enum: Difficulty,
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ description: "Filter by task type", enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;
}
