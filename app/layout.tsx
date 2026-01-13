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
  title: "Acethetics | Celebrity Fashion, Style & Aesthetics",
  description: "Explore the latest celebrity fashion trends, outfits, and aesthetics.",
  icons: {
    icon: '/Acethetics.png',
    shortcut: '/Acethetics.png',
    apple: '/Acethetics.png',
  },
  openGraph: {
    title: "Acethetics | Celebrity Fashion, Style & Aesthetics",
    description: "Explore the latest celebrity fashion trends, outfits, and aesthetics.",
    url: "https://acethetics.starzc.com",
    siteName: "Acethetics",
    images: ["/Acethetics.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acethetics",
    images: ["/Acethetics.png"],
  },
  robots: "index, follow",
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
