export interface CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  grantedBy: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseAccessWithDetails extends CourseAccess {
  course: {
    name: string;
    description?: string;
  };
  user: {
    email: string;
  };
}
