export interface AdminPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  activeStudents: number;
  completionRate: number;
  lastUpdated: Date;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentActivity: AdminActivity[];
  userGrowth: UserGrowthData[];
}

export interface AdminActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
}

export interface UserGrowthData {
  date: string;
  count: number;
}
