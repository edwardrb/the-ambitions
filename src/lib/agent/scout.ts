import { createClient } from '@supabase/supabase-js'
import { tavily } from '@tavily/core'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

// Initialize Gemini client
const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const geminiModel = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" })

interface SearchCategory {
  name: string
  trigger_type: string
  query: string
}

const searchCategories: SearchCategory[] = [
  {
    name: 'Leadership',
    trigger_type: 'leadership',
    query: 'Executive, VP or Director departures AI tech startups 2026'
  },
  {
    name: 'Funding',
    trigger_type: 'funding',
    query: 'AI startups raised Series A or B funding in the last 30 days'
  },
  {
    name: 'TechPivot',
    trigger_type: 'tech_pivot',
    query: 'Companies adopting Agentic AI or RAG infrastructure patents 2026'
  },
  {
    name: 'Expansion',
    trigger_type: 'expansion',
    query: 'Tech companies opening new international headquarters or offices'
  }
]

interface SignalData {
  title: string
  description: string
  url: string
  trigger_type: string
  confidence_score: number
  published_date: string | null
  source: string
  score_reasoning: string
  score_breakdown?: any
  suggested_action?: string
  // Additional fields that might be expected
  status?: string
  category?: string
  created_at?: string
}

export async function processSignals(userId?: string): Promise<{ success: boolean; processed: number; errors: string[]; stats?: any }> {
  const errors: string[] = []
  let totalProcessed = 0
  let userPreferences = null
  
  // Fetch user preferences if userId is provided
  if (userId) {
    try {
      const { data: prefs, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (prefs && !error) {
        userPreferences = prefs
        console.log('🎯 Using user preferences:', { 
          industries: prefs.target_industries, 
          regions: prefs.target_regions,
          alpha_threshold: prefs.min_alpha_threshold 
        })
      } else {
        console.log('⚠️ No user preferences found, using default settings')
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
    }
  }

  try {
    console.log('Starting multi-categorical search process...')

    // Create dynamic search queries based on user preferences
    const dynamicSearchCategories = searchCategories.map(category => {
      let enhancedQuery = category.query
      
      if (userPreferences) {
        // Add target industries to query
        if (userPreferences.target_industries && userPreferences.target_industries.length > 0) {
          const industryTerms = userPreferences.target_industries.join(' OR ')
          enhancedQuery = `${enhancedQuery} (${industryTerms})`
        }
        
        // Add target regions to query
        if (userPreferences.target_regions && userPreferences.target_regions.length > 0) {
          const regionTerms = userPreferences.target_regions.join(' OR ')
          enhancedQuery = `${enhancedQuery} (${regionTerms})`
        }
      }
      
      return {
        ...category,
        query: enhancedQuery
      }
    })

    // Run all 4 searches in parallel
    const searchPromises = dynamicSearchCategories.map(async (category) => {
      try {
        console.log(`Searching for category: ${category.name}`)
        console.log(`Enhanced query: ${category.query}`)
        
        const results = await tavilyClient.search(category.query, {
          searchDepth: "advanced",
          includeDomains: ["reuters.com", "bloomberg.com", "techcrunch.com", "venturebeat.com", "wsj.com", "cnbc.com"],
          maxResults: 10
        })

        return {
          category,
          results: results.results
        }
      } catch (error) {
        console.error(`Error searching ${category.name}:`, error)
        errors.push(`Failed to search ${category.name}: ${error}`)
        return {
          category,
          results: []
        }
      }
    })

    const searchResults = await Promise.all(searchPromises)

    // Process each category's results
    for (const searchResult of searchResults) {
      const { category, results } = searchResult
      
      console.log(`Processing ${results.length} results for ${category.name}`)
      
      for (const result of results) {
        try {
          const octaScore = calculateOctaScore(result)
          
          // Generate analyst summary using Gemini
          const analystSummary = await generateAnalystSummary(
            result.title || 'Untitled Signal',
            result.content || 'No description available',
            extractSource(result.url) || 'Unknown',
            octaScore.breakdown
          )
          
          // Autonomous threshold logic - warn if Direct Outreach suggested but source authority is low
          if (analystSummary.suggested_action && analystSummary.suggested_action.toLowerCase().includes('outreach') && octaScore.breakdown.Source < 80) {
            console.warn('⚠️ AUTONOMY WARNING: Direct outreach suggested but Source Authority score is only ' + octaScore.breakdown.Source + '/15')
            console.warn('⚠️ Consider verifying source credibility before taking direct action')
          }
          
          const signalData: SignalData = {
            title: result.title || 'Untitled Signal',
            description: result.content || 'No description available',
            url: result.url || '',
            trigger_type: category.trigger_type,
            confidence_score: octaScore.score,
            score_reasoning: analystSummary.reasoning,
            score_breakdown: octaScore.breakdown,
            suggested_action: analystSummary.suggested_action,
            published_date: result.publishedDate || null,
            source: extractSource(result.url) || 'Unknown',
            status: 'new',
            category: category.name,
            created_at: new Date().toISOString()
          }

          // Save to Supabase
          console.log('=== FINAL SIGNAL OBJECT BEFORE SAVE ===')
          console.log('Title:', signalData.title)
          console.log('Confidence Score:', signalData.confidence_score)
          console.log('Score Reasoning:', signalData.score_reasoning)
          console.log('Score Reasoning Type:', typeof signalData.score_reasoning)
          console.log('Source:', signalData.source)
          console.log('Full Signal Data:', JSON.stringify(signalData, null, 2))
          console.log('=== END SIGNAL OBJECT ===')
          
          const { error } = await supabase
            .from('signals')
            .insert([signalData])

          if (error) {
            console.error(`Error saving signal:`, error)
            console.error('Signal data that failed:', signalData)
            errors.push(`Failed to save signal: ${error.message}`)
          } else {
            totalProcessed++
            console.log(`✅ Successfully saved signal: ${signalData.title} with score ${signalData.confidence_score}`)
            console.log(`📝 Reasoning: ${signalData.score_reasoning}`)
          }
        } catch (error) {
          console.error(`Error processing result:`, error)
          errors.push(`Error processing result: ${error}`)
        }
      }
    }

    console.log(`Search process completed. Processed ${totalProcessed} signals.`)
    
    // Calculate performance stats
    const stats = {
      total_signals_scanned: totalProcessed,
      success_rate: errors.length === 0 ? 100 : Math.round(((totalProcessed - errors.length) / totalProcessed) * 100),
      search_categories: searchCategories.length,
      timestamp: new Date().toISOString(),
      user_id: userId || 'anonymous'
    }
    
    // Save stats to agent_stats table if userId is provided
    if (userId) {
      try {
        await supabase
          .from('agent_stats')
          .insert({
            user_id: userId,
            total_signals_scanned: stats.total_signals_scanned,
            success_rate: stats.success_rate,
            search_categories: stats.search_categories,
            created_at: stats.timestamp
          })
        
        console.log('📊 Performance stats saved:', stats)
      } catch (error) {
        console.error('Error saving agent stats:', error)
      }
    }
    
    return {
      success: true,
      processed: totalProcessed,
      errors,
      stats
    }

  } catch (error) {
    console.error('Critical error in processSignals:', error)
    errors.push(`Critical error: ${error}`)
    
    return {
      success: false,
      processed: totalProcessed,
      errors
    }
  }
}

function calculateOctaScore(result: TavilySearchResult): { score: number; reasoning: string; breakdown: any } {
  // Fail-safe initialization
  const breakdown: any = {
    Tavily: 5,      // Base score instead of 0
    Recency: 5,     // Base score instead of 0
    Source: 8,      // Base score instead of 0
    Keywords: 0,    // Will be calculated
    Financial: 0,   // Will be calculated
    Sentiment: 5,   // Base score instead of 0
    Geo: 0,         // Will be calculated
    Data: 6         // Base score instead of 0
  }
  
  const insights: string[] = []
  const financialDetails: string[] = []
  const foundHubs: string[] = []
  
  // Safely get content
  const safeContent = (result.content || '') + ' ' + (result.title || '')
  const content = safeContent.toLowerCase()
  
  // 1. Tavily Score (10% weight, max 10 points) - Fail-safe
  if (result.score && typeof result.score === 'number' && result.score > 0) {
    breakdown.Tavily = Math.min(Math.round(result.score * 0.1), 10)
  } else {
    breakdown.Tavily = 5 // Reasonable default
  }

  // 2. Recency (15% weight, max 15 points) - Fail-safe with proper date parsing
  try {
    if (result.publishedDate) {
      const publishedDate = new Date(result.publishedDate)
      // Validate the date is valid
      if (!isNaN(publishedDate.getTime())) {
        const now = new Date()
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000))
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        
        if (publishedDate >= twoDaysAgo) {
          breakdown.Recency = 15
          insights.push('breaking news')
        } else if (publishedDate >= weekAgo) {
          breakdown.Recency = 8
          insights.push('recent development')
        } else {
          breakdown.Recency = 3
        }
      } else {
        breakdown.Recency = 5 // Invalid date, use default
      }
    } else {
      breakdown.Recency = 5 // No date, use default
    }
  } catch (error) {
    breakdown.Recency = 5 // Error in date parsing, use default
  }

  // 3. Source Authority (15% weight, max 15 points) - Fail-safe
  try {
    const source = extractSource(result.url || '')
    const highAuthority = ['reuters.com', 'bloomberg.com', 'wsj.com', 'cnbc.com']
    const mediumAuthority = ['techcrunch.com', 'venturebeat.com', 'theverge.com']
    let sourceLevel = 'industry'
    
    if (highAuthority.some(domain => source.includes(domain))) {
      breakdown.Source = 15
      sourceLevel = 'Tier 1 financial'
      insights.push(`premium ${sourceLevel} reporting`)
    } else if (mediumAuthority.some(domain => source.includes(domain))) {
      breakdown.Source = 12
      sourceLevel = 'Tier 1 tech'
      insights.push(`reputable ${sourceLevel} coverage`)
    } else {
      breakdown.Source = 8
      insights.push('industry source coverage')
    }
  } catch (error) {
    breakdown.Source = 8 // Error in source extraction, use default
  }

  // 4. Keywords (15% weight, max 15 points) - Case-insensitive with REGEX
  try {
    const keywords = ['hiring', 'expansion', 'funding', 'new office', 'raised', 'investment', 'acquisition', 'merger']
    let keywordCount = 0
    const foundKeywords: string[] = []
    
    keywords.forEach(keyword => {
      // Use REGEX for case-insensitive matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'i')
      if (regex.test(content)) {
        keywordCount++
        foundKeywords.push(keyword)
      }
    })
    
    breakdown.Keywords = Math.min(keywordCount * 3, 15)
    if (foundKeywords.length > 0) {
      insights.push(foundKeywords.join(', '))
    }
  } catch (error) {
    breakdown.Keywords = 3 // Error in keyword detection, use default
  }

  // 5. Financial Mentions (10% weight, max 10 points) - Case-insensitive with REGEX
  try {
    const financialTerms = [
      { pattern: /\$\s*\d+(?:\.\d+)?\s*(?:million|billion|k)/i, label: 'amount' },
      { pattern: /\b(?:million|billion)\b/i, label: 'scale' },
      { pattern: /\bfunding\s+round\b/i, label: 'funding round' },
      { pattern: /\bseries\s+[abc]\b/i, label: 'series' },
      { pattern: /\bvaluation\b/i, label: 'valuation' },
      { pattern: /\brevenue\b/i, label: 'revenue' }
    ]
    
    let financialCount = 0
    
    financialTerms.forEach(term => {
      if (term.pattern.test(content)) {
        financialCount++
        if (term.label === 'series') {
          if (/series\s*a/i.test(content)) financialDetails.push('Series A')
          if (/series\s*b/i.test(content)) financialDetails.push('Series B')
          if (/series\s*c/i.test(content)) financialDetails.push('Series C')
        } else if (term.label === 'scale') {
          if (/million/i.test(content)) financialDetails.push('millions')
          if (/billion/i.test(content)) financialDetails.push('billions')
        }
      }
    })
    
    breakdown.Financial = Math.min(financialCount * 2, 10)
    if (financialDetails.length > 0) {
      insights.push(financialDetails.join(' '))
    }
  } catch (error) {
    breakdown.Financial = 3 // Error in financial detection, use default
  }

  // 6. Sentiment (10% weight, max 10 points) - Fail-safe
  try {
    const positiveWords = ['growth', 'success', 'breakthrough', 'innovation', 'partnership', 'launch', 'announce', 'achieve']
    const negativeWords = ['decline', 'layoff', 'cut', 'loss', 'struggle', 'fail', 'crisis', 'concern']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i')
      if (regex.test(content)) {
        positiveCount++
      }
    })
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i')
      if (regex.test(content)) {
        negativeCount++
      }
    })
    
    breakdown.Sentiment = Math.max(0, Math.min(10, (positiveCount - negativeCount) * 2))
    if (breakdown.Sentiment >= 6) {
      insights.push('positive momentum')
    } else if (breakdown.Sentiment <= 2) {
      insights.push('cautionary signals')
    }
  } catch (error) {
    breakdown.Sentiment = 5 // Error in sentiment analysis, use default
  }

  // 7. Geo-Hubs (10% weight, max 10 points) - Case-insensitive with REGEX
  try {
    const geoHubs = [
      { name: 'san francisco', regex: /\bsan\s+francisco\b/i },
      { name: 'london', regex: /\blondon\b/i },
      { name: 'new york', regex: /\bnew\s+york\b/i },
      { name: 'austin', regex: /\baustin\b/i },
      { name: 'singapore', regex: /\bsingapore\b/i },
      { name: 'silicon valley', regex: /\bsilicon\s+valley\b/i },
      { name: 'seattle', regex: /\bseattle\b/i },
      { name: 'boston', regex: /\bboston\b/i }
    ]
    
    let geoCount = 0
    
    geoHubs.forEach(hub => {
      if (hub.regex.test(content)) {
        geoCount++
        if (foundHubs.length === 0) {
          foundHubs.push(hub.name)
        }
      }
    })
    
    breakdown.Geo = Math.min(geoCount * 3, 10)
    if (foundHubs.length > 0) {
      insights.push(`${foundHubs[0]} tech hub`)
    }
  } catch (error) {
    breakdown.Geo = 3 // Error in geo detection, use default
  }

  // 8. Data Density (15% weight, max 15 points) - Fail-safe
  try {
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
  } catch (error) {
    breakdown.Data = 6 // Error in data density calculation, use default
  }

  // Calculate total score (capped at 100) - Fail-safe
  try {
    const totalScore = Object.values(breakdown).reduce((sum: number, val: any) => {
      const numVal = typeof val === 'number' ? val : 0
      return sum + numVal
    }, 0)
    var finalScore = Math.min(Math.max(totalScore, 0), 100)
  } catch (error) {
    finalScore = 50 // Error in calculation, use middle score
  }

  // Generate human-readable reasoning - MANDATORY STRING
  let reasoning = ''
  
  try {
    if (finalScore >= 85) {
      reasoning = 'Major Alpha: '
    }
    
    const keyInsights = insights.slice(0, 3)
    
    if (insights.some(insight => insight.includes('Tier 1'))) {
      reasoning += 'High conviction due to premium reporting'
    } else {
      reasoning += 'Notable signal based on'
    }
    
    if (keyInsights.length > 0) {
      reasoning += ` and ${keyInsights.join(', ')}`
    }
    
    if (financialDetails.length > 0) {
      reasoning += ` involving ${financialDetails.join(' ')}`
    }
    
    if (foundHubs.length > 0) {
      reasoning += ` in ${foundHubs[0]}`
    }
    
    // Ensure we always have meaningful content
    if (reasoning.length < 20) {
      reasoning = 'Signal detected with moderate confidence based on available data'
    }
  } catch (error) {
    reasoning = 'Signal analysis completed with available information'
  }

  // MANDATORY: Ensure reasoning is always a string
  if (typeof reasoning !== 'string' || reasoning.trim() === '') {
    reasoning = 'Signal analysis completed with available information'
  }

  return {
    score: finalScore,
    reasoning: reasoning.trim(),
    breakdown: breakdown
  }
}

async function generateAnalystSummary(
  title: string, 
  content: string, 
  source: string, 
  scores: any
): Promise<{ reasoning: string; suggested_action: string; score_breakdown: any }> {
  try {
    const systemPrompt = "You are a senior investment analyst at a top-tier sell-side firm. Review the provided market signal and its scores. Write a single, sophisticated sentence explaining the opportunity. Be aggressive, professional, and specific. Avoid filler like 'notable' or 'based on'. If the score is >85, start with 'Major Alpha:'. Also suggest a concrete action (e.g., 'Draft LinkedIn outreach', 'Monitor hiring page', 'Schedule follow-up', 'Ignore', 'Research competitors'). Return your response as a JSON object with two fields: 'reasoning' (your 1-liner) and 'suggested_action' (the concrete action)."
    
    const userPrompt = `
Title: ${title}
Content: ${content.substring(0, 500)}...
Source: ${source}
Octa-Score Breakdown:
- Tavily: ${scores.Tavily}/10 pts
- Recency: ${scores.Recency}/15 pts  
- Source Authority: ${scores.Source}/15 pts
- Keywords: ${scores.Keywords}/15 pts
- Financial Mentions: ${scores.Financial}/10 pts
- Sentiment: ${scores.Sentiment}/10 pts
- Geo-Hubs: ${scores.Geo}/10 pts
- Data Density: ${scores.Data}/15 pts
Total Score: ${Object.values(scores).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0)}/100 pts

Provide your analyst summary as JSON:
`

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
        topK: 1,
        topP: 0.8,
      }
    })

    const responseText = result.response.text()?.trim() || '{}'
    
    // Parse JSON response
    let analysisData = { reasoning: 'Signal analysis completed with available information', suggested_action: 'Monitor' }
    
    try {
      analysisData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError)
      console.error('Raw response:', responseText)
    }
    
    return {
      reasoning: analysisData.reasoning || 'Signal analysis completed with available information',
      suggested_action: analysisData.suggested_action || 'Monitor',
      score_breakdown: scores
    }
  } catch (error) {
    console.error('Error generating analyst summary:', error)
    return {
      reasoning: 'Signal analysis completed with available information',
      suggested_action: 'Monitor',
      score_breakdown: scores
    }
  }
}

function extractSource(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Unknown'
  }
}

// Helper function to get recent signals by trigger type
export async function getSignalsByTriggerType(triggerType: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('trigger_type', triggerType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error(`Error fetching signals for trigger type ${triggerType}:`, error)
    return []
  }
}

// Helper function to get all recent signals
export async function getAllRecentSignals(limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recent signals:', error)
    return []
  }
}
