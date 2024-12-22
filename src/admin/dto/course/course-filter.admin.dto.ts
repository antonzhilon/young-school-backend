import { IsOptional, IsString, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";

export class AdminCourseFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by subject ID" })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ description: "Filter by course name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by paid/free courses" })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
