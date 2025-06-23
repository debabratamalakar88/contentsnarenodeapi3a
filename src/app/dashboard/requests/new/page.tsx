'use client'
import { useState } from "react";
import StepNavigation from './components/StepNavigation';
import TemplatesStep from './components/TemplatesStep';
import EssentialsStep from './components/EssentialsStep';
import BuilderStep from './components/BuilderStep';
import PreviewStep from './components/PreviewStep';
import FinalizeStep from './components/FinalizeStep';
import { Button } from "@/components/ui/button";

// Type definitions for the entire wizard
export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio';
export interface Question {
  id: number;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
}
export interface Page {
  id: number;
  title: string;
  questions: Question[];
}

const initialPagesData: Page[] = [
  {
    id: 1,
    title: "Page 1: Company Information",
    questions: [
      { id: 1, label: "Company Name", type: 'text', placeholder: "e.g. Acme Inc." },
      { id: 2, label: "Business Address", type: 'textarea', placeholder: "Enter your full business address" },
    ],
  },
  {
    id: 2,
    title: "Page 2: Document Uploads",
    questions: [
      { id: 3, label: "Business License", type: 'file' },
      { id: 4, label: "Services Needed", type: 'radio', options: ["Web Design", "SEO", "Marketing"] }
    ],
  },
];

const steps = ["Templates", "Essentials", "Builder", "Preview", "Finalize"];

export default function NewRequestPage() {
    const [currentStep, setCurrentStep] = useState(steps[0]);
    
    // State for the whole wizard
    const [requestTitle, setRequestTitle] = useState("New Client Onboarding Materials");
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
            case "Templates": return <TemplatesStep />;
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep pages={pages} setPages={setPages} />;
            case "Preview": return <PreviewStep title={requestTitle} description={requestDescription} pages={pages} />;
            case "Finalize": return <FinalizeStep />;
            default: return <div>Not Found</div>;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <StepNavigation currentStep={currentStep} onStepClick={setCurrentStep} />
            
            <div className="flex-grow min-h-[50vh]">
                {renderStep()}
            </div>

            <div className="flex justify-between items-center p-4 -mx-4 -mb-4 lg:-mx-6 lg:-mb-6 border-t bg-card sticky bottom-0 z-10">
                 <div>
                    {currentStep === 'Finalize' && <Button variant="outline">Save as Draft</Button>}
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>
                        Previous
                    </Button>
                    {currentStepIndex < steps.length - 1 ? (
                        <Button onClick={nextStep}>
                            Next
                        </Button>
                    ) : (
                        <Button>Publish Request</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
