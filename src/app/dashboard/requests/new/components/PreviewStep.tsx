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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Page, Question, Section } from "../page"

interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const renderQuestionInput = (question: Question) => {
    switch(question.type) {
        case 'text':
            return <Input type="text" id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />
        case 'textarea':
            return <Textarea id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />
        case 'file':
            return <Input id={`preview-${question.id}`} type="file" name={question.apiId} />
        case 'checkbox':
            // Assuming single checkbox for now as per current data structure
            return (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id={`preview-${question.id}`} name={question.apiId} value={question.options?.[0].value} />
                    <label
                        htmlFor={`preview-${question.id}`}
                        className="text-sm font-medium leading-none"
                    >
                        {question.options?.[0].label || 'Sample option'}
                    </label>
                </div>
            )
        case 'dropdown':
            return (
                <Select name={question.apiId}>
                    <SelectTrigger id={`preview-${question.id}`}>
                        <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                        {question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        case 'date':
            return (
                <div className="relative">
                    <Input type="date" id={`preview-${question.id}`} className="block w-full max-w-[240px]" name={question.apiId} defaultValue={question.defaultValue}/>
                </div>
            )
        case 'email':
            return <Input type="email" id={`preview-${question.id}`} placeholder={question.placeholder || "email@example.com"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'tel':
            return <Input type="tel" id={`preview-${question.id}`} placeholder={question.placeholder || "(123) 456-7890"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'url':
            return <Input type="url" id={`preview-${question.id}`} placeholder={question.placeholder || "https://example.com"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'radio':
            return (
                <RadioGroup name={question.apiId} defaultValue={question.defaultValue}>
                {question.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 pt-2">
                        <RadioGroupItem value={opt.value} id={`preview-${question.id}-${i}`} />
                        <label
                            htmlFor={`preview-${question.id}-${i}`}
                            className="text-sm font-medium leading-none"
                        >
                            {opt.label}
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
        <div className="max-w-3xl mx-auto animate-in fade-in-50 py-8 px-4">
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
                                {page.sections.map(section => (
                                    <div key={section.id}>
                                        <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                                        {section.questions.map(question => (
                                            <div key={question.id} className="grid gap-2 mb-4">
                                                <Label htmlFor={`preview-${question.id}`}>
                                                  {question.label}
                                                  {question.required && <span className="text-destructive"> *</span>}
                                                </Label>
                                                {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                {renderQuestionInput(question)}
                                            </div>
                                        ))}
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
