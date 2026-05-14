-- Add search caching table for 24-hour Tavily optimization
-- This table will store cached search results to avoid multiple Tavily API calls within 24 hours

CREATE TABLE IF NOT EXISTS search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_key VARCHAR(255) NOT NULL, -- Unique key for search category
  search_results JSONB NOT NULL, -- Cached Tavily results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Ensure one cache entry per search key
  UNIQUE(search_key)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_cache_search_key ON search_cache(search_key);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at ON search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_cache_created_at ON search_cache(created_at);

-- Add function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically clean up expired entries (optional, can be run manually)
-- CREATE TRIGGER auto_cleanup_cache
--     AFTER INSERT ON search_cache
--     FOR EACH ROW
--     EXECUTE FUNCTION cleanup_expired_cache();

-- Add RLS (Row Level Security)
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service operations on cache
CREATE POLICY "Service operations on search_cache" ON search_cache
    FOR ALL USING (true);

-- Add performance stats table for tracking search efficiency
CREATE TABLE IF NOT EXISTS search_performance_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_key VARCHAR(255) NOT NULL,
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance stats
CREATE INDEX IF NOT EXISTS idx_search_performance_user_id ON search_performance_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_search_performance_cache_hit ON search_performance_stats(cache_hit);
CREATE INDEX IF NOT EXISTS idx_search_performance_created_at ON search_performance_stats(created_at);

-- Add RLS for performance stats
ALTER TABLE search_performance_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for performance stats
CREATE POLICY "Service operations on search_performance_stats" ON search_performance_stats
    FOR ALL USING (true);
