import type { Metadata } from "next";
import localFont from "next/font/local";
import Layout from "./MyComponent/layout";
import AuthProvider from "./auth/AuthProvider";
import "./globals.css";
import RecoilProvider from "./store/recoilProvider";
import { Toaster } from "@/components/ui/toaster";

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
  title: "CelebrityWears",
  description: "Decodes what celebrities wore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
          <AuthProvider>
            <Layout>
            <RecoilProvider>
              <main>{children}</main>
              <Toaster />
            </RecoilProvider>
            </Layout>
          </AuthProvider>
      </body>
    </html>
  );
}
