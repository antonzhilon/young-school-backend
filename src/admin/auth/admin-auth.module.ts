import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdminAuthController } from "./controllers/admin-auth.controller";
import { AdminAuthService } from "./services/admin-auth.service";
import { AdminSessionGuard } from "./guards/admin-session.guard";
import { SupabaseService } from "../../database/supabase.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_ADMIN_SECRET") as string,
        signOptions: { expiresIn: "4h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminSessionGuard, SupabaseService],
  exports: [AdminAuthService, AdminSessionGuard],
})
export class AdminAuthModule {}
