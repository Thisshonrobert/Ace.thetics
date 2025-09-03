import type { Metadata } from "next";
import localFont from "next/font/local";
import Layout from "./MyComponent/layout";
import AuthProvider from "./auth/AuthProvider";
import "./globals.css";
import RecoilProvider from "./store/recoilProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactLenis } from "@/app/hooks/useSmoothScroll";
import CookieConsent from "@/components/CookieConsent";

// Local font imports
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://acethetics.starzc.com"),
  title: {
    default: "Acethetics | Celebrity Fashion, Style & Aesthetics",
    template: `%s | Acethetics`,
  },
  description: "Explore the latest celebrity fashion trends, outfits, and aesthetics. Get inspired by your favorite stars and shop their looks. Acethetics decodes the style of celebrities.",
  keywords: ["fashion", "celebrity fashion", "celebrity style", "aesthetics", "outfits", "style inspiration", "fashion trends", "shop the look"],
  openGraph: {
    title: "Acethetics | Celebrity Fashion, Style & Aesthetics",
    description: "Explore the latest celebrity fashion trends, outfits, and aesthetics. Get inspired by your favorite stars and shop their looks. Acethetics decodes the style of celebrities.",
    url: "https://acethetics.starzc.com",
    siteName: "Acethetics",
    images: [
      {
        url: "/Acethetics.png",
        width: 1200,
        height: 630,
        alt: "Acethetics Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acethetics | Celebrity Fashion, Style & Aesthetics",
    description: "Explore the latest celebrity fashion trends, outfits, and aesthetics. Get inspired by your favorite stars and shop their looks. Acethetics decodes the style of celebrities.",
    images: ["/Acethetics.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Acethetics",
              "url": "https://acethetics.starzc.com",
              "description": "Explore the latest celebrity fashion trends, outfits, and aesthetics. Get inspired by your favorite stars and shop their looks. Acethetics decodes the style of celebrities.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://acethetics.starzc.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <ReactLenis root>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        <AuthProvider>
          <Layout>
            <RecoilProvider>
             
                <main className="scroll-container">{children}</main>
              
              <Toaster />
              <CookieConsent />
            </RecoilProvider>
          </Layout>
        </AuthProvider>
      </body>
      </ReactLenis>
    </html>
  );
}
