'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AnimateOnScroll from "@/components/AnimateOnScroll"
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<any[]>([])
  const [marketSentiment, setMarketSentiment] = useState<any>(null)
  const [showAllSignals, setShowAllSignals] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [batchSummaries, setBatchSummaries] = useState<any[]>([])
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
        
        // Check if user has preferences
        const { data: preferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
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

      // Fetch top Major Alpha signals (score > 85) for this user
      const { data: topSignals, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .gte('confidence_score', 85)
        .order('confidence_score', { ascending: false })
        .limit(3)

      if (signalsError) {
        console.error('Error fetching signals:', signalsError)
      } else {
        setSignals(topSignals || [])
      }

      // Fetch market sentiment
      const { data: sentiment, error: sentimentError } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (sentimentError) {
        console.error('Error fetching sentiment:', sentimentError)
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
      const offset = (page - 1) * 100
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('confidence_score', { ascending: false })
        .range(offset, offset + 99)

      if (error) {
        console.error('Error fetching all signals:', error)
        return []
      }
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
        console.error('Error fetching batch summaries:', error)
      } else {
        setBatchSummaries(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleViewAllIntelligence = async () => {
    setShowAllSignals(true)
    await fetchBatchSummaries()
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return <ArrowUp className="w-5 h-5 text-green-400" />
      case 'bearish':
        return <ArrowDown className="w-5 h-5 text-red-400" />
      default:
        return <Minus className="w-5 h-5 text-yellow-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'bearish':
        return 'text-red-400 bg-red-400/10 border-red-400/30'
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
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
          {/* System Status Section */}
          <AnimateOnScroll delay={0.05}>
            <div className="mb-6 sm:mb-8 px-4 sm:px-0">
              <div className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        systemStatus === 'scanning' 
                          ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse shadow-lg shadow-amber-500/50'
                      }`}></div>
                      <div className={`absolute inset-0 w-3 h-3 rounded-full ${
                        systemStatus === 'scanning' 
                          ? 'bg-green-500 animate-ping' 
                          : 'bg-amber-500 animate-ping'
                      }`}></div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        <span className="block sm:inline">System Status:</span> <span className={
                          systemStatus === 'scanning' ? 'text-green-400' : 'text-amber-300'
                        }>{systemStatus === 'scanning' ? 'Scanning...' : 'Reporting'}</span>
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {systemStatus === 'scanning' 
                          ? 'Actively analyzing market signals' 
                          : 'Generating investment intelligence'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Pause Agent Button */}
                  <Button 
                    onClick={handlePauseAgent}
                    className={`h-10 sm:h-12 px-4 sm:px-6 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                      isAgentPaused 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25'
                    }`}
                  >
                    {isAgentPaused ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 bg-white rounded-sm"></div>
                        <span className="hidden sm:inline">Resume Agent</span>
                        <span className="sm:hidden">Resume</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 bg-white rounded-sm"></div>
                        <span className="hidden sm:inline">Pause Agent</span>
                        <span className="sm:hidden">Pause</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Hero Section - Top 3 Major Alpha */}
          <div className="mb-12 sm:mb-16">
            <AnimateOnScroll delay={0.1}>
              <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                    Major Alpha Intelligence
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg">
                  Your highest conviction investment signals
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
              {signals.slice(0, 3).map((signal, index) => (
                <AnimateOnScroll key={signal.id} delay={0.2 + index * 0.1}>
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-400/20 rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-amber-400/40 transition-all duration-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-2xl sm:text-3xl font-bold text-amber-300">{signal.confidence_score}%</div>
                          <Badge className="bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-200 border-amber-400/50 text-xs">
                            Major Alpha
                          </Badge>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">{signal.title}</h3>
                      <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-3">{signal.description}</p>

                      {/* Suggested Action */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-[#1a5ee9]/10 border border-blue-400/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          <span className="text-blue-300 font-semibold text-xs sm:text-sm">Suggested Action</span>
                        </div>
                        <p className="text-white font-medium text-sm sm:text-base">{signal.suggested_action}</p>
                      </div>

                      {/* Score Reasoning */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          <span className="text-gray-400 text-xs">Source: {signal.source}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{new Date(signal.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>

          {/* Economic Pulse Section */}
          <AnimateOnScroll delay={0.5}>
            <div className="mb-12 sm:mb-16">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8 px-4 sm:px-0">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#1a5ee9]" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Economic Pulse</h2>
              </div>

              {marketSentiment ? (
                <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1a5ee9]/10 to-transparent border-[#1a5ee9]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mx-4 sm:mx-0">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">24h Market Sentiment</h3>
                        <p className="text-gray-400 text-sm sm:text-base">Real-time market analysis and sentiment indicators</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl border ${getSentimentColor(marketSentiment.sentiment)}`}>
                        {getSentimentIcon(marketSentiment.sentiment)}
                        <span className="font-semibold capitalize text-sm sm:text-base">{marketSentiment.sentiment}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-6">
                      <div className="text-center">
                        <div className="text-xl sm:text-3xl font-bold text-[#1a5ee9] mb-1 sm:mb-2">{marketSentiment.confidence || 0}%</div>
                        <div className="text-gray-400 text-xs sm:text-sm">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">{marketSentiment.positive_signals || 0}</div>
                        <div className="text-gray-400 text-xs sm:text-sm">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-3xl font-bold text-red-400 mb-1 sm:mb-2">{marketSentiment.negative_signals || 0}</div>
                        <div className="text-gray-400 text-xs sm:text-sm">Negative</div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{marketSentiment.narrative}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mx-4 sm:mx-0">
                  <CardContent className="p-0 text-center">
                    <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm sm:text-base">Market sentiment data loading...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </AnimateOnScroll>

          {/* Launch Agent Button */}
          <AnimateOnScroll delay={0.6}>
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
          </AnimateOnScroll>

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
        </div>
      </main>

      {/* Full Screen Intelligence Dialog */}
      <Dialog open={showAllSignals} onOpenChange={setShowAllSignals}>
        <DialogContent className="max-w-7xl w-[95vw] sm:w-full h-[85vh] sm:h-[90vh] bg-black/95 backdrop-blur-xl border-white/10 text-white rounded-lg sm:rounded-xl">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center space-x-2 sm:space-x-3">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#1a5ee9]" />
              <span className="truncate">All Intelligence Signals</span>
            </DialogTitle>
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
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Signal</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Score</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden sm:table-cell">Action</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold hidden md:table-cell">Source</th>
                      <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* This would be populated with actual signals data */}
                    <tr className="border-b border-white/5">
                      <td className="p-2 sm:p-4 text-white truncate max-w-[150px] sm:max-w-none">Sample Signal Title</td>
                      <td className="p-2 sm:p-4">
                        <Badge className="bg-[#1a5ee9]/20 text-[#1a5ee9] border-[#1a5ee9]/30 text-xs">
                          85%
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-4 text-gray-300 hidden sm:table-cell">Monitor</td>
                      <td className="p-2 sm:p-4 text-gray-400 hidden md:table-cell">reuters.com</td>
                      <td className="p-2 sm:p-4 text-gray-500 text-xs sm:text-sm">2024-01-01</td>
                    </tr>
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
