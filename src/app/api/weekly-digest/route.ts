import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY!
const BREVO_API_URL = 'https://api.brevo.com/v3'

interface Signal {
  id: string
  title: string
  description: string
  confidence_score: number
  suggested_action: string
  source: string
  created_at: string
  outreach_draft?: string
}

interface User {
  id: any
  email: any
  user_preferences: any
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting weekly digest process...')
    
    // Get users with weekly_digest = TRUE
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, user_preferences!inner(target_path)')
      .eq('weekly_digest', true)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    if (!users || users.length === 0) {
      console.log('📭 No users with weekly_digest enabled')
      return NextResponse.json({ message: 'No users to process' }, { status: 200 })
    }
    
    console.log(`📊 Processing ${users.length} users for weekly digest...`)
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    
    let totalEmailsSent = 0
    let totalErrors = 0
    
    // Process each user
    for (const user of users) {
      try {
        console.log(`📧 Processing user: ${user.email}`)
        
        // Get top 3 highest-scoring signals from last 7 days
        const { data: signals, error: signalsError } = await supabase
          .from('signals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo)
          .order('confidence_score', { ascending: false })
          .limit(3)
        
        if (signalsError) {
          console.error(`❌ Error fetching signals for user ${user.id}:`, signalsError)
          totalErrors++
          continue
        }
        
        if (!signals || signals.length === 0) {
          console.log(`📭 No signals found for user ${user.email}`)
          continue
        }
        
        console.log(`📊 Found ${signals.length} signals for ${user.email}`)
        
        // Generate email content
        const emailHtml = generateEmailHTML(user, signals)
        const emailSubject = `Your Weekly Singapore Fintech Intelligence - ${new Date().toLocaleDateString()}`
        
        // Send email via Brevo
        const emailResponse = await sendBrevoEmail(user.email, emailSubject, emailHtml)
        
        if (emailResponse.success) {
          console.log(`✅ Email sent successfully to ${user.email}`)
          totalEmailsSent++
        } else {
          console.error(`❌ Failed to send email to ${user.email}:`, emailResponse.error)
          totalErrors++
        }
        
      } catch (userError) {
        console.error(`❌ Error processing user ${user.id}:`, userError)
        totalErrors++
      }
    }
    
    console.log(`📊 Weekly digest complete: ${totalEmailsSent} emails sent, ${totalErrors} errors`)
    
    return NextResponse.json({
      success: true,
      stats: {
        usersProcessed: users.length,
        emailsSent: totalEmailsSent,
        errors: totalErrors
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Weekly digest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateEmailHTML(user: User, signals: Signal[]): string {
  const targetPath = user.user_preferences?.target_path || 'Singapore Fintech opportunities'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Weekly Singapore Fintech Intelligence</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .signal { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .signal-title { color: #2c3e50; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .signal-score { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .signal-action { background: #e3f2fd; border: 1px solid #3b82f6; border-radius: 6px; padding: 12px; margin: 15px 0; }
        .signal-action-text { color: #1e40af; font-weight: 600; }
        .outreach-draft { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .outreach-draft-text { color: #065f46; font-style: italic; }
        .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🇸🇬 Your Weekly Singapore Fintech Intelligence</h1>
          <p>Top signals based on your target: <strong>${targetPath}</strong></p>
        </div>
        
        ${signals.map((signal, index) => `
          <div class="signal">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div class="signal-title">${signal.title}</div>
              <div class="signal-score">Score: ${signal.confidence_score}%</div>
            </div>
            
            <p style="color: #666; margin-bottom: 15px;">${signal.description.substring(0, 200)}...</p>
            
            <div class="signal-action">
              <div class="signal-action-text">💡 Suggested Action: ${signal.suggested_action}</div>
            </div>
            
            ${signal.outreach_draft ? `
              <div class="outreach-draft">
                <div style="font-weight: 600; margin-bottom: 8px;">📧 Outreach Draft:</div>
                <div class="outreach-draft-text">${signal.outreach_draft}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
        
        <div class="footer">
          <p style="margin-bottom: 15px; color: #666;">
            Keep receiving these premium Singapore fintech insights
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/upgrade?user_id=${user.id}" class="cta-button">
            🚀 Upgrade to Premium - $5/mo
          </a>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?user_id=${user.id}" style="color: #999;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendBrevoEmail(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; error?: string }> {
  try {
    const emailData = {
      sender: {
        name: 'Singapore Fintech Radar',
        email: 'noreply@ambitions.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent
    }
    
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Brevo API error:', errorText)
      return { success: false, error: errorText }
    }
    
    const result = await response.json()
    console.log('Brevo response:', result)
    
    return { success: true }
    
  } catch (error) {
    console.error('Brevo email error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
