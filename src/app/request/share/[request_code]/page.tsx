
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { getSharedRequest, type Request, type Question } from '@/lib/api';
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';

const renderQuestionInput = (question: Question) => {
    const questionId = `q-${question.id}`;
    const questionName = question.apiId || `q-${question.id}`;

    switch (question.type) {
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
            return <Input id={questionId} name={questionName} type="date" defaultValue={question.defaultValue} required={question.required} />;
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
            return <div className="prose-preview p-2 border rounded-md" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        case 'button':
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        case 'image-upload':
            return <Input id={questionId} name={questionName} type="file" accept="image/*" required={question.required} multiple />;
        case 'address':
            return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'number':
            return <Input id={questionId} name={questionName} type="number" placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'currency':
            return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder || "0.00"} defaultValue={question.defaultValue} required={question.required} />;
        case 'country':
            return (
                <Select name={questionName} defaultValue={question.defaultValue} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent className="max-h-72">{countries.map((country) => (<SelectItem key={country.code} value={country.code}><div className="flex items-center gap-2"><span>{country.flag}</span><span>{country.name}</span></div></SelectItem>))}</SelectContent>
                </Select>
            );
        case 'date-range':
            return (
                <div className="flex items-center gap-2">
                    <Input type="date" name={`${questionName}_start`} />
                    <span>to</span>
                    <Input type="date" name={`${questionName}_end`} />
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
        default:
            return <p className="text-sm text-red-500">Unsupported field type: {question.type}</p>;
    }
};

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
        if (!requestCode) {
            setError('Request code is missing.');
            setIsLoading(false);
            return;
        };
        
        async function fetchRequest() {
            try {
                const data = await getSharedRequest(requestCode);
                setRequest(data);
                if (!data.form_data || data.form_data.length === 0) {
                    setError('This request has no form content.');
                }
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
        // NOTE: The API endpoint for submitting a shared request is not defined in the documentation.
        // This is a placeholder for the submission logic.
        toast({ title: 'Form Submitted', description: 'Your response has been recorded.' });
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-full mt-2" /><Skeleton className="h-4 w-2/3 mt-1" /></CardHeader>
                    <CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
                </Card>
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
        <div className="min-h-screen bg-muted flex flex-col items-center p-4 sm:p-8">
            <header className="w-full max-w-2xl mb-8 flex justify-between items-center">
                <Logo className="h-8 w-8 text-primary" />
            </header>
            <main className="w-full max-w-2xl">
                <form onSubmit={handleFormSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{request.title}</CardTitle>
                            <CardDescription>{request.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold border-b pb-2 mb-4">{currentPage.title}</h3>
                                {currentPage.instructions && <p className="text-sm text-muted-foreground mb-6">{currentPage.instructions}</p>}
                                <div className="space-y-6">
                                    {currentPage.sections.map(section => (
                                        <div key={section.id}>
                                            <h4 className="text-lg font-semibold">{section.title}</h4>
                                            {section.instructions && <p className="text-sm text-muted-foreground mt-1 mb-4">{section.instructions}</p>}
                                            {section.questions.map(question => (
                                                <div key={question.id} className="grid gap-2 mb-4">
                                                    {question.type !== 'button' && question.type !== 'formatted-text' && (
                                                        <Label htmlFor={`q-${question.id}`}>
                                                            {question.label}
                                                            {question.required && <span className="text-destructive"> *</span>}
                                                        </Label>
                                                    )}
                                                    {question.instructions && <p className="text-xs text-muted-foreground">{question.instructions}</p>}
                                                    {renderQuestionInput(question)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-6">
                            <Button type="button" variant="outline" onClick={handlePrevPage} disabled={activePageIndex === 0}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            {isLastPage ? (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleNextPage}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
}
