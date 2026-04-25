'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-black/40 border-b border-white/10' 
        : 'backdrop-blur-xl bg-black/20 border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:from-white group-hover:via-white group-hover:to-white transition-all duration-300">
                THE AMBITIONS
              </span>
            </span>
            <span className="text-xl animate-pulse">✨</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/login" 
              className="text-gray-400 hover:text-white transition-all duration-300 font-medium"
            >
              Login
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-400 hover:text-white transition-all duration-300 font-medium"
            >
              Dashboard
            </Link>
            <Button 
              size="sm"
              className="h-9 px-6 bg-gradient-to-r from-[#1a5ee9] to-[#3d8bfd] hover:from-[#1554d6] hover:to-[#2d7aed] text-white font-semibold rounded-lg shadow-lg shadow-[#1a5ee9]/25 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
