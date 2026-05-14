import { createClient } from '@supabase/supabase-js'
import { tavily } from '@tavily/core'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { searchCache } from './search-cache'

// --- 1. GLOBAL SCOPE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! })
const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
const geminiModel = geminiClient.getGenerativeModel({ model: "gemini-3.1-flash-lite" })

interface SignalData {
  title: string
  description: string
  url: string
  trigger_type: string
  confidence_score: number
  published_date?: string | null
  source: string
  score_reasoning: string
  suggested_contact?: string
  contact_url?: string
  outreach_draft?: string
  status?: string
  category?: string
  created_at?: string
  is_global?: boolean
}

const searchCategories = [
  {
    name: 'Singapore Fintech',
    trigger_type: 'global',
    query: 'Latest fintech hiring, funding, partnerships, and expansion in Singapore'
  }
]

export async function processSignals(userId?: string) {
  console.log('🚀 processSignals called with userId:', userId)
  const errors: string[] = []
  let totalProcessed = 0
  let userPreferences = null
  
  if (userId) {
    const cleanedUserId = userId.trim()
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', cleanedUserId)
        .maybeSingle();
      
      if (preferences && !error) {
        userPreferences = preferences
      } else {
        console.warn(`⚠️ No preferences row found for user_id: ${cleanedUserId}. Using defaults.`);
        userPreferences = { job_title: 'Senior Product Manager', industry: 'Fintech' };
      } 
    } catch (error) {
      console.error('❌ Error fetching user preferences:', error)
      errors.push('Failed to fetch user preferences')
    }
  }

  try {
    const generateDynamicQuery = (baseQuery: string, category: string): string => {
      const variations: Record<string, string[]> = {
        'Singapore Fintech': ['venture capital', 'talent acquisition', 'strategic alliances', 'market expansion'],
      }
      const timeModifiers = ['recent', 'latest', 'newly announced']
      const categoryVariations = variations[category] || variations['Singapore Fintech']
      const randomVariation = categoryVariations[Math.floor(Math.random() * categoryVariations.length)]
      const randomTimeModifier = timeModifiers[Math.floor(Math.random() * timeModifiers.length)]
      return `${baseQuery} ${randomVariation} ${randomTimeModifier}`
    }

    const dynamicSearchCategories = searchCategories.map(cat => ({
      ...cat,
      query: generateDynamicQuery(cat.query, cat.name)
    }))

    const searchPromises = dynamicSearchCategories.map(async (category) => {
      const cacheKey = `${category.name}_${category.query.replace(/\s+/g, '_').toLowerCase()}`
      let results;
      let cacheHit = false;

      try {
        const cached = await searchCache.getCachedResults(cacheKey)
        if (cached) {
          results = cached;
          cacheHit = true;
        } else {
          const res = await tavilyClient.search(category.query, { maxResults: 3 })
          results = res.results;
          await searchCache.setCachedResults(cacheKey, res)
        }
        if (userId) await searchCache.recordCacheHit(userId, cacheKey, cacheHit)
      } catch (e) { results = []; }
      return { category, results }
    })

    const searchResults = await Promise.all(searchPromises)

    for (const searchResult of searchResults) {
      const { category, results } = searchResult
      const potentialSignals: SignalData[] = []
      
      // --- THIS IS THE LOOP YOU WERE LOOKING FOR ---
      for (const result of results) {
        try {
          const careerAnalysis = await generateCareerFirstAnalysis(
            result.title, result.content, extractSource(result.url), {}, userPreferences
          )
          
          if (!careerAnalysis.is_relevant) continue

          // --- START DEEP SCOUT LOGIC ---
          let actualContactUrl = '';
          let actualContactName = careerAnalysis.suggested_contact;

          // If news is "Major Alpha" (90%+), go find the person's LinkedIn
          if (careerAnalysis.score >= 90) {
            console.log(`🎯 High Alpha detected. Deep scouting: ${actualContactName} at ${extractSource(result.url)}`);
            
            const contactInfo = await findContactDetails(
              actualContactName, 
              extractSource(result.url)
            );

            actualContactUrl = contactInfo.url;
            if (contactInfo.name) actualContactName = contactInfo.name;
          }
          // --- END DEEP SCOUT LOGIC ---

          const signalData: SignalData = {
            title: result.title || 'Untitled',
            description: careerAnalysis.why_it_matters,
            url: result.url || '',
            trigger_type: category.trigger_type,
            confidence_score: careerAnalysis.score,
            score_reasoning: careerAnalysis.why_it_matters,
            source: extractSource(result.url),
            published_date: result.publishedDate || null,
            suggested_contact: actualContactName, // Uses the deep scout name if found
            contact_url: actualContactUrl,       // Uses the deep scout LinkedIn if found
            outreach_draft: careerAnalysis.outreach_message,
            status: 'new',
            category: category.name,
            created_at: new Date().toISOString(),
            is_global: true
          }
          potentialSignals.push(signalData)
          
          // Pacing to avoid hitting rate limits on the deep scout search
          if (careerAnalysis.score >= 90) await new Promise(r => setTimeout(r, 1000));

        } catch (e) { console.error('❌ Error in signal loop:', e) }
      }
      
      const uniqueSignals = await filterUniqueSignals(potentialSignals)
      
      for (const signal of uniqueSignals) {
        const { error } = await supabase.from('signals').insert([signal])
        if (!error) totalProcessed++
      }
    }

    return { success: true, processed: totalProcessed, errors }
  } catch (error) {
    return { success: false, processed: totalProcessed, errors: [`${error}`] }
  }
}

// --- HELPER FUNCTIONS ---

async function filterUniqueSignals(signals: SignalData[]): Promise<SignalData[]> {
  const { data: existing } = await supabase.from('signals').select('title, source').limit(500)
  const existingKeys = new Set(existing?.map(s => `${s.title?.toLowerCase().trim()}-${s.source?.toLowerCase().trim()}`))
  return signals.filter(s => {
    const key = `${s.title?.toLowerCase().trim()}-${s.source?.toLowerCase().trim()}`
    return !existingKeys.has(key)
  })
}

function extractSource(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return 'Unknown' }
}

async function generateCareerFirstAnalysis(title: string, content: string, source: string, scores: any, prefs: any) {
  const prompt = `Analyze this news for a ${prefs?.job_title || 'Professional'} interested in ${prefs?.target_path || 'Fintech'}: ${title}\n${content}
  Return a JSON object: { "is_relevant": boolean, "score": number, "why_it_matters": string, "suggested_contact": string, "outreach_message": string }`
  
  const res = await geminiModel.generateContent(prompt)
  const text = res.response.text().replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(text)
  } catch {
    return { is_relevant: true, score: 85, why_it_matters: "Relevant news", suggested_contact: "Innovation Lead", outreach_message: "Hi..." }
  }
}

/**
 * STEP 2 SEARCH: Deep scouts a specific person/role 
 * to find their actual name and LinkedIn URL.
 */
async function findContactDetails(role: string, company: string): Promise<{ name: string, url: string }> {
  try {
    const searchQuery = `${role} at ${company} Singapore LinkedIn profile`;
    const searchRes = await tavilyClient.search(searchQuery, { maxResults: 1 });
    
    if (searchRes.results && searchRes.results.length > 0) {
      const bestMatch = searchRes.results[0];
      return {
        name: bestMatch.title.split('|')[0].split('-')[0].trim(), 
        url: bestMatch.url
      };
    }
  } catch (e) {
    console.error("❌ Deep scout failed:", e);
  }
  return { name: role, url: '' }; 
}