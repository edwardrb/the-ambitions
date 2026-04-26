'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  Activity,
  Zap,
  Search,
  Shield,
  Bell
} from "lucide-react"

export default function DashboardSidebar() {
  const [activeItem, setActiveItem] = useState('overview')

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Zap },
    { id: 'signals', label: 'Signal Detection', icon: Search },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-64 h-screen bg-black/50 backdrop-blur-xl border-r border-white/10 fixed left-0 top-0 pt-20">
      <div className="p-4 space-y-6">
        {/* System Status */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            {/* Pulsing Green Dot */}
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex-1">
              <div className="text-green-400 font-semibold text-sm">
                Agent Active
              </div>
              <div className="text-green-300/70 text-xs">
                Searching for Signals
              </div>
            </div>
          </div>
          
          {/* Additional Status Info */}
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-300/60">Signals Found</span>
              <span className="text-green-400 font-medium">247</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-green-300/60">Processing</span>
              <span className="text-green-400 font-medium">12</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1a5ee9]/10 text-[#1a5ee9] border border-[#1a5ee9]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === 'notifications' && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5">
                    3
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3">
            Quick Actions
          </div>
          
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-medium shadow-lg shadow-[#1a5ee9]/25"
          >
            <Zap className="w-4 h-4 mr-2" />
            Launch New Agent
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Search className="w-4 h-4 mr-2" />
            Scan for Signals
          </Button>
        </div>

        {/* Storage/Usage Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            System Usage
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">CPU</span>
                <span className="text-gray-300">42%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] h-1.5 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Memory</span>
                <span className="text-gray-300">67%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Storage</span>
                <span className="text-gray-300">23%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
