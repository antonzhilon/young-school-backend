/*
  # Add progress tracking tables

  1. New Tables
    - `learning_paths`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references auth.users)
      - `course_id` (uuid, references courses)
      - `current_module_id` (uuid, references course_modules)
      - `target_completion_date` (date)
      - `status` (enum: in_progress, completed, paused)

    - `learning_activities`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references auth.users)
      - `activity_type` (enum: lesson_view, test_attempt, resource_access)
      - `resource_id` (uuid)
      - `duration` (interval)
      - `completed` (boolean)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for students and teachers
*/

-- Create status enum
CREATE TYPE learning_status AS ENUM ('in_progress', 'completed', 'paused');
CREATE TYPE activity_type AS ENUM ('lesson_view', 'test_attempt', 'resource_access');

-- Create learning paths table
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

-- Create learning activities table
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

-- Enable RLS
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;

-- Policies for learning_paths
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

-- Policies for learning_activities
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_student_id ON learning_paths(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_course_id ON learning_paths(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_student_id ON learning_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_timestamp ON learning_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_learning_activities_type ON learning_activities(activity_type);