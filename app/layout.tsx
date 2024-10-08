import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "./MyComponent/NavBar";
import { Sidebar } from "./MyComponent/Sidebar";

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
  description: "decodes what celebrities wore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar/>
        <Sidebar />
        <main>
        {children}
        </main>
      </body>
    </html>
  );
}
