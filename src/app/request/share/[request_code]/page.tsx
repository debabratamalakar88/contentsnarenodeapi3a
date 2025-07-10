

'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { getSharedRequest, type Request, type Question, type Page } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CalendarDays } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';


const renderQuestionInput = (question: Question) => {
    const questionId = `q-${question.id}`;
    const questionName = question.apiId || questionId;

    switch(question.type) {
        case 'text':
            return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'textarea':
            return <Textarea id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'file':
            return <Input id={questionId} name={questionName} type="file" required={question.required} />;
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`${questionId}-${i}`} name={`${questionName}[]`} value={opt.value} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </div>
            );
        case 'dropdown':
            return (
                <Select name={questionName} defaultValue={question.defaultValue} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date':
            return <Input id={questionId} name={questionName} type="date" defaultValue={question.defaultValue} required={question.required} className="max-w-[240px]" />;
        case 'email':
            return <Input id={questionId} name={questionName} type="email" placeholder={question.placeholder || "email@example.com"} defaultValue={question.defaultValue} required={question.required} />;
        case 'tel':
            return <Input id={questionId} name={questionName} type="tel" placeholder={question.placeholder || "(123) 456-7890"} defaultValue={question.defaultValue} required={question.required} />;
        case 'url':
            return <Input id={questionId} name={questionName} type="url" placeholder={question.placeholder || "https://example.com"} defaultValue={question.defaultValue} required={question.required} />;
        case 'radio':
            return (
                <RadioGroup name={questionName} defaultValue={question.defaultValue}>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2 pt-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case 'formatted-text':
             return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        case 'image-upload':
             return <Input id={questionId} name={questionName} type="file" accept="image/*" required={question.required} multiple />;
        case 'address':
             return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'number':
             return <Input id={questionId} name={questionName} type="number" placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'currency':
            return <Input id={questionId} name={questionName} type="text" placeholder="$0.00" defaultValue={question.defaultValue} required={question.required} />;
        case 'country':
            return (
                <Select name={questionName} defaultValue={question.defaultValue} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date-range':
             return (
                <div className="flex items-center gap-2">
                     <Input id={`${questionId}-start`} name={`${questionName}_start`} type="date" />
                     <span>to</span>
                     <Input id={`${questionId}-end`} name={`${questionName}_end`} type="date" />
                </div>
             );
        case 'icon-selector':
            return <IconSelector name={questionName} defaultValue={question.defaultValue} />;
        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-10 p-1" defaultValue={question.defaultValue || '#000000'} />
                    <Input type="text" name={questionName} placeholder="#000000" defaultValue={question.defaultValue || '#000000'} className="max-w-[150px]"/>
                </div>
            );
        case 'button':
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        default:
            return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
    }
}


export default function SharedRequestPage() {
    const params = useParams();
    const { toast } = useToast();
    
    const requestCode = params.request_code as string;
    
    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePageIndex, setActivePageIndex] = useState(0);

    useEffect(() => {
        if (!requestCode) return;
        
        async function fetchRequest() {
            try {
                const data = await getSharedRequest(requestCode);
                setRequest(data);
            } catch (err: any) {
                const message = err.message || 'Failed to load request. The link may be invalid or expired.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchRequest();
    }, [requestCode, toast]);

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        // This is a placeholder for actual submission logic.
        // The API for submitting responses is not defined in the provided documentation.
        // For now, we just show a success message after a delay.
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: 'Form Submitted',
            description: 'Your response has been recorded (simulation).'
        });
        
        setIsSubmitting(false);
    };

    const handleNextPage = () => {
        if (request && activePageIndex < request.form_data.length - 1) {
            setActivePageIndex(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (activePageIndex > 0) {
            setActivePageIndex(prev => prev - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-muted">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 text-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Request Not Found</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!request || !request.form_data || request.form_data.length === 0) {
        return <div className="p-6 text-center text-muted-foreground">Request data is not available.</div>;
    }
    
    const currentPage = request.form_data[activePageIndex];
    const isLastPage = activePageIndex === request.form_data.length - 1;

    return (
        <div className="min-h-screen bg-muted flex flex-col">
            <header className="w-full p-4 flex-shrink-0 bg-background border-b">
                <div className="max-w-7xl mx-auto flex justify-center items-center">
                    <Logo className="h-8 w-8 text-primary" />
                </div>
            </header>
            <form onSubmit={handleFormSubmit} className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-6">
                        {currentPage ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{currentPage.title}</CardTitle>
                                    {currentPage.instructions && <CardDescription>{currentPage.instructions}</CardDescription>}
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {currentPage.sections.map(section => (
                                        <div key={section.id}>
                                            <h4 className="text-lg font-semibold mb-6 border-b pb-2">{section.title}</h4>
                                            {section.instructions && <p className="text-sm text-muted-foreground mt-1 mb-4">{section.instructions}</p>}
                                            <div className="space-y-6">
                                                {section.questions.map(question => (
                                                    <div key={question.id} className="grid gap-2">
                                                        {question.type !== 'button' && question.type !== 'formatted-text' && <Label htmlFor={`q-${question.id}`}>{question.label}{question.required && <span className="text-destructive"> *</span>}</Label>}
                                                        {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                        {renderQuestionInput(question)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-6">
                                    <Button type="button" variant="outline" onClick={handlePrevPage} disabled={activePageIndex === 0 || isSubmitting}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                    </Button>
                                    {isLastPage ? (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit
                                        </Button>
                                    ) : (
                                        <Button type="button" onClick={handleNextPage} disabled={isSubmitting}>
                                            Next <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ) : (
                             <p className="text-muted-foreground text-center py-10">Select a page to view its content.</p>
                        )}
                    </div>
                </main>
            </form>
        </div>
    );
}
