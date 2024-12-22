import { IsOptional, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class DateRangeDto {
  @ApiPropertyOptional({ description: "Start date for statistics" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date for statistics" })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
