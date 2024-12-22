import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth.service";
import { SupabaseService } from "@/database/supabase.service";

describe("AuthService", () => {
  let service: AuthService;
  let supabaseService: SupabaseService;
  let jwtService: JwtService;

  const mockSupabaseService = {
    client: {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    const registerDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should register a new user successfully", async () => {
      const mockUser = { id: "user-123" };
      mockSupabaseService.client.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockJwtService.sign.mockReturnValue("mock-token");

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: "mock-token" });
      expect(mockSupabaseService.client.auth.signUp).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
      });
    });

    it("should throw error if registration fails", async () => {
      mockSupabaseService.client.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: new Error("Registration failed"),
      });

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user successfully", async () => {
      const mockUser = { id: "user-123" };
      mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockJwtService.sign.mockReturnValue("mock-token");

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: "mock-token" });
      expect(
        mockSupabaseService.client.auth.signInWithPassword
      ).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
    });

    it("should throw UnauthorizedException if login fails", async () => {
      mockSupabaseService.client.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: new Error("Invalid credentials"),
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });
});
