import { IsOptional, IsString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";
import { Difficulty } from "../../../common/enums/difficulty.enum";

export class AdminTestFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by test name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by difficulty",
    enum: Difficulty,
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
