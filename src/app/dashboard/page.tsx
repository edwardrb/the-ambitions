'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/utils/supabase'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimateOnScroll from "@/components/AnimateOnScroll"

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navigation */}
        <nav className="fixed top-0 left-64 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-400">
                  Your agentic dashboard is ready to help you achieve your ambitions.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="pt-24 px-8 pb-8">
          {/* Stats Cards */}
          <AnimateOnScroll delay={0.2}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] rounded-xl mb-4 shadow-lg shadow-[#1a5ee9]/25"></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Active Projects</h3>
                  <p className="text-3xl font-bold text-white mb-2">12</p>
                  <p className="text-gray-400 text-sm">3 completed this month</p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4 shadow-lg shadow-purple-500/25"></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Team Members</h3>
                  <p className="text-3xl font-bold text-white mb-2">8</p>
                  <p className="text-gray-400 text-sm">2 online now</p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-green-500/25"></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Tasks Completed</h3>
                  <p className="text-3xl font-bold text-white mb-2">47</p>
                  <p className="text-gray-400 text-sm">89% completion rate</p>
                </CardContent>
              </Card>
            </div>
          </AnimateOnScroll>

          {/* Recent Activity */}
          <AnimateOnScroll delay={0.4}>
            <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Project Alpha completed</p>
                      <p className="text-gray-400 text-sm">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-3 h-3 bg-[#1a5ee9] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">New team member joined</p>
                      <p className="text-gray-400 text-sm">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Milestone achieved: 1000 users</p>
                      <p className="text-gray-400 text-sm">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>

          {/* Quick Actions & Performance */}
          <AnimateOnScroll delay={0.6}>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm text-left justify-start">
                      Create New Project
                    </Button>
                    <Button className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm text-left justify-start">
                      Invite Team Member
                    </Button>
                    <Button className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm text-left justify-start">
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/5 border-white/10 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-white mb-2">
                        <span className="text-sm">Productivity</span>
                        <span className="text-sm">87%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-white mb-2">
                        <span className="text-sm">Collaboration</span>
                        <span className="text-sm">92%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '92%' }}></div>
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
                </CardContent>
              </Card>
            </div>
          </AnimateOnScroll>
        </main>
      </div>
    </div>
  )
}
