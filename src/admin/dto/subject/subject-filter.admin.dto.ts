import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";

export class AdminSubjectFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by subject name" })
  @IsOptional()
  @IsString()
  name?: string;
}
