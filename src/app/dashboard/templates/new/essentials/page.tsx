
'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createMyTemplate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import EssentialsStep from "@/app/dashboard/requests/new/components/EssentialsStep";

export default function NewMyTemplateEssentialsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                status: 'draft',
                form_data: [], 
            });
            toast({ title: "Template draft created" });
            router.push(`/dashboard/templates/edit/${newTemplate.id}/builder`);
        } catch (error: any) {
            toast({ title: "Failed to create template", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                 <EssentialsStep 
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                />
            </div>
            <div className="flex-shrink-0 flex justify-end mt-6">
                 <Button onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Builder
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
