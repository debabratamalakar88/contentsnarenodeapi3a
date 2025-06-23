'use client'

import { cn } from "@/lib/utils"

const steps = ["Templates", "Essentials", "Builder", "Preview", "Finalize"];

interface StepNavigationProps {
    currentStep: string;
    onStepClick: (step: string) => void;
}

export default function StepNavigation({ currentStep, onStepClick }: StepNavigationProps) {
    const currentStepIndex = steps.indexOf(currentStep);

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold text-center mb-2">Create New Request</h1>
            <p className="text-center text-muted-foreground mb-6">Follow the steps to build and send your content request.</p>
            <nav className="flex items-center justify-center">
                <div className="flex items-center w-full max-w-3xl">
                    {steps.map((step, index) => (
                        <div key={step} className="flex items-center w-full">
                            <button
                                className={cn(
                                    "flex flex-col items-center text-center",
                                )}
                                onClick={() => onStepClick(step)}
                                disabled={index > currentStepIndex + 1 && process.env.NODE_ENV === 'production'} // A small cheat for easier debugging
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors duration-300",
                                        index <= currentStepIndex ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
                                    )}
                                >
                                    {index + 1}
                                </div>
                                <p className={cn(
                                    "text-sm mt-1 font-medium",
                                    index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                                    )}
                                >{step}</p>
                            </button>

                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4 bg-border">
                                     <div className={cn(
                                        "h-full bg-primary transition-all duration-300",
                                        index < currentStepIndex ? "w-full" : "w-0"
                                    )} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </nav>
        </div>
    )
}
