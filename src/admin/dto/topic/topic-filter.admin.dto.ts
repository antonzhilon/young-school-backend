import { IsOptional, IsString, IsUUID } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminPaginationDto } from "../pagination.dto";

export class AdminTopicFilterDto extends AdminPaginationDto {
  @ApiPropertyOptional({ description: "Filter by topic name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by subject ID" })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: "Filter by parent topic ID" })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
