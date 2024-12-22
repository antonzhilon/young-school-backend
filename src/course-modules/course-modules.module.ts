import { Module } from "@nestjs/common";
import { CourseModulesService } from "./course-modules.service";
import { CourseModulesController } from "./course-modules.controller";
import { SupabaseService } from "../database/supabase.service";

@Module({
  controllers: [CourseModulesController],
  providers: [CourseModulesService, SupabaseService],
  exports: [CourseModulesService],
})
export class CourseModulesModule {}
