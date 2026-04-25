'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

// Force the page to render at runtime
export const dynamic = 'force-dynamic'

/**
 * Logic-only component that uses useSearchParams.
 * This must be wrapped in Suspense for the Vercel build to succeed.
 */
function AuthConfirmLogic() {
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
          // Force Next.js to recognize the new login cookie
          await router.refresh()
          setTimeout(() => {
            router.push('/verify-success')
          }, 2000)
        }
      } catch (err) {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      }
    }
    confirmEmail()
  }, [searchParams, router])

  return (
    <AnimateOnScroll delay={0.2}>
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            {status === 'loading' && <Loader2 className="w-16 h-16 text-[#1a5ee9] animate-spin" />}
            {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
            {status === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-3">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h1>
            <p className="text-gray-300">{message || 'Please wait while we verify your account.'}</p>
          </div>
          <div className="space-y-3">
            {status === 'success' && (
              <Button onClick={() => router.push('/dashboard')} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  )
}

/**
 * Main Export - This is what Vercel sees.
 * It contains the navigation/layout but wraps the logic in Suspense.
 */
export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10 p-6">
        <div className="text-2xl font-semibold">The Ambitions</div>
      </nav>
      <main className="flex items-center justify-center min-h-screen pt-20">
        <Suspense fallback={<Loader2 className="w-12 h-12 animate-spin text-white" />}>
          <AuthConfirmLogic />
        </Suspense>
      </main>
    </div>
  )
}
