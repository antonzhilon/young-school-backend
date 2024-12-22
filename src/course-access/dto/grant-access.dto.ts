import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GrantAccessDto {
  @ApiProperty({
    description: "Student IDs to grant access to",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  studentIds: string[];

  @ApiProperty({ description: "Course ID to grant access to" })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: "Access expiration date", required: false })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
