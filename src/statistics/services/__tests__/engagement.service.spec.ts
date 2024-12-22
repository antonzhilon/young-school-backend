import { Test, TestingModule } from "@nestjs/testing";
import { EngagementService } from "../engagement.service";
import {
  ParticipationService,
  CompletionService,
  InteractionService,
  ConsistencyService,
} from "../metrics";

describe("EngagementService", () => {
  let service: EngagementService;
  let participationService: ParticipationService;
  let completionService: CompletionService;
  let interactionService: InteractionService;
  let consistencyService: ConsistencyService;

  const mockMetricServices = {
    calculateParticipationRate: jest.fn(),
    calculateCompletionRate: jest.fn(),
    calculateInteractionScore: jest.fn(),
    calculateConsistencyScore: jest.fn(),
    getCompletedLessons: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: ParticipationService,
          useValue: mockMetricServices,
        },
        {
          provide: CompletionService,
          useValue: mockMetricServices,
        },
        {
          provide: InteractionService,
          useValue: mockMetricServices,
        },
        {
          provide: ConsistencyService,
          useValue: mockMetricServices,
        },
      ],
    }).compile();

    service = module.get<EngagementService>(EngagementService);
    participationService =
      module.get<ParticipationService>(ParticipationService);
    completionService = module.get<CompletionService>(CompletionService);
    interactionService = module.get<InteractionService>(InteractionService);
    consistencyService = module.get<ConsistencyService>(ConsistencyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getEngagementMetrics", () => {
    const userId = "user-123";
    const mockMetrics = {
      participationRate: 80,
      completionRate: 75,
      interactionScore: 90,
      consistencyScore: 85,
      completedLessons: 10,
    };

    beforeEach(() => {
      mockMetricServices.calculateParticipationRate.mockResolvedValue(
        mockMetrics.participationRate
      );
      mockMetricServices.calculateCompletionRate.mockResolvedValue(
        mockMetrics.completionRate
      );
      mockMetricServices.calculateInteractionScore.mockResolvedValue(
        mockMetrics.interactionScore
      );
      mockMetricServices.calculateConsistencyScore.mockResolvedValue(
        mockMetrics.consistencyScore
      );
      mockMetricServices.getCompletedLessons.mockResolvedValue(
        mockMetrics.completedLessons
      );
    });

    it("should return engagement metrics successfully", async () => {
      const result = await service.getEngagementMetrics(userId);

      expect(result).toMatchObject({
        userId,
        metrics: {
          participationRate: mockMetrics.participationRate,
          completionRate: mockMetrics.completionRate,
          interactionScore: mockMetrics.interactionScore,
          consistencyScore: mockMetrics.consistencyScore,
        },
        details: {
          completedLessons: mockMetrics.completedLessons,
        },
      });
    });

    it("should handle date range filtering", async () => {
      const dateRange = {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      };

      const result = await service.getEngagementMetrics(userId, dateRange);

      expect(result.period).toEqual({
        start: new Date(dateRange.startDate),
        end: new Date(dateRange.endDate),
      });
    });
  });
});
