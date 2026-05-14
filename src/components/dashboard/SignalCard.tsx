'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Zap, Info, Copy, Check } from "lucide-react"
import AnimateOnScroll from "@/components/AnimateOnScroll"

interface Signal {
  id: string
  title: string
  description: string
  confidence_score: number
  suggested_action: string
  source: string
  created_at: string
  suggested_contact?: string
  contact_url?: string
  outreach_draft?: string
}

interface SignalCardProps {
  signal: Signal
  index: number
}

export default function SignalCard({ signal, index }: SignalCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
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

          {/* Target Contact Badge */}
          {signal.suggested_contact && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  <span className="text-purple-300 font-semibold text-xs sm:text-sm">Target Contact</span>
                </div>
                {signal.contact_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(signal.contact_url, '_blank')}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 h-6 px-2 text-xs"
                  >
                    Contact Person
                  </Button>
                )}
              </div>
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-2">
                <p className="text-purple-200 font-medium text-sm sm:text-base">{signal.suggested_contact}</p>
              </div>
            </div>
          )}

          {/* Suggested Action */}
          <div className="bg-gradient-to-r from-blue-500/10 to-[#1a5ee9]/10 border border-blue-400/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-blue-300 font-semibold text-xs sm:text-sm">Suggested Action</span>
            </div>
            <p className="text-white font-medium text-sm sm:text-base">{signal.suggested_action}</p>
          </div>

          {/* Outreach Draft */}
          {signal.outreach_draft && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-green-300 font-semibold text-xs sm:text-sm">Outreach Draft</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(signal.outreach_draft!)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/20 h-6 px-2"
                >
                  {copied ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
              <textarea
                value={signal.outreach_draft}
                readOnly
                className="w-full bg-black/30 border border-green-400/30 rounded-lg p-3 text-green-200 text-sm sm:text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50"
                rows={3}
              />
            </div>
          )}

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
  )
}
