'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface FashionSectionProps {
  section: 'men' | 'women'
  imageSrc: string
  title: string
  subtitle: string
  sectionRef: React.RefObject<HTMLDivElement>
  onMouseEnter: (section: 'men' | 'women') => void
  onMouseLeave: () => void
}

function FashionSection({
  section,
  imageSrc,
  title,
  subtitle,
  sectionRef,
  onMouseEnter,
  onMouseLeave
}: FashionSectionProps) {
  return (
    <div
      ref={sectionRef}
      className={`${section}-section w-full md:w-1/2 h-screen md:h-screen relative overflow-hidden cursor-pointer transition-all duration-700`}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
    >
      {/* Background Image Container */}
      <div className="w-full h-full overflow-hidden">
        <img
          src={imageSrc}
          alt={`${title} Fashion`}
          className="bg-image object-cover w-full h-full transition-transform duration-700"
          style={{
            objectPosition: 'center 20%'
          }}
        />
      </div>

      {/* Content Container - Responsive positioning */}
      <Card className="absolute bottom-8 md:bottom-20 left-4 md:left-10 right-4 md:right-auto bg-transparent border-none shadow-none text-white z-10">
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-4xl md:text-6xl lg:text-8xl font-bold uppercase tracking-widest mb-2 md:mb-4 text-white text-center md:text-left"
            style={{ fontFamily: 'Butler, serif' }}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <h5 
            className="text-lg md:text-2xl lg:text-3xl font-light uppercase tracking-widest mb-4 md:mb-8 text-white text-center md:text-left"
            style={{ fontFamily: 'Varela Round, sans-serif' }}
          >
            {subtitle}
          </h5>
          <div className="shop-btn flex justify-center md:justify-start">
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider font-medium bg-transparent text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
              style={{ fontFamily: 'Varela Round, sans-serif' }}
            >
              Shop Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Initial Reveal Overlay */}
      <div className="reveal-overlay absolute inset-0 bg-black z-20"></div>
    </div>
  )
}

export default function FashionLandingPageEnhanced() {
  const menSectionRef = useRef<HTMLDivElement>(null)
  const womenSectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Page load animation
    const tl = gsap.timeline()

    // Animate reveal overlays
    tl.to('.reveal-overlay', {
      y: '100%',
      duration: 1,
      ease: 'power2.inOut'
    })

    // Animate text elements
    tl.from('h1, h5', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out'
    }, '-=0.5')

    // Initial state for shop buttons - only hide on desktop
    if (window.innerWidth >= 768) {
      gsap.set('.shop-btn', { opacity: 0 })
    }
  }, [])

  const handleMouseEnter = (section: 'men' | 'women') => {
    // Only apply hover effects on desktop
    if (window.innerWidth < 768) return

    if (section === 'men') {
      gsap.to(menSectionRef.current, {
        width: '75%',
        duration: 0.7,
        ease: 'power2.inOut'
      })
      gsap.to(womenSectionRef.current, {
        width: '25%',
        duration: 0.7,
        ease: 'power2.inOut'
      })
      
      // Reduced scale to prevent over-zooming
      const menBgImage = menSectionRef.current?.querySelector('.bg-image')
      if (menBgImage) {
        gsap.to(menBgImage, {
          scale: 1.05,
          duration: 0.7,
          ease: 'power2.inOut'
        })
      }
      
      const menShopBtn = menSectionRef.current?.querySelector('.shop-btn')
      if (menShopBtn) {
        gsap.to(menShopBtn, {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.inOut'
        })
      }
    } else {
      gsap.to(womenSectionRef.current, {
        width: '75%',
        duration: 0.7,
        ease: 'power2.inOut'
      })
      gsap.to(menSectionRef.current, {
        width: '25%',
        duration: 0.7,
        ease: 'power2.inOut'
      })
      
      // Reduced scale to prevent over-zooming
      const womenBgImage = womenSectionRef.current?.querySelector('.bg-image')
      if (womenBgImage) {
        gsap.to(womenBgImage, {
          scale: 1.05,
          duration: 0.7,
          ease: 'power2.inOut'
        })
      }
      
      const womenShopBtn = womenSectionRef.current?.querySelector('.shop-btn')
      if (womenShopBtn) {
        gsap.to(womenShopBtn, {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.inOut'
        })
      }
    }
  }

  const handleMouseLeave = () => {
    // Only apply hover effects on desktop
    if (window.innerWidth < 768) return

    gsap.to([menSectionRef.current, womenSectionRef.current], {
      width: '50%',
      duration: 0.7,
      ease: 'power2.inOut'
    })
    gsap.to('.bg-image', {
      scale: 1,
      duration: 0.7,
      ease: 'power2.inOut'
    })
    gsap.to('.shop-btn', {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut'
    })
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {/* Men's Section */}
      <FashionSection
        section="men"
        imageSrc="/vijay3.jpg"
        title="MEN"
        subtitle="FASHION"
        sectionRef={menSectionRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Women's Section */}
      <FashionSection
        section="women"
        imageSrc="/samantha.webp"
        title="WOMEN"
        subtitle="FASHION"
        sectionRef={womenSectionRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}