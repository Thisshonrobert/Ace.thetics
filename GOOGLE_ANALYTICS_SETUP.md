# Google Analytics Setup Guide

## Prerequisites
1. Google Analytics account (GA4)
2. Your website's Google Analytics Measurement ID (starts with G-)

## Setup Steps

### 1. Create Environment Variables
Create a `.env.local` file in your project root and add:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

### 2. Get Your Google Analytics ID
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or select existing one
3. Go to Admin → Data Streams → Web
4. Copy the Measurement ID (starts with G-)

### 3. Test the Implementation
1. Start your development server
2. Open your website
3. Accept the cookie consent banner
4. Check browser console for any errors
5. Visit Google Analytics Real-Time reports to see live data

## What Gets Tracked

### Page Views
- All page visits (with consent)
- Navigation between pages
- Time spent on pages

### Affiliate Clicks
- Which celebrity outfits get clicked
- Which shopping platforms perform best
- Product category performance

### User Behavior
- Traffic sources
- Geographic location
- Device types
- Bounce rates

## Custom Events You Can Track

### Affiliate Performance
```typescript
// Track when users click affiliate links
trackAffiliateClick( 'Product Name', 'Platform')

// Track wishlist additions
trackEvent({
  action: 'add_to_wishlist',
  category: 'engagement',
  label: 'Product Name'
})
```

### User Engagement
```typescript
// Track search queries
trackEvent({
  action: 'search',
  category: 'engagement',
  label: 'Search Query'
})

// Track filter usage
trackEvent({
  action: 'filter_applied',
  category: 'engagement',
  label: 'Filter Type'
})
```

## Privacy & Compliance

### India-Specific Considerations
- No strict GDPR requirements
- Good practice to implement consent for user trust
- Consider future compliance needs

### Data Anonymization
- IP addresses are anonymized
- No personally identifiable information collected
- Respects user privacy preferences

## Troubleshooting

### Common Issues
1. **Analytics not loading**: Check if consent was given
2. **Events not firing**: Verify consent state
3. **No data in GA**: Wait 24-48 hours for data to appear

### Debug Mode
Add this to your browser console to test:
```javascript
// Check if analytics is loaded
console.log('GTAG loaded:', !!window.gtag)
console.log('Consent given:', window.hasConsentedToAnalytics)
```

## Performance Impact
- Minimal impact on page load
- Analytics loads only after consent
- Script is loaded asynchronously
- No blocking of page rendering

## Next Steps
1. Set up conversion goals in Google Analytics
2. Create custom dashboards for affiliate performance
3. Set up automated reports
4. Monitor and optimize based on data insights
