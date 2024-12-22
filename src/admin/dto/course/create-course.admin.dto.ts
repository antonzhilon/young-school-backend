import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminCreateCourseDto {
  @ApiProperty({ description: "Course name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Course description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Subject ID" })
  @IsNotEmpty()
  @IsUUID()
  subjectId: string;

  @ApiProperty({ description: "Is this a paid course?" })
  @IsOptional()
  @IsBoolean()
  isPaid: boolean = false;
}
