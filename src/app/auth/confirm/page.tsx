'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      if (!token_hash || !type) {
        setStatus('error')
        setMessage('Invalid confirmation link.')
        return
      }

      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        if (error) {
          setStatus('error')
          setMessage(error.message || 'Email confirmation failed.')
        } else {
          setStatus('success')
          setMessage('Email successfully confirmed!')
          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push('/verify-success')
          }, 2000)
        }
      } catch (err) {
        setStatus('error')
        setMessage('An unexpected error occurred during email confirmation.')
      }
    }

    confirmEmail()
  }, [searchParams, router])

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
              <a href="/login" className="text-gray-400 hover:text-white transition-all duration-300">
                Login
              </a>
              <a href="/dashboard" className="text-gray-400 hover:text-white transition-all duration-300">
                Dashboard
              </a>
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
                {/* Status Icon */}
                <div className="flex justify-center mb-6">
                  {status === 'loading' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-full flex items-center justify-center shadow-lg shadow-[#1a5ee9]/25">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {status === 'success' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {status === 'loading' && 'Confirming Email...'}
                    {status === 'success' && 'Email Confirmed!'}
                    {status === 'error' && 'Confirmation Failed'}
                  </h1>
                  <p className="text-gray-300">
                    {status === 'loading' && 'Please wait while we verify your email address.'}
                    {status === 'success' && 'Redirecting you to the success page...'}
                    {status === 'error' && message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {status === 'error' && (
                    <>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="w-full h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300"
                      >
                        Try Again
                      </Button>
                      <a href="/login">
                        <Button 
                          variant="outline" 
                          className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
                        >
                          Back to Login
                        </Button>
                      </a>
                    </>
                  )}
                  {status === 'success' && (
                    <a href="/dashboard">
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300"
                      >
                        Go to Dashboard
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </main>
    </div>
  )
}
