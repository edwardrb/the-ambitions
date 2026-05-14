'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Check, ChevronRight, Zap, Target, Globe, Plus } from "lucide-react"
import { supabase } from '@/utils/supabase'
import IndustriesSelection from "@/components/setup/IndustriesSelection"
import RegionsSelection from "@/components/setup/RegionsSelection"
import CitiesSelection from "@/components/setup/CitiesSelection"
import SenioritySelection from "@/components/setup/SenioritySelection"
import JobTitleInput from "@/components/setup/JobTitleInput"
// import AlphaThreshold from "@/components/setup/AlphaThreshold" // COMMENTED OUT FOR MVP v1.0
import TargetPath from "@/components/setup/TargetPath"

export default function SetupWizard() {
  console.log('🚀 SetupWizard component mounting...')
  
  const router = useRouter()
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedSeniority, setSelectedSeniority] = useState<string>('')
  const [jobTitle, setJobTitle] = useState<string>('')
  const [alphaThreshold, setAlphaThreshold] = useState([75])
  const [targetPath, setTargetPath] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [showLaunchScreen, setShowLaunchScreen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [customIndustry, setCustomIndustry] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  
  
  // Test component rendering
  useEffect(() => {
    console.log('✅ SetupWizard component mounted successfully!')
    console.log('🎯 Component state check:', {
      selectedIndustries: selectedIndustries.length,
      selectedRegions: selectedRegions.length,
      userId: userId ? 'present' : 'missing'
    })
  }, [])

  // Track isSaving state changes
  useEffect(() => {
    console.log('🔄 isSaving state changed to:', isSaving)
  }, [isSaving])

  useEffect(() => {
    const getCurrentUser = async () => {
      console.log('🔐 Starting authentication check...')
      
      // First, let's check if we have any session at all
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('📊 Session data:', session)
      console.log('📊 Session error:', error)
      
      if (error) {
        console.error('❌ Auth session error:', error)
        alert(`Authentication error: ${error.message}`)
        return
      }
      
      if (!session) {
        console.log('❌ No session found - user not logged in')
        alert('No session found. Please log in first.')
        router.push('/login')
        return
      }
      
      if (!session.user) {
        console.log('❌ Session exists but no user data')
        alert('Session exists but no user data. Please log in again.')
        router.push('/login')
        return
      }
      
      if (!session.user.id) {
        console.log('❌ User exists but no ID')
        alert('User exists but no ID. Please log in again.')
        router.push('/login')
        return
      }
      
      console.log('✅ User authenticated successfully:', session.user.id)
      console.log('✅ User email:', session.user.email)
      setUserId(session.user.id)
      
      // Check if user already has preferences
      try {
        // Get the most recent preference record
        const { data: preferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        console.log('📊 Preferences data:', preferences)
        console.log('📊 Preferences error:', prefError)
        
        // Check if this is an update request
        console.log('🔍 Checking URL parameters...')
        console.log('📊 Current URL:', window.location.href)
        console.log('📊 Search params:', window.location.search)
        const urlParams = new URLSearchParams(window.location.search)
        const isUpdateMode = urlParams.get('update') === 'true'
        console.log('📊 isUpdateMode:', isUpdateMode)
        console.log('📊 Raw update param:', urlParams.get('update'))
        
        if (!prefError && preferences) {
          console.log('📝 User has existing preferences - allowing access to setup page')
          setIsUpdating(true)
          // Store the preference ID for updating
          setPreferenceId(preferences.id)
          // Populate form with existing preferences
          setSelectedIndustries(preferences.target_industries || [])
          setSelectedRegions(preferences.target_locations || [])
          setSelectedCities(preferences.target_cities || [])
          setSelectedSeniority(preferences.seniority || '')
          setJobTitle(preferences.job_title || '')
          setAlphaThreshold([preferences.min_alpha_threshold || 75])
          setTargetPath(preferences.target_path || '')
        } else {
          console.log('📝 User needs to set up preferences')
          if (prefError) {
            console.log('ℹ️ Preferences error (expected for new users):', prefError.message)
          }
        }
      } catch (prefCatchError) {
        console.error('❌ Error checking preferences:', prefCatchError)
      }
    }
    
    getCurrentUser()
  }, []) // Empty dependency array - only run once on mount

  const toggleIndustry = (industry: string) => {
    console.log('🏭 Toggle industry clicked:', industry)
    console.log('📊 Before toggle - Industries:', selectedIndustries.length)
    
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
    
    console.log('📊 After toggle - Industries:', selectedIndustries.length)
  }

  const addCustomIndustry = () => {
    console.log('➕ Add custom industry clicked')
    if (customIndustry.trim() && !selectedIndustries.includes(customIndustry.trim())) {
      setSelectedIndustries(prev => [...prev, customIndustry.trim()])
      setCustomIndustry('')
      setShowCustomInput(false)
    }
  }

  const toggleRegion = (region: string) => {
    console.log('🌍 Toggle region clicked:', region)
    console.log('📊 Before toggle - Regions:', selectedRegions.length)
    
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
    
    console.log('📊 After toggle - Regions:', selectedRegions.length)
  }

  
  const handleSavePreferences = async () => {
    console.log('🔍 Save/Update button clicked - FUNCTION START')
    console.log('📊 Mode:', isUpdating ? 'UPDATE' : 'NEW')
    console.log('📊 Current isSaving state:', isSaving)
    console.log('📊 Function execution continuing...')
    
    // Prevent multiple simultaneous saves
    if (isSaving) {
      console.log('⚠️ Save already in progress, ignoring click')
      return
    }
    
    console.log('📊 Passed isSaving check, continuing...')
    
    console.log('📊 Validation check:', {
      selectedIndustries: selectedIndustries.length,
      selectedRegions: selectedRegions.length,
      selectedCities: selectedCities.length,
      selectedSeniority: selectedSeniority,
      userId: userId ? 'present' : 'missing',
      isSaving: isSaving,
      buttonDisabled: selectedSeniority === '' || !userId
    })

    if (selectedSeniority === '' || !userId) {
      console.log('❌ Validation failed')
      if (selectedSeniority === '') console.log('  - No seniority selected')
      if (!userId) console.log('  - User not authenticated')
      return
    }

    console.log('✅ Validation passed, setting isSaving to true')
    setIsSaving(true)
    console.log('📊 isSaving set to true, starting save operation')
    console.log('📊 About to enter try-catch block')

    try {
      const preferencesData = {
        user_id: userId,
        target_industries: ['Fintech'], // Singapore Fintech MVP default
        target_locations: ['Asia Pacific'], // Singapore Fintech MVP default
        target_cities: ['Singapore'], // Singapore Fintech MVP default
        seniority: selectedSeniority,
        job_title: jobTitle,
        min_alpha_threshold: alphaThreshold[0],
        target_path: targetPath
      }

      console.log('💾', isUpdating ? 'Updating' : 'Saving', 'preferences:', preferencesData)
      console.log('📊 Preference ID:', preferenceId)

      let data, error
      // Use upsert with record ID to avoid updated_at issues and ensure proper updates
      const upsertData = isUpdating && preferenceId 
        ? { ...preferencesData, id: preferenceId }
        : preferencesData
      
      console.log('🔄 Using upsert with record ID to save preferences')
      console.log('📊 Data being sent to upsert:', JSON.stringify(upsertData, null, 2))
      console.log('📊 Preference ID:', preferenceId)
      
      const result = await supabase
        .from('user_preferences')
        .upsert(upsertData)
        .select()
      data = result.data
      error = result.error

      if (error) {
        console.error('❌ Error saving preferences:', error)
        console.error('❌ Error details:', error.message, error.details || null, error.hint || null)
        alert(`Error saving preferences: ${error.message}`)
      } else {
        console.log('✅ Preferences', isUpdating ? 'updated' : 'saved', 'successfully:', data)
        console.log('🚀 Attempting to navigate to dashboard')
        console.log('📊 Router object:', router)
        console.log('📊 Router.push method:', typeof router.push)
        
        try {
          const result = router.push('/dashboard')
          console.log('📊 Router.push result:', result)
          
          // Fallback: try window.location
          setTimeout(() => {
            console.log('🔄 Fallback: trying window.location')
            window.location.href = '/dashboard'
          }, 1000)
        } catch (error) {
          console.error('❌ Router navigation failed:', error)
          console.log('🔄 Fallback: using window.location')
          window.location.href = '/dashboard'
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Unexpected error occurred. Please try again.')
    } finally {
      console.log('📊 Save operation completed, setting isSaving to false')
      setIsSaving(false)
      console.log('📊 isSaving set to false')
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
              {isUpdating ? 'Update Your Preferences' : 'Setup Your Agent'}
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            {isUpdating ? 'Modify your personalized signal detection preferences' : 'Configure your personalized signal detection preferences'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Target Industries - DISABLED for Singapore Fintech MVP */}
          {/* <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <CardContent className="p-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Target Industries</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Select industries you want to monitor for signals
              </p>
              <IndustriesSelection
                selectedIndustries={selectedIndustries}
                setSelectedIndustries={setSelectedIndustries}
                customIndustry={customIndustry}
                setCustomIndustry={setCustomIndustry}
                showCustomInput={showCustomInput}
                setShowCustomInput={setShowCustomInput}
              />
            </CardContent>
          </Card> */}

          {/* Target Regions - DISABLED for Singapore Fintech MVP */}
          {/* <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <CardContent className="p-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Target Regions</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Select regions you want to monitor for signals
              </p>
              <RegionsSelection
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions}
              />
            </CardContent>
          </Card> */}

          {/* Target Cities - DISABLED for Singapore Fintech MVP */}
          {/* <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <CardContent className="p-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Target Cities</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Select specific cities within your regions
              </p>
              <CitiesSelection
                selectedCities={selectedCities}
                setSelectedCities={setSelectedCities}
              />
            </CardContent>
          </Card> */}

          {/* Singapore Fintech MVP Notice */}
          <Card className="backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:col-span-2">
            <CardContent className="p-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">🇸🇬 Singapore Fintech Focus</h3>
                  <p className="text-red-300 text-sm">MVP v1.0 - Singapore Fintech Ecosystem Only</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                For our MVP v1.0, we're exclusively focused on the Singapore fintech ecosystem. 
                Industry, region, and city preferences are automatically set to maximize coverage 
                of Singapore's fintech landscape including funding, hiring, partnerships, and expansion signals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seniority Level */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
          <CardContent className="p-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Career Seniority</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Select your current career level for personalized opportunities
            </p>
            <SenioritySelection
              selectedSeniority={selectedSeniority}
              setSelectedSeniority={setSelectedSeniority}
            />
          </CardContent>
        </Card>

        {/* Job Title */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
          <CardContent className="p-0">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Preferred Job Title or Role</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
              Enter your current or desired job title for personalized opportunities
            </p>
            <JobTitleInput
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
            />
          </CardContent>
        </Card>

        {/* Alpha Threshold - COMMENTED OUT FOR MVP v1.0 */}
        {/* <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
          <CardContent className="p-0">
            <AlphaThreshold
              alphaThreshold={alphaThreshold}
              setAlphaThreshold={setAlphaThreshold}
            />
          </CardContent>
        </Card> */}

        {/* Target Path */}
        <TargetPath
          targetPath={targetPath}
          setTargetPath={setTargetPath}
        />

        {/* Action Button */}
        <div className="text-center mt-8 sm:mt-12">
          {/* Debug Info - Always visible for testing */}
          <div style={{backgroundColor: '#1f2937', padding: '12px', marginBottom: '16px', borderRadius: '8px', fontSize: '12px', textAlign: 'left', border: '2px solid #3b82f6'}}>
            <div style={{color: '#9ca3af', marginBottom: '8px'}}>🔍 DEBUG PANEL:</div>
            <div style={{color: '#fff'}}>User ID: {userId ? '✅ Present' : '❌ Missing'}</div>
            <div style={{color: '#fff'}}>Industries: {selectedIndustries.length} selected</div>
            <div style={{color: '#fff'}}>Regions: {selectedRegions.length} selected</div>
            <div style={{color: '#fff'}}>Button Disabled: {selectedIndustries.length === 0 || selectedRegions.length === 0 || selectedCities.length === 0 || selectedSeniority === '' || !userId ? '✅ Yes' : '❌ No'}</div>
            <div style={{color: '#fff'}}>Seniority: {selectedSeniority || '❌ Not selected'}</div>
            <div style={{color: '#fff'}}>Job Title: {jobTitle || '❌ Not entered'}</div>
            <div style={{color: '#fff'}}>Is Saving: {isSaving ? '✅ Yes' : '❌ No'}</div>
            <div style={{color: '#fff'}}>Handler Status: Working</div>
            <div style={{color: '#fff'}}>Environment: {process.env.NODE_ENV || 'unknown'}</div>
          </div>
          
          {/* Test Button */}
          <div className="mb-4">
            <Button 
              onClick={() => {
                alert('Test button works! onClick is functioning.')
                console.log('🟢 Test button clicked successfully')
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Test Click Handler
            </Button>
          </div>
          
          {/* Simple Test Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                alert('Simple HTML button clicked!')
                console.log('🟢 Simple HTML button clicked')
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Simple HTML Button
            </button>
          </div>
          
          <Button 
            size="lg"
            onClick={handleSavePreferences}
            disabled={selectedIndustries.length === 0 || selectedRegions.length === 0 || selectedCities.length === 0 || selectedSeniority === '' || !userId || isSaving}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                {isUpdating ? 'Update Preferences' : 'Continue'}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
            {selectedIndustries.length === 0 
              ? 'Select at least one industry to continue'
              : selectedRegions.length === 0 
                ? 'Select at least one region to continue'
                : selectedCities.length === 0 
                  ? 'Select at least one city to continue'
                  : selectedSeniority === '' 
                    ? 'Select your seniority level to continue'
                    : !userId 
                      ? 'Please wait... authenticating'
                      : isUpdating 
                        ? 'Ready to update preferences'
                        : 'Ready to continue'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
