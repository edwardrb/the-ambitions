-- Fix confidence_score column type to support decimal values
-- The Octa Score algorithm now generates decimal scores like 75.75

-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS signals_backup AS TABLE signals;

-- Alter the confidence_score column to NUMERIC type
ALTER TABLE signals 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2) USING confidence_score::NUMERIC(5,2);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add is_global column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='signals' AND column_name='is_global'
    ) THEN
        ALTER TABLE signals ADD COLUMN is_global BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add outreach_draft column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='signals' AND column_name='outreach_draft'
    ) THEN
        ALTER TABLE signals ADD COLUMN outreach_draft TEXT DEFAULT '';
    END IF;

    -- Add target_path column to user_preferences if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_preferences' AND column_name='target_path'
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN target_path TEXT DEFAULT '';
    END IF;

    -- Add weekly_digest column to users if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='weekly_digest'
    ) THEN
        ALTER TABLE users ADD COLUMN weekly_digest BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add interested_in_paid column to users if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='interested_in_paid'
    ) THEN
        ALTER TABLE users ADD COLUMN interested_in_paid BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_signals_confidence_score ON signals(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_is_global ON signals(is_global);

-- Add RLS policies for signals table if they don't exist
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Create policy to allow users to read their own signals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'signals' AND policyname = 'Users can view own signals'
    ) THEN
        CREATE POLICY "Users can view own signals" ON signals
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    -- Create policy to allow users to insert their own signals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'signals' AND policyname = 'Users can insert own signals'
    ) THEN
        CREATE POLICY "Users can insert own signals" ON signals
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    -- Create policy to allow users to update their own signals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'signals' AND policyname = 'Users can update own signals'
    ) THEN
        CREATE POLICY "Users can update own signals" ON signals
            FOR UPDATE USING (user_id = auth.uid());
    END IF;

    -- Create policy to allow users to read global signals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'signals' AND policyname = 'Users can view global signals'
    ) THEN
        CREATE POLICY "Users can view global signals" ON signals
            FOR SELECT USING (is_global = TRUE);
    END IF;
END $$;

-- Add RLS policies for users table if they don't exist
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Create policy to allow users to read their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (id = auth.uid());
    END IF;

    -- Create policy to allow users to update their own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (id = auth.uid());
    END IF;
END $$;
