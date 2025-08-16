'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

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
    // Add Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_location: window.location.href,
        anonymize_ip: true,
      })
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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-4 md:right-auto md:w-96">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">🍪 We use cookies</CardTitle>
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
            We use cookies to analyze site traffic and optimize your experience. 
            This helps us understand which celebrity outfits you're interested in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={acceptAnalytics} className="flex-1">
              Accept Analytics
            </Button>
            <Button variant="outline" onClick={declineAnalytics} className="flex-1">
              Decline
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You can change your preferences anytime in your browser settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
