-- Add job_title column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN job_title TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN user_preferences.job_title IS 'User preferred job title or role for personalized signal detection';
