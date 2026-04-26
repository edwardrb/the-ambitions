import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function truncateAndRescout() {
  try {
    console.log('🔄 Starting signals table truncation and re-scouting...')
    
    // Step 1: Truncate the signals table
    console.log('🗑️ Truncating signals table...')
    const { error: truncateError } = await supabase
      .from('signals')
      .delete()
      .neq('id', 0) // Keep table structure but delete all rows

    if (truncateError) {
      throw new Error(`Failed to truncate signals table: ${truncateError.message}`)
    }
    
    console.log('✅ Signals table truncated successfully')
    
    // Step 2: Trigger re-scouting by calling the API
    console.log('🚀 Triggering signal re-scouting...')
    
    const response = await fetch('http://localhost:3000/api/scout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to trigger re-scouting: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('📊 Re-scouting completed:', result)
    
    return {
      success: true,
      message: 'Table truncated and re-scouting completed successfully',
      result: result
    }
    
  } catch (error) {
    console.error('❌ Error in truncate and rescout:', error)
    return {
      success: false,
      message: `Error: ${error}`,
      result: null
    }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  truncateAndRescout()
    .then(result => {
      console.log('✅ Operation completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Operation failed:', error)
      process.exit(1)
    })
}
