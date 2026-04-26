'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [signalsProcessed, setSignalsProcessed] = useState(0)
  const [successRate, setSuccessRate] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)

  useEffect(() => {
    const animateCounter = (setter: Function, target: number, duration: number) => {
      const startTime = Date.now()
      const startValue = 0
      
      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        const currentValue = Math.floor(startValue + (target - startValue) * progress)
        
        setter(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }

    // Animate all counters with staggered timing
    animateCounter(setWaitlistCount, 1247, 2000)
    setTimeout(() => animateCounter(setSignalsProcessed, 8564, 1800), 200)
    setTimeout(() => animateCounter(setSuccessRate, 94, 1600), 400)
    setTimeout(() => animateCounter(setActiveUsers, 89, 1400), 600)
  }, [])

  const handleSubmitWaitlist = async () => {
    if (!email || !email.includes('@')) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ 
          email: email.toLowerCase(),
          created_at: new Date().toISOString()
        }])

      if (error) {
        console.error('Error adding to waitlist:', error)
      } else {
        setShowSuccessToast(true)
        setEmail('')
        setTimeout(() => setShowSuccessToast(false), 5000)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold text-white font-['Afacad_Flux']">
              The Ambitions
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-white/70 hover:text-white transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                href="/dashboard" 
                className="text-white/70 hover:text-white transition-all duration-300"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Bento Grid */}
      <main className="relative pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Content */}
          <div className="text-center mb-16">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center justify-center mb-8">
              <Badge className="relative px-6 py-2 text-sm font-medium bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] text-white border-0 shadow-lg shadow-[#1a5ee9]/25">
                <span className="absolute inset-0 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-full blur-lg opacity-50 animate-pulse"></span>
                <span className="relative">Coming Soon</span>
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6" style={{ lineHeight: '0.85' }}>
              <span className="font-serif italic bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
                The Ambitions
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                of Market Domination.
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Capture the Asymmetry.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0" style={{ letterSpacing: '0.02em' }}>
              A self-evolving engine that learns your targets, scores the world's data, and delivers mission-critical insights before they hit the wire. High-conviction signals, institutional-grade sentiment, and one-click execution.
            </p>

            {/* Email Capture Section */}
            <AnimateOnScroll delay={0.2}>
              <div className="max-w-2xl mx-auto mb-12 sm:mb-16 px-4 sm:px-0">
                <div className="backdrop-blur-xl bg-black/60 rounded-2xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    Deploy Your Analyst Assistant
                  </h3>
                  <p className="text-zinc-300 mb-4 sm:mb-6 text-base sm:text-lg">
                    Register for early access to the self-evolving engine. Be the first to act on high-conviction insights that everyone talks about 3 months later.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 sm:h-14 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 backdrop-blur-sm text-sm sm:text-base"
                    />
                    <Button 
                      size="lg"
                      onClick={handleSubmitWaitlist}
                      disabled={isSubmitting}
                      className="h-12 sm:h-14 px-4 sm:px-8 bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-500 hover:to-yellow-700 text-black font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isSubmitting ? 'Joining...' : 'SECURE EARLY ACCESS'}
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                    No spam, ever. Get early access to AI-powered market intelligence.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20 px-4 sm:px-0">
            {/* Waitlist Count */}
            <AnimateOnScroll delay={0.3}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1a5ee9]/10 to-[#3d8bfd]/5 border-[#1a5ee9]/20 rounded-xl sm:rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a5ee9] mb-1 sm:mb-2">{waitlistCount.toLocaleString()}+</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Waitlist</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Signals Processed */}
            <AnimateOnScroll delay={0.4}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 rounded-xl sm:rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2">{signalsProcessed.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Signals</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Success Rate */}
            <AnimateOnScroll delay={0.5}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 rounded-xl sm:rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-300 mb-1 sm:mb-2">{successRate}%</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Success Rate</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Active Users */}
            <AnimateOnScroll delay={0.6}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 rounded-xl sm:rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">{activeUsers}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Beta Users</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>

          {/* Bottom CTA Section */}
          <AnimateOnScroll delay={0.7}>
            <div className="text-center px-4 sm:px-0">
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                  Get Your Market Intelligence Edge
                </h2>
                <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Join professionals accessing real-time Major Alpha signals, AI-powered sentiment analysis, and personalized investment insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={handleSubmitWaitlist}
                    disabled={isSubmitting}
                    className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </Button>
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-12 sm:h-14 px-6 sm:px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </AnimateOnScroll>
        </div>
      </main>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 sm:top-24 right-4 sm:right-6 left-4 sm:left-auto z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-xl border border-green-400/30 rounded-xl p-3 sm:p-4 shadow-lg shadow-green-500/25 max-w-sm mx-auto sm:mx-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm">You're on the list!</h4>
                <p className="text-green-100 text-xs">We will reach out with your invite.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
