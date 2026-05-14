'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import AnimateOnScroll from "@/components/AnimateOnScroll"

export default function ThankYouPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [router])

  const handleGoToDashboard = () => {
    setIsProcessing(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <AnimateOnScroll delay={0.2}>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-400/30 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg shadow-green-500/25">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              
              {/* Thank You Message */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Thank You! 🎉
              </h1>
              
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                You've successfully upgraded to <span className="text-green-400 font-semibold">Premium Singapore Fintech Intelligence</span>. 
                Get ready for exclusive insights, advanced analytics, and priority signal processing.
              </p>
              
              {/* Premium Features List */}
              <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-6 mb-8 text-left">
                <h2 className="text-green-300 font-semibold text-lg mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Your Premium Benefits
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Unlimited signal access and historical data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Advanced filtering and custom alerts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Priority processing for your target path</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Direct outreach support and templates</span>
                  </li>
                </ul>
              </div>
              
              {/* Action Button */}
              <Button 
                onClick={handleGoToDashboard}
                disabled={isProcessing}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
              
              {/* Auto-redirect Notice */}
              <p className="text-gray-500 text-sm mt-4">
                You'll be automatically redirected to your dashboard in 5 seconds...
              </p>
            </CardContent>
          </Card>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
