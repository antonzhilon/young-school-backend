import { Module } from "@nestjs/common";
import { TestsService } from "./tests.service";
import { TestsController } from "./tests.controller";
import { SupabaseService } from "../database/supabase.service";

@Module({
  controllers: [TestsController],
  providers: [TestsService, SupabaseService],
  exports: [TestsService],
})
export class TestsModule {}
