
'use client'

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react";

interface Step {
    name: string;
    slug: string;
}

interface StepNavigationProps {
    steps: Step[];
    currentStepSlug: string;
    onStepClick: (slug: string) => void;
    maxVisitedStepIndex: number;
    disabledSteps?: string[];
}

export default function StepNavigation({ steps, currentStepSlug, onStepClick, maxVisitedStepIndex, disabledSteps = [] }: StepNavigationProps) {
    const currentStepIndex = steps.findIndex(step => step.slug === currentStepSlug);

    return (
        <nav className="flex items-center justify-center">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isStepDisabled = index > maxVisitedStepIndex || disabledSteps.includes(step.slug);
                    return (
                        <div key={step.slug} className="flex items-center">
                            <button
                                className={cn(
                                    "flex items-center gap-2 text-center",
                                    isStepDisabled && "cursor-not-allowed opacity-50"
                                )}
                                onClick={() => onStepClick(step.slug)}
                                disabled={isStepDisabled}
                            >
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors duration-300",
                                        index === currentStepIndex ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
                                    )}
                                >
                                    {index + 1}
                                </div>
                                <p className={cn(
                                    "text-sm font-medium",
                                    index === currentStepIndex ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >{step.name}</p>
                            </button>

                            {index < steps.length - 1 && (
                            <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />
                            )}
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}
