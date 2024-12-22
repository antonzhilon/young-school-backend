/*
  # Initial Database Schema

  1. Schema Overview
    - User management and roles
    - Educational content (subjects, courses, modules, lessons)
    - Assessment system (tests, tasks, answers)
    - Progress tracking
    - Access control
    - Student groups
    - Audit logging
    - Learning paths and activities

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access control
    - Audit logging for sensitive operations

  3. Performance
    - Appropriate indexes on frequently queried columns
    - Optimized table structure
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE task_type AS ENUM ('single_choice', 'multiple_choice');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE learning_status AS ENUM ('in_progress', 'completed', 'paused');
CREATE TYPE activity_type AS ENUM ('lesson_view', 'test_attempt', 'resource_access');

-- User Roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects NOT NULL,
  name text NOT NULL,
  description text,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course Modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses NOT NULL,
  name text NOT NULL,
  description text,
  sequence_number int NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  difficulty difficulty_level DEFAULT 'medium',
  task_type task_type NOT NULL,
  options jsonb NOT NULL,
  correct_answers jsonb NOT NULL,
  explanation text,
  points int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test Tasks junction table
CREATE TABLE IF NOT EXISTS test_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests NOT NULL,
  task_id uuid REFERENCES tasks NOT NULL,
  sequence_number int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(test_id, task_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES course_modules NOT NULL,
  subject_id uuid REFERENCES subjects NOT NULL,
  name text NOT NULL,
  description text,
  test_id uuid REFERENCES tests,
  pdf_link text,
  video_link text,
  sequence_number int NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES course_modules NOT NULL,
  test_id uuid REFERENCES tests NOT NULL,
  task_id uuid REFERENCES tasks NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  answer jsonb NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses,
  module_id uuid REFERENCES course_modules,
  subject_id uuid REFERENCES subjects,
  progress_percentage decimal DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id, module_id)
);

-- Course Access table
CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  granted_by uuid REFERENCES auth.users NOT NULL,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Student Groups table
CREATE TABLE IF NOT EXISTS student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Group Members table
CREATE TABLE IF NOT EXISTS student_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES student_groups ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  current_module_id uuid REFERENCES course_modules,
  target_completion_date date,
  status learning_status DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Learning Activities table
CREATE TABLE IF NOT EXISTS learning_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users NOT NULL,
  activity_type activity_type NOT NULL,
  resource_id uuid NOT NULL,
  duration interval,
  completed boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Roles policies
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Subjects policies
CREATE POLICY "Everyone can view subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON subjects
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Courses policies
CREATE POLICY "Everyone can view courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Course Modules policies
CREATE POLICY "Everyone can view course modules"
  ON course_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Lessons policies
CREATE POLICY "Everyone can view lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- Tests policies
CREATE POLICY "Everyone can view tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (true);

-- Tasks policies
CREATE POLICY "Everyone can view tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- Test Tasks policies
CREATE POLICY "Everyone can view test tasks"
  ON test_tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and teachers can manage test tasks"
  ON test_tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
    )
  );

-- Answers policies
CREATE POLICY "Users can view and create their own answers"
  ON answers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view their students' progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('teacher', 'admin')
    )
  );

-- Course Access policies
CREATE POLICY "Users can view their own access"
  ON course_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can manage course access"
  ON course_access
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('teacher', 'admin')
    )
  );

-- Student Groups policies
CREATE POLICY "Teachers can manage their own groups"
  ON student_groups
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = teacher_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Students can view groups they belong to"
  ON student_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_group_members
      WHERE student_id = auth.uid()
      AND group_id = student_groups.id
    )
  );

-- Student Group Members policies
CREATE POLICY "Teachers can manage their group members"
  ON student_group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_groups
      WHERE id = student_group_members.group_id
      AND teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Students can view their group memberships"
  ON student_group_members
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Audit Logs policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Learning Paths policies
CREATE POLICY "Students can view and update their learning paths"
  ON learning_paths
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view their students' learning paths"
  ON learning_paths
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_group_members sgm
      JOIN student_groups sg ON sgm.group_id = sg.id
      WHERE sgm.student_id = learning_paths.student_id
      AND sg.teacher_id = auth.uid()
    )
  );

-- Learning Activities policies
CREATE POLICY "Students can manage their learning activities"
  ON learning_activities
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view their students' activities"
  ON learning_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_group_members sgm
      JOIN student_groups sg ON sgm.group_id = sg.id
      WHERE sgm.student_id = learning_activities.student_id
      AND sg.teacher_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON courses(subject_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_tasks_test_id ON test_tasks(test_id);
CREATE INDEX IF NOT EXISTS idx_test_tasks_task_id ON test_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_user_id ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_teacher_id ON student_groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_group_id ON student_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_student_id ON student_group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_learning_paths_student_id ON learning_paths(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_course_id ON learning_paths(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_student_id ON learning_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_timestamp ON learning_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_learning_activities_type ON learning_activities(activity_type);