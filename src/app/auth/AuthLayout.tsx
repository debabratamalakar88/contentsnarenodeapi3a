
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Facebook, Twitter, Chrome } from 'lucide-react';
import Image from 'next/image';

const AuthfyLogo = () => (
    <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FFD54F', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FF8A65', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4FC3F7', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#29B6F6', stopOpacity: 1 }} />
                </linearGradient>
                 <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#4DB6AC', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#81C784', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path d="M50 0 A50 50 0 0 1 93.3 25 L50 50 Z" fill="url(#grad1)" />
            <path d="M93.3 25 A50 50 0 0 1 50 100 L50 50 Z" fill="url(#grad2)" />
            <path d="M50 100 A50 50 0 0 1 6.7 25 L50 50 Z" fill="url(#grad3)" />
            <path d="M6.7 25 A50 50 0 0 1 50 0 L50 50 Z" fill="#E57373" />
        </svg>
        <span className="text-3xl font-bold text-white">Authfy</span>
    </div>
);


interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: 'login' | 'register';
}

export function AuthLayout({ children, activeTab }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
       <Image 
        src="https://themeknit.com/demo/html/authfy/demo/images/computer-1867758_1920-min.jpg"
        alt="Background" 
        layout="fill" 
        objectFit="cover" 
        className="absolute inset-0 z-0 opacity-80" 
      />
       <div className="absolute inset-0 bg-slate-800/50 z-10" />

      <div className="relative z-20 w-full max-w-4xl flex bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#34495e] p-12 text-white text-center">
            <AuthfyLogo />
            <p className="mt-4 text-slate-300">Login using social media to get quick access</p>
            <div className="mt-8 space-y-4 w-full max-w-xs">
                <Button className="w-full bg-[#3b5998] hover:bg-[#3b5998]/90">
                    <Facebook className="mr-2 h-4 w-4"/> Sign in with Facebook
                </Button>
                <Button className="w-full bg-[#00aced] hover:bg-[#00aced]/90">
                    <Twitter className="mr-2 h-4 w-4"/> Sign in with Twitter
                </Button>
                <Button className="w-full bg-[#dd4b39] hover:bg-[#dd4b39]/90">
                    <Chrome className="mr-2 h-4 w-4"/> Sign in with Google
                </Button>
            </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
            <div className="flex border-b mb-8">
                 <Link href="/login" className={cn("py-2 px-4 font-semibold text-sm", activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500')}>
                    ALREADY A MEMBER
                </Link>
                <Link href="/register" className={cn("py-2 px-4 font-semibold text-sm", activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500')}>
                    I AM NEW HERE
                </Link>
            </div>
            {children}
        </div>
      </div>
    </div>
  );
}
