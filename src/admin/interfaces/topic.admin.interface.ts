export interface AdminTopicDetails {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  subtopics: number;
  relatedTopics: string[];
  totalLessons: number;
  totalStudents: number;
  averageProgress: number;
}

export interface AdminTopicStats {
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageTimeSpent: number;
  popularLessons: {
    id: string;
    name: string;
    views: number;
  }[];
  studentProgress: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}
