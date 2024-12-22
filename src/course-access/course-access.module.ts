import { Module } from "@nestjs/common";
import { CourseAccessController } from "./course-access.controller";
import { CourseAccessService } from "./course-access.service";
import { SupabaseService } from "../database/supabase.service";

@Module({
  controllers: [CourseAccessController],
  providers: [CourseAccessService, SupabaseService],
  exports: [CourseAccessService],
})
export class CourseAccessModule {}
