import { IsNotEmpty, IsUUID, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RevokeAccessDto {
  @ApiProperty({
    description: "Student IDs to revoke access from",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  studentIds: string[];

  @ApiProperty({ description: "Course ID to revoke access from" })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}
