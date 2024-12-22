/*
  # Add student groups functionality

  1. New Tables
    - `student_groups`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `student_group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references student_groups)
      - `student_id` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for teachers to manage their groups
    - Add policies for students to view their groups
*/

-- Create student groups table
CREATE TABLE IF NOT EXISTS student_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student group members table
CREATE TABLE IF NOT EXISTS student_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES student_groups ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Enable RLS
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_group_members ENABLE ROW LEVEL SECURITY;

-- Policies for student_groups table
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

-- Policies for student_group_members table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_groups_teacher_id ON student_groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_group_id ON student_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_student_group_members_student_id ON student_group_members(student_id);