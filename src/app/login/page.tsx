'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signUpWithEmail } from '@/utils/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Validate password match for signup
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await signUpWithEmail(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Sign up successful! Please check your email to verify your account.')
        }
      } else {
        const { data, error } = await signInWithEmail(email, password)
        if (error) {
          setError(error.message)
        } else {
          // Force Next.js to recognize the new login cookie
          await router.refresh()
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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
                href="/" 
                className="text-gray-400 hover:text-white transition-all duration-300"
              >
                Home
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
            <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-gray-400">
                    {isSignUp 
                      ? 'Join the future of agentic ambition' 
                      : 'Sign in to continue your journey'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 backdrop-blur-sm"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 backdrop-blur-sm"
                      placeholder="Enter your password"
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`h-12 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 backdrop-blur-sm ${
                          confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                        placeholder="Confirm your password"
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                      <p className="text-green-200 text-sm">{message}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-400 text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp)
                        setError('')
                        setMessage('')
                        setConfirmPassword('')
                      }}
                      className="ml-1 text-[#1a5ee9] hover:text-[#3d8bfd] transition-colors font-medium"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    ← Back to home
                  </Link>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </main>
    </div>
  )
}
