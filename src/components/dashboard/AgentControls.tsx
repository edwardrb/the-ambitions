'use client'

import { Button } from "@/components/ui/button"

interface AgentControlsProps {
  systemStatus: 'scanning' | 'reporting'
  isAgentPaused: boolean
  onPauseAgent: () => void
}

export default function AgentControls({ 
  systemStatus, 
  isAgentPaused, 
  onPauseAgent 
}: AgentControlsProps) {
  return (
    <Button 
      onClick={onPauseAgent}
      className={`h-10 sm:h-12 px-4 sm:px-6 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
        isAgentPaused 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25' 
          : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25'
      }`}
    >
      {isAgentPaused ? (
        <>
          <div className="w-3 h-3 sm:w-4 sm:h-4 mr-2 bg-white rounded-sm animate-pulse"></div>
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
  )
}
