-- Add target_cities column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN target_cities TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN user_preferences.target_cities IS 'Array of target cities selected by user based on their target_locations';
