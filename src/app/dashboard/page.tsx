'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/utils/supabase'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              The Ambitions
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-white/80">
            Your agentic dashboard is ready to help you achieve your ambitions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Active Projects</h3>
            <p className="text-3xl font-bold text-white mb-2">12</p>
            <p className="text-white/60 text-sm">3 completed this month</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Team Members</h3>
            <p className="text-3xl font-bold text-white mb-2">8</p>
            <p className="text-white/60 text-sm">2 online now</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-3">Tasks Completed</h3>
            <p className="text-3xl font-bold text-white mb-2">47</p>
            <p className="text-white/60 text-sm">89% completion rate</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Project Alpha completed</p>
                <p className="text-white/60 text-sm">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">New team member joined</p>
                <p className="text-white/60 text-sm">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">Milestone achieved: 1000 users</p>
                <p className="text-white/60 text-sm">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 text-left">
                Create New Project
              </button>
              <button className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 text-left">
                Invite Team Member
              </button>
              <button className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20 text-left">
                View Analytics
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span className="text-sm">Productivity</span>
                  <span className="text-sm">87%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span className="text-sm">Collaboration</span>
                  <span className="text-sm">92%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span className="text-sm">Growth</span>
                  <span className="text-sm">78%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
