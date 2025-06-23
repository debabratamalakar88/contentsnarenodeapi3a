'use client'

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react";

const steps = ["Templates", "Essentials", "Builder", "Preview", "Finalize"];

interface StepNavigationProps {
    currentStep: string;
    onStepClick: (step: string) => void;
}

export default function StepNavigation({ currentStep, onStepClick }: StepNavigationProps) {
    const currentStepIndex = steps.indexOf(currentStep);

    return (
        <nav className="flex items-center justify-center">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <div key={step} className="flex items-center">
                        <button
                            className={cn(
                                "flex items-center gap-2 text-center",
                            )}
                            onClick={() => onStepClick(step)}
                            disabled={index > currentStepIndex + 1 && process.env.NODE_ENV === 'production'}
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
                            >{step}</p>
                        </button>

                        {index < steps.length - 1 && (
                           <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />
                        )}
                    </div>
                ))}
            </div>
        </nav>
    )
}
