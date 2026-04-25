'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold text-white">
          The Ambitions
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-white/80 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/dashboard" 
            className="text-white/80 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              The Ambitions
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto">
            Unlock your potential with our cutting-edge agentic platform. 
            Where ambition meets innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
              Join the Waitlist
            </button>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Intelligent Automation</h3>
            <p className="text-white/70">
              Advanced AI-powered workflows that adapt to your unique needs and scale with your ambitions.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Real-time Collaboration</h3>
            <p className="text-white/70">
              Connect with like-minded individuals and build something extraordinary together.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Growth Analytics</h3>
            <p className="text-white/70">
              Track your progress with detailed insights and make data-driven decisions.
            </p>
          </div>
        </div>

        <div className="text-center mt-24">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Transform Your Future?</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 max-w-2xl mx-auto">
            <p className="text-white/80 mb-6">
              Be the first to experience the future of agentic technology. Join our exclusive waitlist today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                Get Early Access
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
