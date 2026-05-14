'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import AnimateOnScroll from "@/components/AnimateOnScroll"

export default function UnsubscribePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    const unsubscribe = async () => {
      const userId = searchParams.get('user_id')
      
      if (!userId) {
        setMessage('Invalid unsubscribe link')
        return
      }
      
      setIsProcessing(true)
      
      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        })
        
        if (response.ok) {
          setMessage('Successfully unsubscribed from weekly digest')
        } else {
          setMessage('Failed to unsubscribe. Please try again.')
        }
      } catch (error) {
        setMessage('An error occurred. Please contact support.')
      }
      
      setIsProcessing(false)
    }
    
    unsubscribe()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <AnimateOnScroll delay={0.2}>
          <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-500/10 via-gray-600/5 to-transparent border-gray-400/30 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              {/* Mail Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl sm:rounded-3xl mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg shadow-gray-500/25">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              {isProcessing ? (
                <>
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300 text-base sm:text-lg">Processing your request...</p>
                </>
              ) : message ? (
                <>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl sm:rounded-3xl mx-auto mb-6 sm:mb-8 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-4">{message}</h1>
                  <p className="text-gray-400 mb-6">
                    {message.includes('Successfully') 
                      ? 'You will no longer receive weekly digest emails.'
                      : 'If you continue to have issues, please contact our support team.'
                    }
                  </p>
                  <Button 
                    onClick={() => router.push('/')}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Return to Home
                  </Button>
                </>
              ) : (
                <p className="text-gray-400">Processing...</p>
              )}
            </CardContent>
          </Card>
        </AnimateOnScroll>
      </div>
    </div>
  )
}
