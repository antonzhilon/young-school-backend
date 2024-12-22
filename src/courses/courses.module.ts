import { Module } from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CoursesController } from "./courses.controller";
import { SupabaseService } from "../database/supabase.service";
import { RedisCacheModule } from "../common/cache/cache.module";

@Module({
  imports: [RedisCacheModule],
  controllers: [CoursesController],
  providers: [CoursesService, SupabaseService],
  exports: [CoursesService],
})
export class CoursesModule {}
