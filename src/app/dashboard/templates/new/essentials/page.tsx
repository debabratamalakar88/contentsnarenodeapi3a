
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createMyTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import EssentialsStep from "@/app/dashboard/requests/new/components/EssentialsStep";
import StepNavigation from "../components/StepNavigation";
import Link from "next/link";
import type { Page } from "@/lib/api";

const steps = [
    { name: "Essentials", slug: "essentials" },
    { name: "Builder", slug: "builder" },
    { name: "Preview", slug: "preview" }
];

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
                { 
                    id: 1001, 
                    label: "Single Line Text", 
                    type: 'text', 
                    instructions: "", 
                    placeholder: "", 
                    options: undefined, 
                    required: false,
                    apiId: "new_single_line_text_field" 
                },
            ]
        }
    ]
  },
];

export default function NewMyTemplateEssentialsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentStepSlug = 'essentials';
    const currentStepIndex = 0;

    const handleNext = async () => {
        if (!title.trim()) {
            toast({ title: "Title is required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication error", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            const newTemplate = await createMyTemplate(token, {
                title,
                description,
                icon,
                status: 'draft',
                form_data: initialPagesData, 
            });
            toast({ title: "Template draft created" });
            router.push(`/dashboard/templates/edit/${newTemplate.id}/builder`);
        } catch (error: any) {
            toast({ title: "Failed to create template", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
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
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Builder
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 h-full flex flex-col items-center justify-center">
                    <EssentialsStep 
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        icon={icon}
                        setIcon={setIcon}
                        categories={[]} 
                    />
                </div>
            </main>
        </div>
    );
}
