'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/utils/supabase'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { 
  Zap, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Activity,
  Eye,
  ChevronRight,
  Info,
  CheckCircle
} from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agentActivities, setAgentActivities] = useState([
    { name: 'Signal Scanner', status: 'active', activity: 'Analyzing market trends...' },
    { name: 'Pattern Matcher', status: 'active', activity: 'Scraping LinkedIn News...' },
    { name: 'Data Analyzer', status: 'processing', activity: 'Optimizing outreach strategy...' }
  ])
  const [signals, setSignals] = useState([
    {
      id: 1,
      icon: Zap,
      title: 'Series B Funding Alert',
      timestamp: '2m ago',
      confidence: 92,
      type: 'funding',
      description: 'AI startup in fintech sector secures $50M Series B funding led by major VC firm.',
      details: 'Company has shown 300% growth in user base over past 6 months with strong revenue metrics.',
      scoreReasoning: 'Major Alpha: High conviction due to Tier 1 tech reporting and funding, Series B, millions involving breaking news',
      suggested_action: 'Direct Outreach',
      score_breakdown: { Tavily: 8, Recency: 15, Source: 12, Keywords: 12, Financial: 10, Sentiment: 8, Geo: 6, Data: 15 },
      source: 'techcrunch.com'
    },
    {
      id: 2,
      icon: Globe,
      title: 'Global Market Expansion',
      timestamp: '5m ago',
      confidence: 87,
      type: 'expansion',
      description: 'Tech giant announces entry into 3 new markets in Southeast Asia.',
      details: 'Strategic move targets emerging markets with high growth potential and digital adoption rates.',
      scoreReasoning: 'Major Alpha: High conviction due to Tier 1 financial reporting and expansion, recent development in singapore tech hub',
      suggested_action: 'Monitor Competitor Moves',
      score_breakdown: { Tavily: 7, Recency: 8, Source: 15, Keywords: 15, Financial: 8, Sentiment: 10, Geo: 10, Data: 14 },
      source: 'bloomberg.com'
    },
    {
      id: 3,
      icon: TrendingUp,
      title: 'Stock Price Surge',
      timestamp: '8m ago',
      confidence: 95,
      type: 'market',
      description: 'Biotech company stock jumps 45% after positive clinical trial results.',
      details: 'Phase 3 trials show 85% success rate, significantly exceeding market expectations.',
      scoreReasoning: 'Major Alpha: High conviction due to Tier 1 financial reporting and breaking news, positive momentum with comprehensive analysis',
      suggested_action: 'Schedule Board Review',
      score_breakdown: { Tavily: 9, Recency: 15, Source: 15, Keywords: 12, Financial: 10, Sentiment: 10, Geo: 6, Data: 18 },
      source: 'reuters.com'
    },
    {
      id: 4,
      icon: AlertTriangle,
      title: 'Regulatory Warning',
      timestamp: '12m ago',
      confidence: 78,
      type: 'regulatory',
      description: 'Social media platform faces increased regulatory scrutiny in EU.',
      details: 'European Commission launches investigation into data privacy practices and market dominance.',
      scoreReasoning: 'Notable signal based on industry source coverage and cautionary signals with detailed coverage',
      suggested_action: 'Monitor Regulatory Filings',
      score_breakdown: { Tavily: 6, Recency: 8, Source: 12, Keywords: 9, Financial: 4, Sentiment: 2, Geo: 6, Data: 15 },
      source: 'venturebeat.com'
    },
    {
      id: 5,
      icon: Target,
      title: 'Acquisition Target',
      timestamp: '15m ago',
      confidence: 83,
      type: 'acquisition',
      description: 'E-commerce platform identified as potential acquisition target.',
      details: 'Multiple strategic buyers showing interest in company\'s proprietary technology and customer base.',
      scoreReasoning: 'Notable signal based on reputable Tier 1 tech coverage and acquisition, recent development with standard reporting',
      suggested_action: 'Research Potential Buyers',
      score_breakdown: { Tavily: 7, Recency: 8, Source: 12, Keywords: 12, Financial: 8, Sentiment: 6, Geo: 6, Data: 12 },
      source: 'theverge.com'
    }
  ])
  const [selectedSignal, setSelectedSignal] = useState<any>(null)
  const [isAgentActive, setIsAgentActive] = useState(false)
  const router = useRouter()

  // Rotate agent activities every 3 seconds
  useEffect(() => {
    const activities = [
      'Analyzing market trends...',
      'Scraping LinkedIn News...',
      'Optimizing outreach strategy...',
      'Processing sentiment analysis...',
      'Scanning competitor data...',
      'Generating predictive models...',
      'Monitoring social signals...',
      'Analyzing user behavior patterns...',
      'Compiling market intelligence...',
      'Cross-referencing data sources...'
    ]

    const interval = setInterval(() => {
      setAgentActivities(prev => prev.map(agent => {
        if (agent.status === 'active' || agent.status === 'processing') {
          const newActivity = activities[Math.floor(Math.random() * activities.length)]
          return { ...agent, activity: newActivity }
        }
        return agent
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navigation */}
        <nav className="fixed top-0 left-64 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-400">
                  Your agentic dashboard is ready to help you achieve your ambitions.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area - 4-Column Bento Grid */}
        <main className="pt-24 px-8 pb-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
            
            {/* Left Column - Total Signals Scanned */}
            <AnimateOnScroll delay={0.1}>
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-xl mb-4 shadow-lg shadow-[#1a5ee9]/25 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">📡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Signals Scanned</h3>
                  <p className="text-4xl font-bold text-white mb-2">2,847</p>
                  <p className="text-gray-400 text-sm">+127 in last hour</p>
                  <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Center Column - Live Intelligence Feed */}
            <AnimateOnScroll delay={0.2}>
              <div className="xl:col-span-2 space-y-6">
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-white">Recent Signals</h2>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isAgentActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className={`text-sm ${isAgentActive ? 'text-green-400' : 'text-gray-400'}`}>
                          {isAgentActive ? 'LIVE' : 'STANDBY'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-96">
                      {isAgentActive ? (
                        signals.map((signal) => {
                          const Icon = signal.icon
                          return (
                            <div key={signal.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    signal.confidence >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                    signal.confidence >= 80 ? 'bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd]' :
                                    signal.confidence >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                    'bg-gradient-to-r from-red-500 to-pink-500'
                                  }`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-white font-medium text-sm">{signal.title}</h3>
                                    <p className="text-gray-400 text-xs mt-1">{signal.description}</p>
                                    <div className="flex items-center space-x-3 mt-2">
                                      <span className="text-gray-500 text-xs">{signal.timestamp}</span>
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`text-xs ${
                                          signal.confidence >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                          signal.confidence >= 80 ? 'bg-[#1a5ee9]/20 text-[#1a5ee9] border-[#1a5ee9]/30' :
                                          signal.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                          'bg-red-500/20 text-red-400 border-red-500/30'
                                        }`}>
                                          {signal.confidence}%
                                        </Badge>
                                        {signal.confidence > 85 && (
                                          <div className={`w-2 h-2 rounded-full border-2 ${
                                            signal.confidence >= 90 ? 'border-green-400' :
                                            signal.confidence >= 85 ? 'border-amber-400' :
                                            'border-blue-400'
                                          }`} />
                                        )}
                                        <div className="relative group">
                                          <Info className="w-3 h-3 text-gray-400 hover:text-white cursor-help transition-colors" />
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 p-4 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <h4 className="text-white text-xs font-semibold mb-2">Signal Analysis</h4>
                                            <p className="text-gray-300 text-xs leading-relaxed mb-3">
                                              {(() => {
                                                const reasoning = signal.scoreReasoning
                                                if (!reasoning || reasoning === null || reasoning === undefined) {
                                                  return 'Analyzing signal complexity...'
                                                }
                                                if (typeof reasoning === 'string') {
                                                  // Check if it's JSON (starts with { or [)
                                                  if (reasoning.startsWith('{') || reasoning.startsWith('[')) {
                                                    return 'Analyzing signal complexity...'
                                                  }
                                                  // Display Gemini analyst summary
                                                  return reasoning
                                                }
                                                return 'Analyzing signal complexity...'
                                              })()}
                                            </p>
                                            
                                            {/* 8-Vector Score Breakdown */}
                                            {signal.score_breakdown && typeof signal.score_breakdown === 'object' && (
                                              <div className="border-t border-white/10 pt-3">
                                                <h5 className="text-white text-xs font-semibold mb-2">Octa-Score Breakdown</h5>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                  {Object.entries(signal.score_breakdown).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="flex justify-between">
                                                      <span className="text-gray-400 capitalize">{key}:</span>
                                                      <span className="text-white">{value}pts</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-xs">Confidence Score:</span>
                                                <span className="text-white font-semibold text-sm">{signal.confidence}%</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {signal.confidence >= 85 && (
                                          <Badge className="text-xs bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-200 border-amber-400/50 shadow-lg shadow-amber-500/30 animate-pulse font-semibold">
                                            {(() => {
                                              const reasoning = signal.scoreReasoning
                                              if (reasoning && typeof reasoning === 'string' && reasoning.includes('Major Alpha')) {
                                                return 'Major Alpha'
                                              }
                                              return 'High Conviction'
                                            })()}
                                          </Badge>
                                        )}
                                        {signal.suggested_action && (
                                          <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30 ml-2">
                                            {(() => {
                                              const action = signal.suggested_action
                                              if (action.toLowerCase().includes('outreach')) {
                                                return 'High Priority'
                                              } else if (action.toLowerCase().includes('monitor')) {
                                                return 'Track'
                                              } else if (action.toLowerCase().includes('follow')) {
                                                return 'Schedule'
                                              }
                                              return action
                                            })()}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-gray-500 text-xs">Source:</span>
                                      <div className="flex items-center space-x-1">
                                        <span className="text-gray-400 text-xs">{signal.source}</span>
                                        {(() => {
                                          const highAuthority = ['reuters.com', 'bloomberg.com', 'wsj.com', 'cnbc.com']
                                          const mediumAuthority = ['techcrunch.com', 'venturebeat.com', 'theverge.com']
                                          if (highAuthority.some(domain => signal.source?.includes(domain))) {
                                            return <CheckCircle className="w-3 h-3 text-green-400" />
                                          } else if (mediumAuthority.some(domain => signal.source?.includes(domain))) {
                                            return <CheckCircle className="w-3 h-3 text-blue-400" />
                                          }
                                          return null
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedSignal(signal)}
                                  className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Activity className="w-12 h-12 text-gray-600 mb-4" />
                          <h3 className="text-gray-400 text-lg font-medium mb-2">Signal Scanner Standby</h3>
                          <p className="text-gray-500 text-sm max-w-md">
                            The intelligence agent is currently in standby mode. Activate the agent to begin scanning and processing signals in real-time.
                          </p>
                          <Button 
                            onClick={() => setIsAgentActive(true)}
                            className="mt-6 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white"
                          >
                            Activate Agent
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimateOnScroll>

            {/* Right Column - Current Confidence Score & Agent Status */}
            <AnimateOnScroll delay={0.3}>
              <div className="space-y-6">
                {/* Current Confidence Score */}
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-green-500/25 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Current Confidence Score</h3>
                    <p className="text-4xl font-bold text-white mb-2">94.7%</p>
                    <p className="text-gray-400 text-sm">Above average performance</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Accuracy</span>
                        <span className="text-green-400">96%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Precision</span>
                        <span className="text-blue-400">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Recall</span>
                        <span className="text-purple-400">89%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Status & Quick Actions */}
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Agent Status</h3>
                    <div className="space-y-3 mb-6">
                      {agentActivities.map((agent, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                agent.status === 'active' ? 'bg-green-500 agent-status-dot' : 
                                agent.status === 'processing' ? 'bg-yellow-500 agent-status-dot' : 
                                'bg-gray-500'
                              }`}></div>
                              <span className="text-white text-sm font-medium">{agent.name}</span>
                            </div>
                            <span className={`text-xs ${
                              agent.status === 'active' ? 'text-green-400' : 
                              agent.status === 'processing' ? 'text-yellow-400' : 
                              'text-gray-400'
                            }`}>
                              {agent.status === 'active' ? 'Active' : 
                               agent.status === 'processing' ? 'Processing' : 
                               'Standby'}
                            </span>
                          </div>
                          {(agent.status === 'active' || agent.status === 'processing') && (
                            <p className="text-gray-400 text-xs ml-4 italic">
                              {agent.activity}
                            </p>
                          )}
                          {agent.status === 'standby' && (
                            <p className="text-gray-500 text-xs ml-4 italic">
                              Standing by, ready to be activated
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm text-sm">
                        Deploy New Agent
                      </Button>
                      <Button className="w-full h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg backdrop-blur-sm text-sm">
                        Scan Priority Signals
                      </Button>
                      <Button className="w-full h-10 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white rounded-lg text-sm">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimateOnScroll>
          </div>
        </main>
      </div>
      
      {/* Signal Details Dialog */}
      <Dialog open={!!selectedSignal} onOpenChange={() => setSelectedSignal(null)}>
        <DialogContent className="backdrop-blur-xl bg-white/5 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center space-x-3">
              {selectedSignal && (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedSignal.confidence >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    selectedSignal.confidence >= 80 ? 'bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd]' :
                    selectedSignal.confidence >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}>
                    <selectedSignal.icon className="w-4 h-4 text-white" />
                  </div>
                  {selectedSignal.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSignal && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">{selectedSignal.timestamp}</span>
                <Badge className={`text-xs ${
                  selectedSignal.confidence >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  selectedSignal.confidence >= 80 ? 'bg-[#1a5ee9]/20 text-[#1a5ee9] border-[#1a5ee9]/30' :
                  selectedSignal.confidence >= 70 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {selectedSignal.confidence}% Confidence
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Summary</h4>
                  <p className="text-gray-400 text-sm">{selectedSignal.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Analysis</h4>
                  <p className="text-gray-400 text-sm">{selectedSignal.details}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Signal Type</h4>
                  <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                    {selectedSignal.type.charAt(0).toUpperCase() + selectedSignal.type.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white">
                  Take Action
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
