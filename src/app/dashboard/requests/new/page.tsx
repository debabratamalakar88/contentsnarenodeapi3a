'use client'
import { useState } from "react";
import StepNavigation from './components/StepNavigation';
import TemplatesStep from './components/TemplatesStep';
import EssentialsStep from './components/EssentialsStep';
import BuilderStep from './components/BuilderStep';
import PreviewStep from './components/PreviewStep';
import FinalizeStep from './components/FinalizeStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Type definitions for the entire wizard
export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio';
export interface Question {
  id: number;
  label: string;
  type: QuestionType;
  instructions?: string;
  placeholder?: string;
  options?: string[];
}
export interface Section {
  id: number;
  title: string;
  instructions?: string;
  questions: Question[];
}
export interface Page {
  id: number;
  title: string;
  instructions?: string;
  sections: Section[];
}

const initialPagesData: Page[] = [
  {
    id: 1,
    title: "1. New Page",
    instructions: "",
    sections: [
        {
            id: 101,
            title: "1.1 New Section",
            instructions: "",
            questions: [
                { id: 1001, label: "New Single Line Text Field", type: 'text', instructions: "Enter field instructions here..." },
            ]
        }
    ]
  },
];

const steps = ["Templates", "Essentials", "Builder", "Preview", "Finalize"];

export default function NewRequestPage() {
    const [currentStep, setCurrentStep] = useState(steps[0]);
    
    // State for the whole wizard
    const [requestTitle, setRequestTitle] = useState("New Request");
    const [requestDescription, setRequestDescription] = useState("Please provide all the necessary documents and information to get you set up in our system.");
    const [pages, setPages] = useState<Page[]>(initialPagesData);

    const currentStepIndex = steps.indexOf(currentStep);

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1]);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1]);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case "Templates": return <TemplatesStep onNext={nextStep} />;
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep pages={pages} setPages={setPages} />;
            case "Preview": return <PreviewStep title={requestTitle} description={requestDescription} pages={pages} />;
            case "Finalize": return <FinalizeStep />;
            default: return <div>Not Found</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center gap-4 p-4 border-b">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <StepNavigation currentStep={currentStep} onStepClick={setCurrentStep} />
                <div className="ml-auto flex items-center gap-2">
                    {currentStepIndex > 0 && currentStepIndex < steps.length - 1 && (
                        <Button onClick={nextStep}>
                            {steps[currentStepIndex + 1]} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className={cn("flex-grow", currentStep !== 'Builder' && "p-6 flex justify-center items-center")}>
                {renderStep()}
            </div>
        </div>
    );
}
