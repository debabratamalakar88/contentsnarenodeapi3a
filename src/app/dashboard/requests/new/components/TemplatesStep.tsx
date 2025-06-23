'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button";

const templates = [
  {
    title: "Client Onboarding Questionnaire",
    category: "Onboarding",
  },
  {
    title: "Website Design Brief",
    category: "Web Design",
  },
  {
    title: "Marketing Campaign Details",
    category: "Marketing",
  },
];

interface TemplatesStepProps {
    onNext: () => void;
}

export default function TemplatesStep({ onNext }: TemplatesStepProps) {
    return (
        <div className="flex flex-col items-center gap-6 animate-in fade-in-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Start with a Template</h2>
                <p className="text-muted-foreground">Choose a pre-built template or start from a blank slate.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl">
                {templates.map((template) => (
                    <Card key={template.title} className="flex flex-col text-center hover:shadow-lg hover:border-primary cursor-pointer transition-all group" onClick={onNext}>
                        <CardHeader className="flex-grow">
                             <FileText className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <CardTitle className="text-base font-semibold leading-tight">{template.title}</CardTitle>
                             <CardDescription>{template.category}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full" onClick={(e) => { e.stopPropagation(); onNext(); }}>Select</Button>
                        </CardFooter>
                    </Card>
                ))}
                 <Card className="flex flex-col text-center hover:shadow-lg hover:border-primary cursor-pointer transition-all group justify-center items-center min-h-[280px]" onClick={onNext}>
                    <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    <CardTitle className="text-base font-semibold leading-tight mt-4">Start from scratch</CardTitle>
                    <CardDescription>Blank Template</CardDescription>
                </Card>
            </div>
        </div>
    )
}
