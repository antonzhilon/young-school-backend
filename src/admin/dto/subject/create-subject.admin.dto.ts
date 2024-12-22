import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminCreateSubjectDto {
  @ApiProperty({ description: "Subject name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Subject description" })
  @IsOptional()
  @IsString()
  description?: string;
}
