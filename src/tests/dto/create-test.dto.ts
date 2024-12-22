import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTestDto {
  @ApiProperty({ description: "Test name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Test description" })
  @IsOptional()
  @IsString()
  description?: string;
}
