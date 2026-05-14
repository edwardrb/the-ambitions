'use client'

import AnimateOnScroll from "@/components/AnimateOnScroll"
import SignalCard from "./SignalCard"

interface Signal {
  id: string
  title: string
  description: string
  confidence_score: number
  suggested_action: string
  source: string
  created_at: string
}

interface SignalDisplayProps {
  signals: Signal[]
}

export default function SignalDisplay({ signals }: SignalDisplayProps) {
  return (
    <div>
      {/* Section Header */}
      <AnimateOnScroll delay={0.15}>
        <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Alpha Signals
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg">
            Your highest conviction investment signals
          </p>
        </div>
      </AnimateOnScroll>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
        {signals.slice(0, 3).map((signal, index) => (
          <SignalCard key={signal.id} signal={signal} index={index} />
        ))}
      </div>
    </div>
  )
}
