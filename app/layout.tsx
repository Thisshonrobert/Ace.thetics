import type { Metadata } from "next";
import localFont from "next/font/local";
import Layout from "./MyComponent/layout";
import AuthProvider from "./auth/AuthProvider";
import "./globals.css";
import RecoilProvider from "./store/recoilProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactLenis } from "@/app/hooks/useSmoothScroll";

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
  title: 'Ace.thetics,aesthetic,aesthetics,fashion,celebrities,style,trends,outfit,look,inspiration,lookMax,lookMaxing,glooming',
  description: 'Ace.thetics - Decodes what aesthetic celebrities wore ',
  icons: {
    icon: '/Acethetics.png'
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
      <ReactLenis root>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        <AuthProvider>
          <Layout>
            <RecoilProvider>
             
                <main className="scroll-container">{children}</main>
              
              <Toaster />
            </RecoilProvider>
          </Layout>
        </AuthProvider>
      </body>
      </ReactLenis>
    </html>
  );
}
