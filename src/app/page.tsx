'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"

export default function Home() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#1a5ee9] via-[#3d8bfd] to-[#6ba3ff] bg-clip-text text-transparent">
                Agentic Ambition
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of intelligent automation. Where cutting-edge AI meets human potential to create unprecedented possibilities.
            </p>

            {/* Email Capture Section */}
            <AnimateOnScroll delay={0.2}>
              <div className="max-w-2xl mx-auto mb-16">
                <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <p className="text-gray-300 mb-6 text-lg">
                    Be the first to revolutionize your workflow. Join our exclusive beta program.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 bg-white/10 border-white/20 text-white placeholder-gray-500 rounded-xl focus:border-[#1a5ee9] focus:ring-2 focus:ring-[#1a5ee9]/20 backdrop-blur-sm"
                    />
                    <Button 
                      size="lg"
                      className="h-14 px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Get Early Access
                    </Button>
                  </div>
                  <p className="text-gray-500 text-sm mt-4">
                    Join 10,000+ professionals on the waitlist. No spam, ever.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {/* Large Feature Card */}
            <AnimateOnScroll delay={0.3}>
              <Card className="md:col-span-2 lg:row-span-2 backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-8 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-2xl mb-6 shadow-lg shadow-[#1a5ee9]/25"></div>
                    <h3 className="text-3xl font-bold text-white mb-4">Intelligent Automation</h3>
                    <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                      Advanced AI-powered workflows that adapt to your unique needs and scale with your ambitions. Experience seamless integration with your existing tools.
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center text-[#1a5ee9] font-medium group-hover:text-[#3d8bfd] transition-colors">
                        Learn more →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Medium Feature Card */}
            <AnimateOnScroll delay={0.4}>
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-8 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4 shadow-lg shadow-purple-500/25"></div>
                    <h3 className="text-xl font-bold text-white mb-3">Real-time Collaboration</h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      Connect with like-minded individuals and build something extraordinary together.
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                        Explore →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Small Feature Card */}
            <AnimateOnScroll delay={0.5}>
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-8 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-green-500/25"></div>
                    <h3 className="text-xl font-bold text-white mb-3">Growth Analytics</h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      Track your progress with detailed insights and make data-driven decisions.
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center text-green-400 font-medium group-hover:text-green-300 transition-colors">
                        Discover →
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Stats Card */}
            <AnimateOnScroll delay={0.6}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1a5ee9]/10 to-[#3d8bfd]/5 border-[#1a5ee9]/20 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#1a5ee9] mb-2">10K+</div>
                    <div className="text-gray-400">Beta Users</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Stats Card */}
            <AnimateOnScroll delay={0.7}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
                    <div className="text-gray-400">Uptime</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Stats Card */}
            <AnimateOnScroll delay={0.8}>
              <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                    <div className="text-gray-400">Support</div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>

          {/* Bottom CTA Section */}
          <AnimateOnScroll delay={0.9}>
            <div className="text-center">
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl p-12 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Future?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who are already revolutionizing their workflow with our agentic platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-xl shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Free Trial
                  </Button>
                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-14 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
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
    </div>
  )
}
