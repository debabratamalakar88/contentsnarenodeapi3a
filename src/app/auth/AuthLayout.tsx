
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Chrome } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '@/components/icons';

const NarlaxLogo = () => (
    <div className="flex items-center gap-3">
        <Logo className="h-10 w-10 text-white" />
        <span className="text-3xl font-bold text-white">Narlax</span>
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
        className="absolute inset-0 z-0" 
      />
       <div className="absolute inset-0 bg-slate-900/60 z-10" />

      <div className="relative z-20 w-full max-w-3xl flex bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Left Panel */}
        <div 
          className="hidden md:flex flex-col items-center justify-center p-12 text-white text-center"
          style={{ width: '40%', backgroundColor: 'rgba(38, 43, 72, 0.92)' }}
        >
            <NarlaxLogo />
            <p className="mt-4 text-slate-300">Login using social media to get quick access</p>
            <div className="mt-8 space-y-4 w-full max-w-xs">
                <Button className="w-full bg-[#dd4b39] hover:bg-[#dd4b39]/90">
                    <Chrome className="mr-2 h-4 w-4"/> Sign in with Google
                </Button>
            </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[60%] p-8 sm:p-12">
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
