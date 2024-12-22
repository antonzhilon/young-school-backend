import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { SubjectsModule } from "./subjects/subjects.module";
import { CoursesModule } from "./courses/courses.module";
import { LessonsModule } from "./lessons/lessons.module";
import { TestsModule } from "./tests/tests.module";
// import { UsersModule } from "./users/users.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { AdminModule } from "./admin/admin.module";
import { CourseAccessModule } from "./course-access/course-access.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    SubjectsModule,
    CoursesModule,
    LessonsModule,
    TestsModule,
    // UsersModule,
    // StatisticsModule,
    AdminModule,
    CourseAccessModule,
  ],
})
export class AppModule {}
