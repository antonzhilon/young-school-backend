import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { CourseAccessService } from "../services/course-access.service";

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(private readonly courseAccessService: CourseAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const courseId = request.params.courseId || request.body.courseId;

    if (!userId || !courseId) {
      return false;
    }

    return this.courseAccessService.verifyAccess(userId, courseId);
  }
}
