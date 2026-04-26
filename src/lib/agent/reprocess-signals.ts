import { createClient } from '@supabase/supabase-js'
import { tavily } from '@tavily/core'

// Define the TavilySearchResult interface since it's not exported
interface TavilySearchResult {
  title: string
  url: string
  content: string
  publishedDate?: string
  score?: number
  raw_content?: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initialize Tavily client
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! })

function extractSource(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Unknown'
  }
}

function calculateOctaScore(result: TavilySearchResult): { score: number; reasoning: string } {
  const breakdown: any = {}
  const insights: string[] = []
  
  // 1. Tavily Score (10% weight, max 10 points)
  if (result.score) {
    breakdown.Tavily = Math.round(result.score * 0.1)
  } else {
    breakdown.Tavily = 5 // Give base points instead of 0
  }

  // 2. Recency (15% weight, max 15 points)
  let recencyScore = 0
  if (result.publishedDate) {
    const publishedDate = new Date(result.publishedDate)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    if (publishedDate >= twoDaysAgo) {
      breakdown.Recency = 15
      insights.push('breaking news')
    } else if (publishedDate >= weekAgo) {
      breakdown.Recency = 8
      insights.push('recent development')
    } else {
      breakdown.Recency = 3
    }
    recencyScore = breakdown.Recency
  } else {
    breakdown.Recency = 5 // Give base points instead of 0
  }

  // 3. Source Authority (15% weight, max 15 points)
  const source = extractSource(result.url)
  const highAuthority = ['reuters.com', 'bloomberg.com', 'wsj.com', 'cnbc.com']
  const mediumAuthority = ['techcrunch.com', 'venturebeat.com', 'theverge.com']
  let sourceLevel = 'unknown'
  
  if (highAuthority.some(domain => source.includes(domain))) {
    breakdown.Source = 15
    sourceLevel = 'Tier 1 financial'
    insights.push(`premium ${sourceLevel} reporting`)
  } else if (mediumAuthority.some(domain => source.includes(domain))) {
    breakdown.Source = 12
    sourceLevel = 'Tier 1 tech'
    insights.push(`reputable ${sourceLevel} coverage`)
  } else {
    breakdown.Source = 8 // Increased from 6
    insights.push('industry source coverage')
  }

  // 4. Keywords (15% weight, max 15 points)
  const keywords = ['hiring', 'expansion', 'funding', 'new office', 'raised', 'investment', 'acquisition', 'merger']
  const content = (result.content + ' ' + result.title).toLowerCase()
  let keywordCount = 0
  const foundKeywords: string[] = []
  
  keywords.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      keywordCount++
      foundKeywords.push(keyword)
    }
  })
  
  breakdown.Keywords = Math.min(keywordCount * 3, 15)
  if (foundKeywords.length > 0) {
    insights.push(foundKeywords.join(', '))
  }

  // 5. Financial Mentions (10% weight, max 10 points)
  const financialTerms = ['$', 'million', 'billion', 'funding round', 'series a', 'series b', 'series c', 'valuation', 'revenue']
  let financialCount = 0
  const financialDetails: string[] = []
  
  financialTerms.forEach(term => {
    if (content.includes(term.toLowerCase())) {
      financialCount++
      if (term.includes('series a')) financialDetails.push('Series A')
      if (term.includes('series b')) financialDetails.push('Series B')
      if (term.includes('series c')) financialDetails.push('Series C')
      if (term.includes('million')) financialDetails.push('millions')
      if (term.includes('billion')) financialDetails.push('billions')
    }
  })
  
  breakdown.Financial = Math.min(financialCount * 2, 10)
  if (financialDetails.length > 0) {
    insights.push(financialDetails.join(' '))
  }

  // 6. Sentiment (10% weight, max 10 points)
  const positiveWords = ['growth', 'success', 'breakthrough', 'innovation', 'partnership', 'launch', 'announce', 'achieve']
  const negativeWords = ['decline', 'layoff', 'cut', 'loss', 'struggle', 'fail', 'crisis', 'concern']
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (content.includes(word.toLowerCase())) {
      positiveCount++
    }
  })
  
  negativeWords.forEach(word => {
    if (content.includes(word.toLowerCase())) {
      negativeCount++
    }
  })
  
  breakdown.Sentiment = Math.max(0, Math.min(10, (positiveCount - negativeCount) * 2))
  if (breakdown.Sentiment >= 6) {
    insights.push('positive momentum')
  } else if (breakdown.Sentiment <= 2) {
    insights.push('cautionary signals')
  }

  // 7. Geo-Hubs (10% weight, max 10 points)
  const geoHubs = ['san francisco', 'london', 'new york', 'austin', 'singapore', 'silicon valley', 'seattle', 'boston']
  let geoCount = 0
  const foundHubs: string[] = []
  
  geoHubs.forEach(hub => {
    if (content.includes(hub.toLowerCase())) {
      geoCount++
      foundHubs.push(hub)
    }
  })
  
  breakdown.Geo = Math.min(geoCount * 3, 10)
  if (foundHubs.length > 0) {
    insights.push(`${foundHubs[0]} tech hub`)
  }

  // 8. Data Density (15% weight, max 15 points)
  const contentLength = result.content ? result.content.length : 0
  const titleLength = result.title ? result.title.length : 0
  const totalLength = contentLength + titleLength
  
  if (totalLength > 1000) {
    breakdown.Data = 15
    insights.push('comprehensive analysis')
  } else if (totalLength > 500) {
    breakdown.Data = 10
    insights.push('detailed coverage')
  } else if (totalLength > 200) {
    breakdown.Data = 6
    insights.push('standard reporting')
  } else {
    breakdown.Data = 3
  }

  // Calculate total score (capped at 100)
  const totalScore = Object.values(breakdown).reduce((sum: number, val: any) => sum + val, 0)
  const finalScore = Math.min(totalScore, 100)

  // Generate human-readable reasoning
  let reasoning = ''
  
  if (finalScore >= 85) {
    reasoning = 'Major Alpha: '
  }
  
  const keyInsights = insights.slice(0, 3) // Take top 3 insights
  
  if (sourceLevel.includes('Tier 1')) {
    reasoning += `High conviction due to ${sourceLevel} reporting`
  } else {
    reasoning += 'Notable signal based on'
  }
  
  if (keyInsights.length > 0) {
    reasoning += ` and ${keyInsights.join(', ')}`
  }
  
  // Add financial context if available
  if (financialDetails.length > 0) {
    reasoning += ` involving ${financialDetails.join(' ')}`
  }
  
  // Add geo context if available
  if (foundHubs.length > 0) {
    reasoning += ` in ${foundHubs[0]}`
  }
  
  // Ensure we always have meaningful content
  if (reasoning.length < 20) {
    reasoning = 'Signal detected with moderate confidence based on available data'
  }

  return {
    score: finalScore,
    reasoning: reasoning
  }
}

export async function reprocessAllSignals() {
  try {
    console.log('Starting signal reprocessing...')
    
    // Fetch all existing signals
    const { data: signals, error: fetchError } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${signals.length} signals to reprocess`)

    let processed = 0
    let errors = 0

    // Process each signal
    for (const signal of signals) {
      try {
        // Create a mock TavilySearchResult from the signal data
        const mockResult: TavilySearchResult = {
          title: signal.title,
          url: signal.url,
          content: signal.description,
          publishedDate: signal.published_date,
          score: 0.8 // Default score for existing signals
        }

        // Calculate new Octa score
        const octaScore = calculateOctaScore(mockResult)

        // Update the signal with new reasoning
        const { error: updateError } = await supabase
          .from('signals')
          .update({
            confidence_score: octaScore.score,
            score_reasoning: octaScore.reasoning
          })
          .eq('id', signal.id)

        if (updateError) {
          console.error(`Error updating signal ${signal.id}:`, updateError)
          errors++
        } else {
          console.log(`Updated signal ${signal.id}: ${signal.title}`)
          processed++
        }
      } catch (error) {
        console.error(`Error processing signal ${signal.id}:`, error)
        errors++
      }
    }

    console.log(`Reprocessing complete. Updated: ${processed}, Errors: ${errors}`)
    
    return {
      success: true,
      processed,
      errors,
      total: signals.length
    }

  } catch (error) {
    console.error('Critical error in reprocessAllSignals:', error)
    return {
      success: false,
      processed: 0,
      errors: 1,
      total: 0
    }
  }
}

// Run the reprocessing function if this file is executed directly
if (require.main === module) {
  reprocessAllSignals()
    .then(result => {
      console.log('Reprocessing result:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('Reprocessing failed:', error)
      process.exit(1)
    })
}
