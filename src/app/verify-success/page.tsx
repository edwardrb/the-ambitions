'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react"

export default function VerifySuccessPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-semibold text-white font-['Afacad_Flux']">
              The Ambitions
            </Link>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-gray-400 hover:text-white transition-all duration-300"
              >
                Login
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-400 hover:text-white transition-all duration-300"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen pt-20">
        <div className="w-full max-w-2xl px-6">
          <AnimateOnScroll delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <CardContent className="p-12">
                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Email Verified!
                  </h1>
                  <p className="text-xl text-gray-300 mb-2">
                    Welcome to The Ambitions
                  </p>
                  <p className="text-gray-400">
                    Your email has been successfully verified. You're now ready to start your agentic journey.
                  </p>
                </div>

                {/* Success Features */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">AI Powered</h3>
                    <p className="text-xs text-gray-400">Advanced automation</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Secure</h3>
                    <p className="text-xs text-gray-400">Enterprise-grade security</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Ready</h3>
                    <p className="text-xs text-gray-400">Start immediately</p>
                  </div>
                </div>

                {/* Auto-redirect Message */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a5ee9]/10 border border-[#1a5ee9]/20 rounded-full">
                    <span className="text-[#1a5ee9] text-sm font-medium">
                      Redirecting to dashboard in {countdown} seconds...
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button 
                      size="lg"
                      className="h-14 px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Go to Dashboard Now
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-14 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-gray-500 text-sm">
                    Need help? <Link href="/support" className="text-[#1a5ee9] hover:text-[#3d8bfd] transition-colors">Contact Support</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </main>
    </div>
  )
}
