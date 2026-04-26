import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

interface MarketSentimentResult {
  score: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  narrative: string
  positive_signals: number
  negative_signals: number
  neutral_signals: number
}

export async function generateDailyMarketSentiment(userId: string): Promise<MarketSentimentResult | null> {
  try {
    console.log(`🧠 Generating daily market sentiment for user: ${userId}`)

    // Fetch all signals from the last 24 hours for the user
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', yesterday.toISOString())
      .order('confidence_score', { ascending: false })

    if (signalsError) {
      console.error('Error fetching signals for sentiment analysis:', signalsError)
      return null
    }

    if (!signals || signals.length === 0) {
      console.log('No signals found for sentiment analysis')
      return null
    }

    console.log(`📊 Analyzing ${signals.length} signals for sentiment`)

    // Categorize signals by sentiment
    const positiveSignals = signals.filter(s => s.confidence_score >= 80)
    const negativeSignals = signals.filter(s => s.confidence_score < 60)
    const neutralSignals = signals.filter(s => s.confidence_score >= 60 && s.confidence_score < 80)

    // Prepare signal summaries for Gemini
    const signalSummaries = signals.slice(0, 20).map(signal => ({
      title: signal.title,
      score: signal.confidence_score,
      reasoning: signal.score_reasoning,
      action: signal.suggested_action,
      source: signal.source
    }))

    // Generate sentiment analysis using Gemini
    const systemPrompt = "You are a senior market analyst at a top-tier investment bank. Analyze the provided market signals and generate a comprehensive market sentiment report. Provide a score from 1-100 (1=extremely bearish, 50=neutral, 100=extremely bullish), determine the overall sentiment (bullish/bearish/neutral), and write exactly 2 sentences summarizing the market narrative. Be professional, data-driven, and concise."

    const userPrompt = `
Analyze the following market signals from the past 24 hours:

${signalSummaries.map((signal, index) => `
${index + 1}. ${signal.title}
   Score: ${signal.score}/100
   Action: ${signal.action}
   Source: ${signal.source}
   Analysis: ${signal.reasoning}
`).join('\n')}

Total Signals: ${signals.length}
High Confidence (80+): ${positiveSignals.length}
Medium Confidence (60-79): ${neutralSignals.length}
Low Confidence (<60): ${negativeSignals.length}

Provide your analysis in this JSON format:
{
  "score": number (1-100),
  "sentiment": "bullish" or "bearish" or "neutral",
  "narrative": "exactly 2 sentences summarizing market sentiment"
}
`

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
        topK: 1,
        topP: 0.8,
      }
    })

    const responseText = result.response.text()?.trim() || '{}'
    
    // Parse JSON response
    let analysisData = {
      score: 50,
      sentiment: 'neutral',
      narrative: 'Market sentiment analysis completed with available data.'
    }
    
    try {
      analysisData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError)
      console.error('Raw response:', responseText)
    }

    // Calculate final sentiment result
    const sentimentResult: MarketSentimentResult = {
      score: Math.min(100, Math.max(1, analysisData.score || 50)),
      sentiment: (analysisData.sentiment as 'bullish' | 'bearish' | 'neutral') || 'neutral',
      narrative: analysisData.narrative || 'Market sentiment analysis completed with available data.',
      positive_signals: positiveSignals.length,
      negative_signals: negativeSignals.length,
      neutral_signals: neutralSignals.length
    }

    // Save to market_sentiment table
    const { error: saveError } = await supabase
      .from('market_sentiment')
      .upsert({
        user_id: userId,
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.score,
        narrative: sentimentResult.narrative,
        positive_signals: sentimentResult.positive_signals,
        negative_signals: sentimentResult.negative_signals,
        neutral_signals: sentimentResult.neutral_signals,
        total_signals: signals.length,
        created_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('Error saving market sentiment:', saveError)
    } else {
      console.log('✅ Market sentiment saved successfully:', sentimentResult)
    }

    return sentimentResult

  } catch (error) {
    console.error('Error generating market sentiment:', error)
    return null
  }
}

// Function to run sentiment analysis for all users
export async function generateDailySentimentForAllUsers(): Promise<{ success: boolean; processed: number; errors: string[] }> {
  const errors: string[] = []
  let processed = 0

  try {
    console.log('🌅 Starting daily market sentiment generation for all users...')

    // Fetch all users with preferences
    const { data: users, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      errors.push('Failed to fetch users')
      return { success: false, processed, errors }
    }

    if (!users || users.length === 0) {
      console.log('No users found with preferences')
      return { success: true, processed, errors }
    }

    console.log(`👥 Processing ${users.length} users for daily sentiment`)

    // Process each user
    for (const user of users) {
      try {
        const result = await generateDailyMarketSentiment(user.user_id)
        if (result) {
          processed++
          console.log(`✅ Sentiment generated for user ${user.user_id}`)
        } else {
          console.log(`⚠️ No sentiment generated for user ${user.user_id}`)
        }
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        errors.push(`Failed to process user ${user.user_id}: ${error}`)
      }
    }

    console.log(`📊 Daily sentiment generation completed: ${processed}/${users.length} users processed`)

  } catch (error) {
    console.error('Critical error in daily sentiment generation:', error)
    errors.push(`Critical error: ${error}`)
  }

  return {
    success: errors.length === 0,
    processed,
    errors
  }
}
