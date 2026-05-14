'use client'

import { Badge } from "@/components/ui/badge"
import { Check, Plus } from "lucide-react"

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Energy',
  'Real Estate',
  'Transportation',
  'Media',
  'Agriculture',
  'Education',
  'Government',
  'Other'
]

interface IndustriesSelectionProps {
  selectedIndustries: string[]
  setSelectedIndustries: (industries: string[] | ((prev: string[]) => string[])) => void
  customIndustry: string
  setCustomIndustry: (industry: string) => void
  showCustomInput: boolean
  setShowCustomInput: (show: boolean) => void
}

export default function IndustriesSelection({
  selectedIndustries,
  setSelectedIndustries,
  customIndustry,
  setCustomIndustry,
  showCustomInput,
  setShowCustomInput
}: IndustriesSelectionProps) {

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev: string[]) => 
      prev.includes(industry) 
        ? prev.filter((i: string) => i !== industry)
        : [...prev, industry]
    )
  }

  const addCustomIndustry = () => {
    if (customIndustry.trim() && !selectedIndustries.includes(customIndustry.trim())) {
      setSelectedIndustries((prev: string[]) => [...prev, customIndustry.trim()])
      setCustomIndustry('')
      setShowCustomInput(false)
    }
  }

  return (
    <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
      {INDUSTRIES.map(industry => (
        <button
          key={industry}
          onClick={() => {
            if (industry === 'Other') {
              setShowCustomInput(!showCustomInput)
            } else {
              toggleIndustry(industry)
            }
          }}
          className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
            selectedIndustries.includes(industry) && industry !== 'Other'
              ? 'bg-[#1a5ee9]/10 border-[#1a5ee9]/30 text-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span className="text-xs sm:text-sm">{industry}</span>
          {selectedIndustries.includes(industry) && industry !== 'Other' && (
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a5ee9]" />
          )}
          {industry === 'Other' && showCustomInput && (
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a5ee9]" />
          )}
        </button>
      ))}

      {/* Custom Industry Input */}
      {showCustomInput && (
        <div className="mt-3 p-3 bg-[#1a5ee9]/10 border border-[#1a5ee9]/30 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your niche industry..."
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomIndustry()}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-500 text-sm p-2 rounded"
            />
            <button
              onClick={addCustomIndustry}
              disabled={!customIndustry.trim()}
              className="px-3 py-2 bg-[#1a5ee9] hover:bg-[#1554d6] text-white text-sm h-auto rounded disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Industries Display */}
      {selectedIndustries.filter(ind => !INDUSTRIES.includes(ind)).length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Custom Industries:</p>
          <div className="flex flex-wrap gap-1">
            {selectedIndustries.filter(ind => !INDUSTRIES.includes(ind)).map(customInd => (
              <Badge key={customInd} className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-xs">
                {customInd}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
