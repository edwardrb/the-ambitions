import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CachedSearchResult {
  search_key: string
  search_results: any
  created_at: string
  expires_at: string
}

export class SearchCache {
  // Check if cached results exist and are still valid (within 24 hours)
  async getCachedResults(searchKey: string): Promise<any | null> {
    try {
      console.log(`🔍 Checking cache for search key: ${searchKey}`)
      
      // Clean up expired entries first
      await this.cleanupExpiredCache()
      
      const { data: cached, error } = await supabase
        .from('search_cache')
        .select('search_results, created_at, expires_at')
        .eq('search_key', searchKey)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No cached results found
          console.log(`📭 No cache found for search key: ${searchKey}`)
          return null
        }
        console.error('Error checking cache:', error)
        return null
      }
      
      if (!cached) {
        console.log(`📭 No cache found for search key: ${searchKey}`)
        return null
      }
      
      // Check if cache is still valid
      const now = new Date()
      const expiresAt = new Date(cached.expires_at)
      
      if (now > expiresAt) {
        console.log(`⏰ Cache expired for search key: ${searchKey}`)
        await this.deleteCacheEntry(searchKey)
        return null
      }
      
      console.log(`✅ Cache hit for search key: ${searchKey} (created: ${cached.created_at})`)
      return cached.search_results
      
    } catch (error) {
      console.error('Error getting cached results:', error)
      return null
    }
  }
  
  // Store search results in cache with 24-hour expiration
  async setCachedResults(searchKey: string, searchResults: any): Promise<boolean> {
    try {
      console.log(`💾 Caching results for search key: ${searchKey}`)
      
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      
      const { error } = await supabase
        .from('search_cache')
        .upsert({
          search_key: searchKey,
          search_results: searchResults,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'search_key'
        })
      
      if (error) {
        console.error('Error setting cache:', error)
        return false
      }
      
      console.log(`✅ Successfully cached results for search key: ${searchKey}`)
      return true
      
    } catch (error) {
      console.error('Error setting cached results:', error)
      return false
    }
  }
  
  // Delete a specific cache entry
  async deleteCacheEntry(searchKey: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_cache')
        .delete()
        .eq('search_key', searchKey)
      
      if (error) {
        console.error('Error deleting cache entry:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error deleting cache entry:', error)
      return false
    }
  }
  
  // Clean up all expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_expired_cache')
      
      if (error) {
        console.error('Error cleaning up expired cache:', error)
      }
    } catch (error) {
      console.error('Error cleaning up expired cache:', error)
    }
  }
  
  // Record cache performance stats
  async recordCacheHit(userId: string, searchKey: string, cacheHit: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('search_performance_stats')
        .insert({
          user_id: userId,
          search_key: searchKey,
          cache_hit: cacheHit
        })
      
      if (error) {
        console.error('Error recording cache stats:', error)
      }
    } catch (error) {
      console.error('Error recording cache stats:', error)
    }
  }
  
  // Get cache performance stats
  async getCacheStats(): Promise<any> {
    try {
      const { data: stats, error } = await supabase
        .from('search_performance_stats')
        .select('cache_hit, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      
      if (error) {
        console.error('Error getting cache stats:', error)
        return null
      }
      
      if (!stats || stats.length === 0) {
        return {
          total_requests: 0,
          cache_hits: 0,
          cache_misses: 0,
          hit_rate: 0
        }
      }
      
      const totalRequests = stats.length
      const cacheHits = stats.filter(s => s.cache_hit).length
      const cacheMisses = totalRequests - cacheHits
      const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0
      
      return {
        total_requests: totalRequests,
        cache_hits: cacheHits,
        cache_misses: cacheMisses,
        hit_rate: Math.round(hitRate * 100) / 100
      }
      
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return null
    }
  }
}

// Export singleton instance
export const searchCache = new SearchCache()
