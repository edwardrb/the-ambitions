'use client'

import AnimateOnScroll from "@/components/AnimateOnScroll"
import AgentControls from "./AgentControls"

interface SystemStatusProps {
  systemStatus: 'scanning' | 'reporting'
  isAgentPaused: boolean
  onPauseAgent: () => void
}

export default function SystemStatus({ 
  systemStatus, 
  isAgentPaused, 
  onPauseAgent 
}: SystemStatusProps) {
  return (
    <AnimateOnScroll delay={0.05}>
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${
                  isAgentPaused
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse shadow-lg shadow-amber-500/50' 
                    : 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50'
                }`}></div>
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${
                  isAgentPaused
                    ? 'bg-amber-500 animate-ping' 
                    : 'bg-green-500 animate-ping'
                }`}></div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  <span className="block sm:inline">System Status:</span> <span className={
                    isAgentPaused ? 'text-amber-300' : 'text-green-400'
                  }>{isAgentPaused ? 'Paused' : 'Scanning...'}</span>
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {isAgentPaused 
                    ? 'Agent paused - no new signals being generated' 
                    : 'Actively analyzing market signals'
                  }
                </p>
              </div>
            </div>
            
            <AgentControls
              systemStatus={systemStatus}
              isAgentPaused={isAgentPaused}
              onPauseAgent={onPauseAgent}
            />
          </div>
        </div>
      </div>
    </AnimateOnScroll>
  )
}
