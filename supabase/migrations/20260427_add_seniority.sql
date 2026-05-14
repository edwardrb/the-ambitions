-- Add seniority column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN seniority TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN user_preferences.seniority IS 'User career seniority level for personalized signal detection';
