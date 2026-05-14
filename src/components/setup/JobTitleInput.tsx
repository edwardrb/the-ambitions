'use client'

interface JobTitleInputProps {
  jobTitle: string
  setJobTitle: (title: string) => void
}

export default function JobTitleInput({
  jobTitle,
  setJobTitle
}: JobTitleInputProps) {

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="e.g., Software Engineer, Product Manager, Data Scientist..."
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="w-full p-3 sm:p-4 bg-white/10 border-white/20 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 rounded-lg"
      />
      <p className="text-gray-500 text-xs mt-2">
        Optional: This helps us find more relevant career opportunities for you
      </p>
    </div>
  )
}
