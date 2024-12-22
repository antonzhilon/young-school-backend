import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminCreateTopicDto {
  @ApiProperty({ description: "Topic name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Topic description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Subject ID" })
  @IsNotEmpty()
  @IsUUID()
  subjectId: string;

  @ApiProperty({
    description: "Parent topic ID (for subtopics)",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: "Related topics",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  relatedTopics?: string[];
}
