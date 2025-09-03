'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    hasConsentedToAnalytics: boolean
    dataLayer: any[]
  }
}

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics-consent')
    if (!consent) {
      setShowConsent(true)
    } else if (consent === 'accepted') {
      window.hasConsentedToAnalytics = true
      // Load Google Analytics if consent was previously given
      loadGoogleAnalytics()
    }
  }, [])

  const loadGoogleAnalytics = () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-Z24GF0XYCW'
   
    
    // Add Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      console.log('GA script loaded successfully')
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', gaId, {
        page_location: window.location.href,
        anonymize_ip: true,
      })
      console.log('GA config sent for:', window.location.href)
    }
  }

  const acceptAnalytics = () => {
    localStorage.setItem('analytics-consent', 'accepted')
    window.hasConsentedToAnalytics = true
    setShowConsent(false)
    loadGoogleAnalytics()
  }

  const declineAnalytics = () => {
    localStorage.setItem('analytics-consent', 'declined')
    window.hasConsentedToAnalytics = false
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🍪 Cookie Consent</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConsent(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            By accepting, you agree to our use of cookies. Please review our{' '}
            <Link href="/privacy-policy" className="underline">
              privacy policy
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={acceptAnalytics} className="flex-1">
              Accept
            </Button>
            <Button variant="outline" onClick={declineAnalytics} className="flex-1">
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
