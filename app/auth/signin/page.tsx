'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';

// Load fonts
const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-playfair',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export default function SignInPage() {
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Google sign in failed', error);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className={`w-full h-screen flex flex-col md:flex-row bg-white overflow-hidden ${inter.variable} ${playfair.variable} font-sans`}>

            {/* Left Panel - Video & Abstract Art */}
            <div className="relative w-full md:w-1/2 h-full bg-black flex flex-col justify-end p-8 md:p-16 overflow-hidden">
                {/* Background Video */}
                <video
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="/Try_it_on_Title_page_5.mp4" type="video/mp4" />
                </video>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                      <motion.div
  className="relative z-10 text-white space-y-4 max-w-lg mb-12"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <div className="flex items-center space-x-2 text-sm uppercase tracking-widest text-white/70 mb-2">
    <span className="h-[1px] w-8 bg-white/50 inline-block"></span>
    <span>AI Fashion Experience</span>
  </div>

  <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight tracking-tight">
    Try Before <br />
    <span className="italic">You Buy</span> <br />
    With Confidence
  </h1>

  <p className="text-white/70 text-lg font-light pt-4 border-l-2 border-white/30 pl-4 mt-6">
    Experience fashion smarter with AI-powered virtual try-on, curated styles,
    and seamless shopping — designed to help you choose what truly fits you.
  </p>
</motion.div>

            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full md:w-1/2 h-full bg-white flex flex-col items-center justify-center p-8 md:p-12 relative animate-in fade-in slide-in-from-right-10 duration-700">

                {/* Brand/Logo Placeholder */}
                <div className="absolute top-8 md:top-12 flex items-center space-x-2">
                    {/* <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10"></div> */}
                    <span className="text-3xl font-bold font-serif tracking-tight text-gray-900 acethetics-heading">Acethetics</span>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-serif font-medium text-gray-900">Welcome </h2>
                        <p className="text-gray-500 font-light">
                            Sign in to explore your fashion finds.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="w-full h-14 text-base font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-3"
                        >
                            {googleLoading ? (
                                <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FcGoogle className="w-6 h-6" />
                                    <span>Sign In with Google</span>
                                </>
                            )}
                        </Button>
                    </div>


                </div>

                {/* Footer info/links */}
                <div className="absolute bottom-6 text-xs text-gray-300 flex space-x-4">
                    <span>Terms</span>
                    <span>Privacy</span>
                </div>
            </div>
        </div>
    );
}
