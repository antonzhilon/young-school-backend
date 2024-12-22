/*
  # Update Test-Task Relationship

  1. Changes
    - Remove test_id from tasks table
    - Add tasks array to tests table
    - Create junction table for test-task relationship
  
  2. Data Migration
    - Create junction table entries from existing relationships
    - Remove test_id column from tasks
*/

-- Create junction table
CREATE TABLE IF NOT EXISTS test_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests NOT NULL,
  task_id uuid REFERENCES tasks NOT NULL,
  sequence_number int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(test_id, task_id)
);

-- Migrate existing relationships
INSERT INTO test_tasks (test_id, task_id, sequence_number)
SELECT test_id, id, 0
FROM tasks
WHERE test_id IS NOT NULL;

-- Remove test_id from tasks
ALTER TABLE tasks DROP COLUMN test_id;

-- Enable RLS
ALTER TABLE test_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX idx_test_tasks_test_id ON test_tasks(test_id);
CREATE INDEX idx_test_tasks_task_id ON test_tasks(task_id);