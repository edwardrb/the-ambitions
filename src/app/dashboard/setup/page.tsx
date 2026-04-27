'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Check, ChevronRight, Zap, Target, Globe, Plus } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa'
]

export default function SetupWizard() {
  const router = useRouter()
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [alphaThreshold, setAlphaThreshold] = useState([75])
  const [isSaving, setIsSaving] = useState(false)
  const [showLaunchScreen, setShowLaunchScreen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [customIndustry, setCustomIndustry] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    const getCurrentUser = async () => {
      console.log('🔐 Checking user authentication...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Auth session error:', error)
          return
        }
        
        if (session?.user?.id) {
          console.log('✅ User authenticated:', session.user.id)
          setUserId(session.user.id)
        } else {
          console.log('❌ No user session found')
          // Redirect to login if no session
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
      }
    }
    getCurrentUser()
  }, [])

  const toggleIndustry = (industry: string) => {
    if (industry === 'Other') {
      setShowCustomInput(!showCustomInput)
      if (!showCustomInput) {
        // Remove 'Other' from selected industries when opening input
        setSelectedIndustries(prev => prev.filter(i => i !== 'Other'))
      }
    } else {
      setSelectedIndustries(prev => 
        prev.includes(industry) 
          ? prev.filter(i => i !== industry)
          : [...prev, industry]
      )
    }
  }

  const addCustomIndustry = () => {
    if (customIndustry.trim() && !selectedIndustries.includes(customIndustry.trim())) {
      setSelectedIndustries(prev => [...prev, customIndustry.trim()])
      setCustomIndustry('')
      setShowCustomInput(false)
    }
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
  }

  
  const handleSavePreferences = async () => {
    console.log('🔍 Continue button clicked')
    console.log('📊 Validation check:', {
      selectedIndustries: selectedIndustries.length,
      selectedRegions: selectedRegions.length,
      userId: userId ? 'present' : 'missing'
    })

    if (selectedIndustries.length === 0 || selectedRegions.length === 0 || !userId) {
      console.log('❌ Validation failed - button should be disabled')
      if (selectedIndustries.length === 0) console.log('  - No industries selected')
      if (selectedRegions.length === 0) console.log('  - No regions selected')
      if (!userId) console.log('  - User not authenticated')
      return
    }

    console.log('✅ Validation passed, starting save process')
    setIsSaving(true)

    try {
      const preferencesData = {
        user_id: userId,
        target_industries: selectedIndustries,
        target_regions: selectedRegions,
        min_alpha_threshold: alphaThreshold[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 Saving preferences:', preferencesData)

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferencesData)
        .select()

      if (error) {
        console.error('❌ Error saving preferences:', error)
        alert(`Error saving preferences: ${error.message}`)
      } else {
        console.log('✅ Preferences saved successfully:', data)
        console.log('🚀 Navigating to dashboard')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  
  if (showLaunchScreen) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg shadow-[#1a5ee9]/25">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ready to Launch
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8">
              Your personalized agent is configured and ready to start analyzing signals.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 mb-6 sm:mb-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a5ee9]" />
                  <span className="text-gray-300 text-sm sm:text-base">Target Industries</span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-end sm:justify-start">
                  {selectedIndustries.map(industry => (
                    <Badge key={industry} className="bg-[#1a5ee9]/20 text-[#1a5ee9] border-[#1a5ee9]/30 text-xs">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a5ee9]" />
                  <span className="text-gray-300 text-sm sm:text-base">Target Regions</span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-end sm:justify-start">
                  {selectedRegions.map(region => (
                    <Badge key={region} className="bg-[#1a5ee9]/20 text-[#1a5ee9] border-[#1a5ee9]/30 text-xs">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <span className="text-gray-300 text-sm sm:text-base">Alpha Threshold</span>
                <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 text-xs">
                  {alphaThreshold[0]}+
                </Badge>
              </div>
            </div>
          </div>

          <Button 
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Launch Agent
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg shadow-[#1a5ee9]/25">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Setup Your Agent
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Configure your personalized signal detection preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Target Industries */}
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <CardContent className="p-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Target Industries</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Select industries you want to monitor for signals
              </p>
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {INDUSTRIES.map(industry => (
                  <button
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
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
              </div>

              {/* Custom Industry Input */}
              {showCustomInput && (
                <div className="mt-3 p-3 bg-[#1a5ee9]/10 border border-[#1a5ee9]/30 rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter your niche industry..."
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomIndustry()}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-500 text-sm"
                    />
                    <Button
                      onClick={addCustomIndustry}
                      disabled={!customIndustry.trim()}
                      className="px-3 py-2 bg-[#1a5ee9] hover:bg-[#1554d6] text-white text-sm h-auto"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
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
            </CardContent>
          </Card>

          {/* Target Regions */}
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <CardContent className="p-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Target Regions</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Select geographic regions to focus on
              </p>
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
            </CardContent>
          </Card>
        </div>

        {/* Alpha Threshold */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">Minimum Alpha Threshold</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Set the minimum confidence score for signal alerts
                </p>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#1a5ee9]">
                {alphaThreshold[0]}+
              </div>
            </div>
            <Slider
              value={alphaThreshold}
              onValueChange={setAlphaThreshold}
              max={100}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>50 (Low)</span>
              <span>75 (Medium)</span>
              <span>100 (High)</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center mt-8 sm:mt-12">
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-left">
              <div className="text-gray-400">Debug Info:</div>
              <div>User ID: {userId ? '✅ Present' : '❌ Missing'}</div>
              <div>Industries: {selectedIndustries.length} selected</div>
              <div>Regions: {selectedRegions.length} selected</div>
              <div>Button Disabled: {selectedIndustries.length === 0 || selectedRegions.length === 0 || !userId ? '✅ Yes' : '❌ No'}</div>
            </div>
          )}
          
          <Button 
            size="lg"
            onClick={handleSavePreferences}
            disabled={selectedIndustries.length === 0 || selectedRegions.length === 0 || isSaving}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
            {selectedIndustries.length === 0 
              ? 'Select at least one industry to continue'
              : selectedRegions.length === 0 
                ? 'Select at least one region to continue'
                : !userId 
                  ? 'Please wait... authenticating'
                  : 'Ready to continue'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
