'use client'

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import AnimateOnScroll from "@/components/AnimateOnScroll"

interface MarketSentiment {
  sentiment: string
  score: number
  trend: string
  summary: string
}

interface MarketSentimentProps {
  marketSentiment: MarketSentiment | null
  loading: boolean
}

export default function MarketSentiment({ marketSentiment, loading }: MarketSentimentProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'bearish':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'neutral':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  if (loading) {
    return (
      <AnimateOnScroll delay={0.3}>
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mx-4 sm:mx-0">
          <CardContent className="p-0 text-center">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">Market sentiment data loading...</p>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    )
  }

  if (!marketSentiment) {
    return (
      <AnimateOnScroll delay={0.3}>
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mx-4 sm:mx-0">
          <CardContent className="p-0 text-center">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">Market sentiment data not available</p>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    )
  }

  return (
    <AnimateOnScroll delay={0.3}>
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mx-4 sm:mx-0">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">24h Market Sentiment</h3>
              <p className="text-gray-400 text-sm sm:text-base">Real-time market analysis and sentiment indicators</p>
            </div>
            <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl border ${getSentimentColor(marketSentiment.sentiment)}`}>
              <div className={`w-2 h-2 rounded-full ${
                marketSentiment.sentiment?.toLowerCase() === 'bullish' ? 'bg-green-400' :
                marketSentiment.sentiment?.toLowerCase() === 'bearish' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span className="font-semibold capitalize">{marketSentiment.sentiment}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{marketSentiment.score}</div>
              <p className="text-gray-400 text-xs sm:text-sm">Sentiment Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 capitalize">{marketSentiment.trend}</div>
              <p className="text-gray-400 text-xs sm:text-sm">Current Trend</p>
            </div>
            <div className="text-center sm:col-span-1">
              <div className="text-sm sm:text-base text-gray-300 mb-1">{marketSentiment.summary}</div>
              <p className="text-gray-400 text-xs sm:text-sm">Market Summary</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  )
}
