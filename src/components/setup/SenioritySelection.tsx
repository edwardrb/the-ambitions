'use client'

const SENIORITY_OPTIONS = [
  'Entry Level 1-3 years',
  'Junior Level 4-6 years', 
  'Middle Level 7-10 years',
  'Senior Level 11+ years',
  'Middle Management 8-14 years',
  'Senior Management 15+ years'
]

interface SenioritySelectionProps {
  selectedSeniority: string
  setSelectedSeniority: (seniority: string) => void
}

export default function SenioritySelection({
  selectedSeniority,
  setSelectedSeniority
}: SenioritySelectionProps) {

  return (
    <div className="relative">
      <select
        value={selectedSeniority}
        onChange={(e) => setSelectedSeniority(e.target.value)}
        className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 appearance-none cursor-pointer"
      >
        <option value="" className="bg-gray-800 text-gray-400">Select your seniority level...</option>
        {SENIORITY_OPTIONS.map(option => (
          <option key={option} value={option} className="bg-gray-800 text-white">
            {option}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {selectedSeniority === '' && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-300 text-xs">
            ⚠️ Please select your seniority level to continue
          </p>
        </div>
      )}
    </div>
  )
}
