'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function AuthCodeErrorPage() {
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
        <div className="w-full max-w-md px-6">
          <AnimateOnScroll delay={0.2}>
            <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    Authentication Failed
                  </h1>
                  <p className="text-gray-300 mb-2">
                    There was an issue verifying your email.
                  </p>
                  <p className="text-gray-400 text-sm">
                    The verification link may have expired or is invalid. Please try signing up again.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href="/login">
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300"
                    >
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
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
