import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SupabaseService } from "@/database/supabase.service";
import { TokenService } from "./token.service";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthResponse } from "../interfaces/auth.interface";
import { UserRole } from "@/common/enums/user-role.enum";

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly tokenService: TokenService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (error) throw error;

    await this.supabase.client.from("user_roles").insert({
      user_id: user?.id,
      role: UserRole.STUDENT,
    });

    const accessToken = await this.tokenService.generateToken(
      user?.id!,
      user?.email!
    );

    return {
      accessToken,
      user: {
        id: user?.id || "",
        email: user?.email || "",
        roles: [UserRole.STUDENT],
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) throw new UnauthorizedException("Invalid credentials");

    const { data: roles } = await this.supabase.client
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id);

    const accessToken = await this.tokenService.generateToken(
      user?.id!,
      user?.email!
    );

    return {
      accessToken,
      user: {
        id: user?.id || "",
        email: user?.email || "",
        roles: roles?.map((r) => r.role) || [UserRole.STUDENT],
      },
    };
  }
}
