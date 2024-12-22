import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCourseModuleDto {
  @ApiProperty({ description: "Module name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Module description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Course ID" })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: "Sequence number in the course" })
  @IsNotEmpty()
  @IsInt()
  sequenceNumber: number;
}
