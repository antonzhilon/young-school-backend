import { Injectable } from "@nestjs/common";
import { ProgressService } from "./services/progress.service";
import { TestStatsService } from "./services/test-stats.service";
import { ActivityService } from "./services/activity.service";
import { DateRangeDto } from "./dto/date-range.dto";

@Injectable()
export class StatisticsService {
  constructor(
    private readonly progressService: ProgressService,
    private readonly testStatsService: TestStatsService,
    private readonly activityService: ActivityService
  ) {}

  async getCourseProgress(courseId: string, userId: string) {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  async getSubjectProgress(subjectId: string, userId: string) {
    return this.progressService.getSubjectProgress(userId, subjectId);
  }

  async getTestStats(dateRange: DateRangeDto, userId: string) {
    return this.testStatsService.getUserTestStats(userId, dateRange);
  }

  async getActivityStats(userId: string) {
    return this.activityService.getUserActivity(userId);
  }
}
