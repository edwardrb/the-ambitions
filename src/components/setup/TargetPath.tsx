'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Lightbulb } from "lucide-react"

interface TargetPathProps {
  targetPath: string
  setTargetPath: (path: string) => void
}

const examplePaths = [
  'Moving into ESG Fintech',
  'Exploring DeFi opportunities',
  'Building payment solutions',
  'Digital banking transformation',
  'Regtech compliance tools'
]

export default function TargetPath({ targetPath, setTargetPath }: TargetPathProps) {
  const [showExamples, setShowExamples] = useState(false)

  return (
    <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-base">Your Target Path</div>
            <p className="text-gray-400 text-sm">Define your fintech focus area</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            placeholder="e.g., Moving into ESG Fintech"
            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
          />
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{showExamples ? 'Hide' : 'Show'} examples</span>
            </button>
          </div>

          {showExamples && (
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
              <p className="text-purple-300 text-sm mb-2">Popular paths:</p>
              <div className="flex flex-wrap gap-2">
                {examplePaths.map((path, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setTargetPath(path)}
                    className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-md text-sm transition-colors"
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
