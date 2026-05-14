'use client'

import { Check } from "lucide-react"

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa'
]

interface RegionsSelectionProps {
  selectedRegions: string[]
  setSelectedRegions: (regions: string[] | ((prev: string[]) => string[])) => void
}

export default function RegionsSelection({
  selectedRegions,
  setSelectedRegions
}: RegionsSelectionProps) {

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev: string[]) => 
      prev.includes(region) 
        ? prev.filter((r: string) => r !== region)
        : [...prev, region]
    )
  }

  return (
    <div className="space-y-2">
      {REGIONS.map(region => (
        <button
          key={region}
          onClick={() => toggleRegion(region)}
          className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
            selectedRegions.includes(region)
              ? 'bg-[#1a5ee9]/10 border-[#1a5ee9]/30 text-white'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
          }`}
        >
          <span className="text-xs sm:text-sm">{region}</span>
          {selectedRegions.includes(region) && (
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a5ee9]" />
          )}
        </button>
      ))}
    </div>
  )
}
