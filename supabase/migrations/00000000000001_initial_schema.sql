-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Scenes RLS
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own scenes" ON scenes
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Generation Jobs RLS
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own jobs" ON generation_jobs
  FOR ALL USING (
    scene_id IN (
      SELECT s.id FROM scenes s
      JOIN projects p ON s.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- User Credits RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own credits" ON user_credits
  FOR ALL USING (auth.uid() = user_id);