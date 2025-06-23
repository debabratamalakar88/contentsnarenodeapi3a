'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar as CalendarIcon,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Page, Question } from "../page"

interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const renderQuestionInput = (question: Question) => {
    switch(question.type) {
        case 'text':
            return <Input type="text" id={`preview-${question.id}`} placeholder={question.placeholder} />
        case 'textarea':
            return <Textarea id={`preview-${question.id}`} placeholder={question.placeholder} />
        case 'file':
            return <Input id={`preview-${question.id}`} type="file" />
        case 'checkbox':
            return (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id={`preview-${question.id}`} />
                    <label
                        htmlFor={`preview-${question.id}`}
                        className="text-sm font-medium leading-none"
                    >
                        {question.options?.[0] || 'Sample option'}
                    </label>
                </div>
            )
        case 'dropdown':
            return (
                <Select>
                    <SelectTrigger id={`preview-${question.id}`}>
                        <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                        {question.options?.map((opt, i) => <SelectItem key={i} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        case 'date':
            return (
                <div className="relative">
                    <Input type="date" id={`preview-${question.id}`} className="block w-full max-w-[240px]" />
                </div>
            )
        case 'email':
            return <Input type="email" id={`preview-${question.id}`} placeholder={question.placeholder || "email@example.com"} />
        case 'tel':
            return <Input type="tel" id={`preview-${question.id}`} placeholder={question.placeholder || "(123) 456-7890"} />
        case 'url':
            return <Input type="url" id={`preview-${question.id}`} placeholder={question.placeholder || "https://example.com"} />
        case 'radio':
            return (
                <RadioGroup>
                {question.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 pt-2">
                        <RadioGroupItem value={opt} id={`preview-${question.id}-${i}`} />
                        <label
                            htmlFor={`preview-${question.id}-${i}`}
                            className="text-sm font-medium leading-none"
                        >
                            {opt}
                        </label>
                    </div>
                ))}
                </RadioGroup>
            )
        default:
            return null
    }
}

export default function PreviewStep({ title, description, pages }: PreviewStepProps) {    
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in-50">
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {pages.map(page => (
                        <div key={page.id}>
                            <h3 className="text-xl font-semibold border-b pb-2 mb-4">{page.title}</h3>
                            <div className="space-y-6">
                                {page.questions.map(question => (
                                    <div key={question.id} className="grid gap-2">
                                        <Label htmlFor={`preview-${question.id}`}>{question.label}</Label>
                                        {renderQuestionInput(question)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
