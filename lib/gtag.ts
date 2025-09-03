export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-Z24GF0XYCW'

// Debug logging
// if (typeof window !== 'undefined') {
//   console.log('GA_TRACKING_ID:', GA_TRACKING_ID)
//   console.log('NEXT_PUBLIC_GA_ID env:', process.env.NEXT_PUBLIC_GA_ID)
// }

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // console.log('Tracking pageview:', url, 'with ID:', GA_TRACKING_ID)
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track affiliate link clicks
export const trackAffiliateClick = ( productName: string, platform: string) => {
  event({
    action: 'affiliate_click',
    category: 'engagement',
    label: ` ${productName} - ${platform}`,
  })
}

// Track page views with consent
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.hasConsentedToAnalytics) {
    pageview(url)
  }
}
