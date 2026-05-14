'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import SignalDisplay from "@/components/dashboard/SignalDisplay"
import MarketSentiment from "@/components/dashboard/MarketSentiment"
import SystemStatus from "@/components/dashboard/SystemStatus"
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Eye,
  ChevronRight,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Database,
  Calendar
} from "lucide-react"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<any[]>([])
  const [marketSentiment, setMarketSentiment] = useState<any>(null)
  const [showAllSignals, setShowAllSignals] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [batchSummaries, setBatchSummaries] = useState<any[]>([])
  const [allSignalsData, setAllSignalsData] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<'scanning' | 'reporting'>('scanning')
  const [isAgentPaused, setIsAgentPaused] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        console.log('🔐 Dashboard: Checking user preferences for', session.user.id)
        
        // Check if user has preferences (handle multiple records)
        const { data: preferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (prefError || !preferences) {
          console.log('📝 Dashboard: No preferences found, redirecting to setup')
          router.push('/dashboard/setup')
          return
        }
        
        console.log('✅ Dashboard: User has preferences, loading dashboard')
        setUserId(session.user.id)
        fetchDashboardData(session.user.id)
      } else {
        console.log('❌ Dashboard: No user session, redirecting to login')
        router.push('/login')
      }
    }
    getCurrentUser()
    
    // Set up 15-minute status cycle
    const statusInterval = setInterval(() => {
      setSystemStatus(prev => prev === 'scanning' ? 'reporting' : 'scanning')
    }, 15 * 60 * 1000) // 15 minutes

    return () => clearInterval(statusInterval)
  }, [])

  // Handle agent pause/resume
  const handlePauseAgent = async () => {
    try {
      const newStatus = !isAgentPaused
      setIsAgentPaused(newStatus)
      
      // Call API to pause/resume agent
      const response = await fetch('/api/agent-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: newStatus ? 'pause' : 'resume',
          user_id: userId || 'anonymous'
        })
      })
      
      if (response.ok) {
        console.log(newStatus ? '⏸️ Agent paused' : '▶️ Agent resumed')
      } else {
        console.error('Failed to control agent')
        setIsAgentPaused(!newStatus) // Revert on error
      }
    } catch (error) {
      console.error('Error controlling agent:', error)
    }
  }

  const fetchDashboardData = async (currentUserId: string) => {
    try {
      // First, trigger signal processing for this user with their preferences
      console.log('🚀 Triggering signal processing for user:', currentUserId)
      const scoutResponse = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      })

      if (scoutResponse.ok) {
        const scoutResult = await scoutResponse.json()
        console.log('✅ Signal processing completed:', scoutResult)
      } else {
        console.error('❌ Signal processing failed:', await scoutResponse.text())
      }

      // Fetch insights from the new insights API
      console.log('🔍 Fetching insights from /api/insights...')
      const insightsResponse = await fetch('/api/insights')
      
      if (!insightsResponse.ok) {
        console.error('❌ Failed to fetch insights:', await insightsResponse.text())
        setSignals([])
        return
      }
      
      const insightsData = await insightsResponse.json()
      console.log('✅ Insights fetched:', insightsData)
      
      // Transform insights data to match expected signal format
      const transformedSignals = insightsData.insights.map((insight: any) => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        url: insight.url,
        suggested_contact: insight.suggested_contact,
        outreach_draft: insight.outreach_draft,
        confidence_score: insight.confidence_score,
        score_reasoning: insight.why_it_matters,
        created_at: insight.created_at,
        trigger_type: 'global',
        source: 'Singapore Fintech Radar'
      }))
      
      console.log('📊 Transformed signals:', transformedSignals.length)
      setSignals(transformedSignals)
    } catch (error) {
      console.error('❌ Error in fetchDashboardData:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketSentiment = async () => {
    try {
      const { data: sentiment, error: sentimentError } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle instead of single to handle no data

      if (sentimentError) {
        console.log('No market sentiment data found (expected for new users)')
        setMarketSentiment(null)
      } else {
        setMarketSentiment(sentiment)
      }

      // Get total signal count for pagination
      const { count } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })

      const totalSignals = count || 0
      const pages = Math.min(Math.ceil(totalSignals / 100), 100)
      setTotalPages(pages)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSignals = async (page: number = 1) => {
    try {
      // Remove pagination limit to fetch all signals
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('confidence_score', { ascending: false })

      if (error) {
        console.error('Error fetching all signals:', error)
        return []
      }
      console.log(`🔍 Debug: Fetched ${data?.length || 0} signals from database`)
      return data || []
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }

  const fetchBatchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('signal_batch_summaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('No batch summaries found (table may not exist yet)')
        setBatchSummaries([])
      } else {
        setBatchSummaries(data || [])
      }
    } catch (error) {
      console.log('Batch summaries table not available yet')
      setBatchSummaries([])
    }
  }

  const handleViewAllIntelligence = async () => {
    try {
      console.log('🔍 Starting View All Intelligence process...')
      
      // Fetch all signals (duplicates are now prevented at the source)
      console.log('📡 Fetching all signals for View All Intelligence...')
      const allSignals = await fetchAllSignals()
      
      console.log(`📊 Total signals fetched: ${allSignals.length}`)
      
      // Set the signals data and show the dialog
      setAllSignalsData(allSignals)
      setShowAllSignals(true)
      
    } catch (error) {
      console.error('❌ Error in View All Intelligence:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-[#1a5ee9]/25 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-white font-['Afacad_Flux']">
              The Ambitions
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Exit Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Singapore Fintech Career Signal Radar Header */}
          <div className="mb-12 sm:mb-16">
            <div className="backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-purple-700/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Live: Singapore Fintech Career Signal Radar
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base mt-1">
                      Career opportunities from Singapore fintech ecosystem
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Section */}
          <SystemStatus
            systemStatus={systemStatus}
            isAgentPaused={isAgentPaused}
            onPauseAgent={handlePauseAgent}
          />

          {/* Hero Section - Top 3 Major Alpha */}
          <div className="mb-12 sm:mb-16">
            <SignalDisplay signals={signals} />
          </div>

          {/* Singapore Fintech Radar Banner - COMMENTED OUT */}
          {/* <div className="mb-12 sm:mb-16">
            <div className="backdrop-blur-xl bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Live: Singapore Fintech Signal Radar
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base mt-1">
                      Real-time intelligence from Singapore fintech ecosystem
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">ACTIVE</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Launch Agent Button - DISABLED for Singapore Fintech MVP */}
          {/* <AnimateOnScroll delay={0.6}>
            <div className="text-center px-4 sm:px-0 mb-6 sm:mb-8">
              <Button 
                size="lg"
                onClick={() => userId && fetchDashboardData(userId)}
                disabled={!userId || loading}
                className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-black font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                {loading ? 'Processing...' : 'Launch Agent'}
              </Button>
              <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                Generate personalized signals based on your preferences
              </p>
            </div>
          </AnimateOnScroll> */}

          {/* View All Intelligence Button */}
          <AnimateOnScroll delay={0.7}>
            <div className="text-center px-4 sm:px-0">
              <Button 
                size="lg"
                onClick={handleViewAllIntelligence}
                className="h-12 sm:h-14 sm:h-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">View All Intelligence</span>
                <span className="sm:hidden">All Signals</span>
              </Button>
              <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                Access complete signal database with detailed breakdowns
              </p>
            </div>
          </AnimateOnScroll>

          {/* Update Preferences Button */}
          <AnimateOnScroll delay={0.8}>
            <div className="text-center px-4 sm:px-0">
              <Button 
                size="lg"
                onClick={() => {
                console.log('🔍 Dashboard Update Preferences button clicked')
                console.log('📊 Navigating to: /dashboard/setup?update=true')
                router.push('/dashboard/setup?update=true')
              }}
                className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Update Preferences</span>
                <span className="sm:hidden">Settings</span>
              </Button>
              <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3">
                Modify your target industries, locations, and thresholds
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </main>

      {/* Full Screen Intelligence Dialog */}
      <Dialog open={showAllSignals} onOpenChange={setShowAllSignals}>
        <DialogContent 
          className="max-w-7xl w-[95vw] sm:w-full h-[85vh] sm:h-[90vh] bg-black/95 backdrop-blur-xl border-white/10 text-white rounded-lg sm:rounded-xl"
          aria-describedby="intelligence-dialog-description"
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#1a5ee9]" />
              <span className="truncate">All Intelligence Signals</span>
            </DialogTitle>
            <p id="intelligence-dialog-description" className="text-sm text-gray-300 mt-2">
              Browse and filter all market intelligence signals with detailed scoring breakdowns and confidence levels
            </p>
          </DialogHeader>

          <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
                >
                  Previous
                </Button>
                <span className="text-gray-300 text-xs sm:text-sm mx-3 sm:mx-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
                >
                  Next
                </Button>
              </div>
              <Button
                onClick={() => setShowAllSignals(false)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
              >
                Close
              </Button>
            </div>

            {/* Signals Table */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10">
                    <tr>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Created_at</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Title</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden lg:table-cell">Description</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden sm:table-cell">Source</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden md:table-cell">URL</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Score</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden lg:table-cell">Reasoning</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden sm:table-cell">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSignalsData.map((signal, index) => (
                      <tr key={signal.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-2 sm:p-4 text-gray-300 text-xs sm:text-sm">
                          {signal.created_at ? new Date(signal.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4 text-white truncate max-w-[200px] sm:max-w-none" title={signal.title}>
                          {signal.title || 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-300 hidden lg:table-cell truncate max-w-[300px]" title={signal.description}>
                          {signal.description ? signal.description.substring(0, 100) + (signal.description.length > 100 ? '...' : '') : 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                            {signal.category || signal.trigger_type || 'N/A'}
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-4 text-gray-400 hidden sm:table-cell truncate max-w-[120px]" title={signal.source}>
                          {signal.source || 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4 hidden md:table-cell">
                          {signal.url ? (
                            <a 
                              href={signal.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline text-xs truncate max-w-[150px] block"
                              title={signal.url}
                            >
                              {signal.url.length > 30 ? signal.url.substring(0, 30) + '...' : signal.url}
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="p-2 sm:p-4">
                          <Badge className={`${
                            signal.confidence_score >= 70 ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                            signal.confidence_score >= 50 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                            'bg-red-500/20 text-red-300 border-red-400/30'
                          } text-xs`}>
                            {signal.confidence_score || 0}%
                          </Badge>
                        </td>
                        <td className="p-2 sm:p-4 text-gray-300 hidden lg:table-cell truncate max-w-[200px]" title={signal.score_reasoning}>
                          {signal.score_reasoning ? signal.score_reasoning.substring(0, 80) + (signal.score_reasoning.length > 80 ? '...' : '') : 'N/A'}
                        </td>
                        <td className="p-2 sm:p-4 text-gray-300 hidden sm:table-cell">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                            {signal.suggested_action || 'Monitor'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {allSignalsData.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-400">
                          <Database className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                          <p className="text-lg font-semibold mb-2">No signals found</p>
                          <p className="text-sm">Launch the agent to start generating intelligence signals</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Batch Summaries Section (only on page 100) */}
            {currentPage === 100 && batchSummaries.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center space-x-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span>Historical Batch Summaries</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-32 sm:max-h-48 overflow-auto">
                  {batchSummaries.map((summary) => (
                    <Card key={summary.id} className="bg-amber-500/10 border-amber-400/30 p-3 sm:p-4">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-300 font-semibold text-xs sm:text-sm">
                            {new Date(summary.created_at).toLocaleDateString()}
                          </span>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-xs">
                            {summary.signal_count} signals
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{summary.summary}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
