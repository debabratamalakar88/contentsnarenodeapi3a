
'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import StepNavigation from './components/StepNavigation';

const steps = [
    { name: "Essentials", slug: "essentials" },
    { name: "Builder", slug: "builder" },
    { name: "Preview", slug: "preview" }
];

export default function NewMyTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const currentStepSlug = pathname.split('/').pop() || 'essentials';
  const currentStepIndex = steps.findIndex(s => s.slug === currentStepSlug);

  const handleStepClick = () => {
    // This layout is simple and doesn't handle step saving/validation
    // so clicking steps is a no-op for now. The button handles navigation.
  }
  
  return (
    <div className="flex flex-col h-full bg-muted/40">
        <header className="flex-shrink-0 bg-background">
            <div className="flex items-center justify-between gap-4 p-4 border-b">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/dashboard/templates">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <StepNavigation
                    steps={steps}
                    currentStepSlug={currentStepSlug}
                    onStepClick={handleStepClick}
                    maxVisitedStepIndex={currentStepIndex}
                />
                <div className="w-8" />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
    </div>
  )
}
