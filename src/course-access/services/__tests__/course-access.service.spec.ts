import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CourseAccessService } from "../course-access.service";
import { SupabaseService } from "../../../database/supabase.service";

describe("CourseAccessService", () => {
  let service: CourseAccessService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    client: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseAccessService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<CourseAccessService>(CourseAccessService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("grantAccess", () => {
    const grantAccessDto = {
      userId: "user-123",
      courseId: "course-123",
      validUntil: "2024-12-31",
    };

    it("should grant access successfully", async () => {
      mockSupabaseService.client.single.mockResolvedValueOnce({
        data: {},
        error: null,
      });
      mockSupabaseService.client.single.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await service.grantAccess("teacher-123", grantAccessDto);

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith(
        "course_access"
      );
      expect(mockSupabaseService.client.insert).toHaveBeenCalled();
    });

    it("should throw NotFoundException if course not found", async () => {
      mockSupabaseService.client.single.mockResolvedValueOnce({
        data: null,
        error: new Error(),
      });

      await expect(
        service.grantAccess("teacher-123", grantAccessDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("verifyAccess", () => {
    const userId = "user-123";
    const courseId = "course-123";

    it("should return true for valid access", async () => {
      mockSupabaseService.client.single.mockResolvedValue({
        data: { valid_until: "2024-12-31" },
        error: null,
      });

      const result = await service.verifyAccess(userId, courseId);
      expect(result).toBe(true);
    });

    it("should return false for expired access", async () => {
      mockSupabaseService.client.single.mockResolvedValue({
        data: { valid_until: "2020-12-31" },
        error: null,
      });

      const result = await service.verifyAccess(userId, courseId);
      expect(result).toBe(false);
    });
  });
});
