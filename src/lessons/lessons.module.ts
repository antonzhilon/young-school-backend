import { Module } from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { LessonsController } from "./lessons.controller";
import { SupabaseService } from "../database/supabase.service";

@Module({
  controllers: [LessonsController],
  providers: [LessonsService, SupabaseService],
  exports: [LessonsService],
})
export class LessonsModule {}
