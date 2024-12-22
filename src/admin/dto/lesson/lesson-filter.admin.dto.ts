import { IsOptional, IsString, IsUUID } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";

export class AdminLessonFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by module ID" })
  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @ApiPropertyOptional({ description: "Filter by subject ID" })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: "Filter by lesson name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by content" })
  @IsOptional()
  @IsString()
  content?: string;
}
