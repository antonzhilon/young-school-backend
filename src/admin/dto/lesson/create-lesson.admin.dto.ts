import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsUrl,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminCreateLessonDto {
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

  @ApiProperty({ description: "Test ID", required: false })
  @IsOptional()
  @IsUUID()
  testId?: string;

  @ApiProperty({ description: "PDF document link", required: false })
  @IsOptional()
  @IsUrl()
  pdfLink?: string;

  @ApiProperty({ description: "Video link", required: false })
  @IsOptional()
  @IsUrl()
  videoLink?: string;

  @ApiProperty({ description: "Sequence number in the module" })
  @IsNotEmpty()
  @IsInt()
  sequenceNumber: number;

  @ApiProperty({ description: "Content in markdown format", required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
