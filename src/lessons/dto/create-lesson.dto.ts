import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateLessonDto {
  @ApiProperty({ description: "Lesson name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Lesson description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Module ID" })
  @IsNotEmpty()
  @IsUUID()
  moduleId: string;

  @ApiProperty({ description: "Subject ID" })
  @IsNotEmpty()
  @IsUUID()
  subjectId: string;

  @ApiProperty({ description: "Test ID" })
  @IsOptional()
  @IsUUID()
  testId?: string;

  @ApiProperty({ description: "PDF document link" })
  @IsOptional()
  @IsString()
  pdfLink?: string;

  @ApiProperty({ description: "Video link" })
  @IsOptional()
  @IsString()
  videoLink?: string;

  @ApiProperty({ description: "Sequence number in the module" })
  @IsNotEmpty()
  @IsInt()
  sequenceNumber: number;
}
