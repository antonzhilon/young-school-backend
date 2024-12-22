import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { SupabaseService } from "../database/supabase.service";

@Module({
  controllers: [TasksController],
  providers: [TasksService, SupabaseService],
  exports: [TasksService],
})
export class TasksModule {}
