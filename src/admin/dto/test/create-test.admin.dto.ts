import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateTaskDto } from "../../../tasks/dto/create-task.dto";

export class AdminCreateTestDto {
  @ApiProperty({ description: "Test name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Test description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Tasks for the test", type: [CreateTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks?: CreateTaskDto[];
}
