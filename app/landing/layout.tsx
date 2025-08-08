import type { Metadata } from "next";
import localFont from "next/font/local";
import AuthProvider from "../auth/AuthProvider";
import "../globals.css";
import RecoilProvider from "../store/recoilProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactLenis } from "@/app/hooks/useSmoothScroll";

// Local font imports
const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Fashion Landing - Ace.thetics',
  description: 'Fashion landing page for Ace.thetics',
  icons: {
    icon: '/Acethetics.png'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Butler:wght@400;500;600;700&family=Varela+Round&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <ReactLenis root>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthProvider>
            <RecoilProvider>
              {children}
              <Toaster />
            </RecoilProvider>
          </AuthProvider>
        </body>
      </ReactLenis>
    </html>
  )
}
