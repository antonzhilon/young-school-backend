import { UserRole } from "../../common/enums/user-role.enum";

export interface AdminUserDetails {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastSignIn?: Date;
  coursesEnrolled: number;
  coursesCompleted: number;
}

export interface AdminUserStats {
  totalLogins: number;
  averageSessionDuration: number;
  lastActivity: Date;
  completionRate: number;
  activeStreak: number;
}
