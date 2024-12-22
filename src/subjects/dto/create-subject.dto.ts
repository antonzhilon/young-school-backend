import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSubjectDto {
  @ApiProperty({ description: "Subject name" })
  @IsNotEmpty()
  @IsString()
  name: string;
}
