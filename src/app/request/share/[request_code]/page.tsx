

'use client';

import React, { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSharedRequest, getSubmission, startSubmission, saveStep, submitRequest, type Request, type Question, type Page } from '@/lib/api';
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CalendarDays, CheckCircle2 } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';


const renderQuestionInput = (
    question: Question,
    value: any,
    onChange: (fieldName: string, value: any) => void,
    error?: string
) => {
    const questionId = `q-${question.id}`;
    const questionName = question.apiId || questionId;
    const inputClassName = error ? "border-destructive focus-visible:ring-destructive" : "";

    switch(question.type) {
        case 'text':
            return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'textarea':
            return <Textarea id={questionId} name={questionName} placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'file':
            return <Input id={questionId} name={`${questionName}[]`} type="file" required={question.required} className={inputClassName} multiple />;
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`${questionId}-${i}`} 
                                name={`${questionName}[]`} 
                                value={opt.value} 
                                checked={Array.isArray(value) && value.includes(opt.value)}
                                onCheckedChange={(checked) => {
                                    const currentValues = Array.isArray(value) ? [...value] : [];
                                    const newValues = checked 
                                        ? [...currentValues, opt.value] 
                                        : currentValues.filter(v => v !== opt.value);
                                    onChange(questionName, newValues);
                                }}
                            />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                </div>
            );
        case 'dropdown':
            return (
                <Select name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)} required={question.required}>
                    <SelectTrigger id={questionId} className={inputClassName}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date':
            return <Input id={questionId} name={questionName} type="date" value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={cn("max-w-[240px]", inputClassName)} />;
        case 'email':
            return <Input id={questionId} name={questionName} type="email" placeholder={question.placeholder || "email@example.com"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'tel':
            return <Input id={questionId} name={questionName} type="tel" placeholder={question.placeholder || "(123) 456-7890"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'url':
            return <Input id={questionId} name={questionName} type="url" placeholder={question.placeholder || "https://example.com"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'radio':
            return (
                <RadioGroup name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)}>
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
             return <Input id={questionId} name={`${questionName}[]`} type="file" accept="image/*" required={question.required} multiple className={inputClassName} />;
        case 'address':
             return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={value} onValueChange={(val) => onChange(questionName, val)} />;
        case 'number':
             return <Input id={questionId} name={questionName} type="number" placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'currency':
             return <Input id={questionId} name={questionName} type="text" placeholder="$0.00" value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'country':
            return (
                <Select name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)} required={question.required}>
                    <SelectTrigger id={questionId} className={inputClassName}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date-range':
             return (
                <div className="flex items-center gap-2">
                     <Input id={`${questionId}-start`} name={`${questionName}_start`} type="date" value={value?.start || ''} onChange={e => onChange(questionName, {...(value || {}), start: e.target.value})} className={inputClassName} />
                     <span>to</span>
                     <Input id={`${questionId}-end`} name={`${questionName}_end`} type="date" value={value?.end || ''} onChange={e => onChange(questionName, {...(value || {}), end: e.target.value})} className={inputClassName} />
                </div>
             );
        case 'icon-selector':
            return <IconSelector name={questionName} defaultValue={value} onValueChange={(val) => onChange(questionName, val)} />;
        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-10 p-1" value={value || '#000000'} onChange={e => onChange(questionName, e.target.value)} />
                    <Input type="text" name={questionName} placeholder="#000000" value={value || '#000000'} readOnly className="max-w-[150px]"/>
                </div>
            );
        case 'button':
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        default:
            return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
    }
}

interface PublicRequestSidebarProps {
  request: Request;
  pages: Page[];
  activePageIndex: number;
  setActivePageIndex: (id: number) => void;
}

const PublicRequestSidebar = ({ request, pages, activePageIndex, setActivePageIndex }: PublicRequestSidebarProps) => {
    return (
        <aside className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
            <div className="flex-shrink-0">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg leading-tight">{request.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{request.description}</p>
                    {request.due_date && (
                        <div className="text-xs font-medium text-muted-foreground mt-3 flex items-center">
                            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                            Due: {format(parseISO(request.due_date), 'PPP')}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                <h3 className="font-semibold text-xs px-2 mb-1 uppercase text-muted-foreground">Pages</h3>
                {pages.map((page, index) => (
                    <button
                        key={page.id}
                        onClick={() => setActivePageIndex(index)}
                        className={cn("w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-semibold", activePageIndex === index ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent/50")}
                    >
                        <span className="truncate">{page.title}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}

export default function SharedRequestPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const requestCode = params.request_code as string;
    
    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [submissionCode, setSubmissionCode] = useState<string | null>(null);
    const [allAnswers, setAllAnswers] = useState<any>({});
    const [isComplete, setIsComplete] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    
    const formRef = React.useRef<HTMLFormElement>(null);
    
    useEffect(() => {
        if (!requestCode) return;
    
        const storageKey = `submission_code_${requestCode}`;
    
        async function fetchInitialData() {
            setIsLoading(true);
            try {
                const requestData = await getSharedRequest(requestCode);
                setRequest(requestData);
    
                const storedSubmissionCode = localStorage.getItem(storageKey);
                if (storedSubmissionCode) {
                    setSubmissionCode(storedSubmissionCode);
                    const submissionData = await getSubmission(storedSubmissionCode);
                    
                    if (submissionData.status === 'completed') {
                        setIsComplete(true);
                    } else if (submissionData.form_data) {
                        let parsedData = {};
                        try {
                            if (typeof submissionData.form_data === 'string') {
                                parsedData = JSON.parse(submissionData.form_data);
                            } else {
                                parsedData = submissionData.form_data;
                            }
    
                            const flattenedData = Object.values(parsedData).reduce((acc: any, pageData: any) => {
                                pageData.sections.forEach((section: any) => {
                                    Object.assign(acc, section.questions);
                                });
                                return acc;
                            }, {});
                            setAllAnswers(flattenedData || {});
                        } catch (e) {
                            console.error("Could not parse saved form data", e);
                        }
                    }
                }
            } catch (err: any) {
                if (err?.status === 404 && submissionCode) {
                    // Submission was not found on backend, clear local state
                    localStorage.removeItem(storageKey);
                    setSubmissionCode(null);
                    setAllAnswers({});
                    console.warn("Submission code not found on server, starting fresh.");
                } else {
                    const message = err.message || 'Failed to load request. The link may be invalid or expired.';
                    setError(message);
                    toast({ variant: 'destructive', title: 'Error', description: message });
                }
            } finally {
                setIsLoading(false);
            }
        }
    
        fetchInitialData();
    }, [requestCode, toast]);
    
    const handleAnswerChange = (fieldName: string, value: any) => {
        setAllAnswers((prev: any) => ({
            ...prev,
            [fieldName]: value
        }));
         if (validationErrors[fieldName]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };
    
    const validatePage = (page: Page): boolean => {
        const errors: { [key: string]: string } = {};
        let isValid = true;
    
        page.sections.forEach(section => {
            section.questions.forEach(question => {
                if (question.type === 'button' || question.type === 'formatted-text') return;
                
                const fieldName = question.apiId || `q-${question.id}`;
                const formElement = formRef.current?.elements.namedItem(fieldName) as (HTMLInputElement | RadioNodeList | null);
                
                let value = allAnswers[fieldName];

                if (question.type === 'file' || question.type === 'image-upload') {
                    const fileInput = formElement as HTMLInputElement;
                    if (question.required && (!fileInput || fileInput.files?.length === 0)) {
                        isValid = false;
                        errors[fieldName] = "This field is required.";
                        return;
                    }
                } else {
                    if (question.required) {
                        let isMissing = false;
                        if (question.type === 'checkbox') {
                            if (!value || !Array.isArray(value) || value.length === 0) isMissing = true;
                        } else if (value === null || value === undefined || String(value).trim() === '') {
                            isMissing = true;
                        }

                        if (isMissing) {
                            isValid = false;
                            errors[fieldName] = "This field is required.";
                            return; // continue to next question
                        }
                    }
                }
    
                if (value && String(value).trim() !== '') {
                    if (question.type === 'email' && !/\S+@\S+\.\S+/.test(String(value))) {
                        isValid = false;
                        errors[fieldName] = "Please enter a valid email address.";
                    }
                    if (question.type === 'url' && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(String(value))) {
                        isValid = false;
                        errors[fieldName] = "Please enter a valid URL.";
                    }
                    if (question.type === 'tel' && !/^\+?[0-9\s-()]+$/.test(String(value))) {
                         isValid = false;
                         errors[fieldName] = "Please enter a valid phone number.";
                    }
                }
            });
        });
    
        setValidationErrors(errors);
        if (!isValid) {
            toast({
                title: "Validation Error",
                description: "Please fill out all required fields correctly.",
                variant: "destructive",
            });
        }
        return isValid;
    };

    const getFormDataForSubmission = () => {
        if (!formRef.current) return new FormData();
        return new FormData(formRef.current);
    }
    
    const handleStepChange = async (newIndex: number) => {
        const currentPage = request?.form_data[activePageIndex];
        if (!currentPage || !validatePage(currentPage)) return;

        const formData = getFormDataForSubmission();
        setIsSubmitting(true);

        try {
            if (!submissionCode) {
                 const response = await startSubmission(requestCode, formData);
                 setSubmissionCode(response.submission_code);
                 localStorage.setItem(`submission_code_${requestCode}`, response.submission_code);
                 toast({ title: `Page ${activePageIndex + 1} Saved`, description: response.message });
            } else {
                 await saveStep(submissionCode, activePageIndex + 1, formData);
                 toast({ title: `Page ${activePageIndex + 1} Saved`, description: `Progress for page ${activePageIndex + 1} has been updated.` });
            }
             setValidationErrors({});
             setActivePageIndex(newIndex);
        } catch(err: any) {
            toast({ title: "Error Saving Progress", description: err.message || "Could not save your data.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const currentPage = request?.form_data[activePageIndex];
        if (!currentPage || !validatePage(currentPage)) return;

        setIsSubmitting(true);
        const formData = getFormDataForSubmission();
        
        try {
            let currentSubmissionCode = submissionCode;
            if (!currentSubmissionCode) {
                 const response = await startSubmission(requestCode, formData);
                 currentSubmissionCode = response.submission_code;
                 setSubmissionCode(currentSubmissionCode);
                 localStorage.setItem(`submission_code_${requestCode}`, currentSubmissionCode);
            } else {
                await saveStep(currentSubmissionCode, activePageIndex + 1, formData);
            }

            await submitRequest(currentSubmissionCode, formData);
            toast({ title: "Success", description: "Your submission has been completed." });
            setIsComplete(true);
            localStorage.removeItem(`submission_code_${requestCode}`);

        } catch(err: any) {
            toast({ title: "Submission Error", description: err.message || "An unknown error occurred.", variant: "destructive"});
        } finally {
            setIsSubmitting(false);
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
    
    if (isComplete) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 text-center">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle>Submission Complete</CardTitle>
                    <CardDescription>Thank you! Your information has been successfully submitted.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      )
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
            <div className="flex flex-1 overflow-hidden">
                <PublicRequestSidebar request={request} pages={request.form_data} activePageIndex={activePageIndex} setActivePageIndex={setActivePageIndex} />
                <main className="flex-1 overflow-y-auto">
                    <form ref={formRef} onSubmit={handleFormSubmit} noValidate encType="multipart/form-data">
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
                                                <h4 className="text-lg font-semibold border-b pb-2 mb-6">{section.title}</h4>
                                                <div className="space-y-6">
                                                    {section.questions.map(question => {
                                                        const fieldName = question.apiId || `q-${question.id}`;
                                                        const fieldError = validationErrors[fieldName];
                                                        const value = allAnswers[fieldName];
                                                        
                                                        return (
                                                            <div key={question.id} className="grid gap-2">
                                                                {question.type !== 'button' && question.type !== 'formatted-text' && <Label htmlFor={`q-${question.id}`}>{question.label}{question.required && <span className="text-destructive"> *</span>}</Label>}
                                                                {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                                {renderQuestionInput(question, value, handleAnswerChange, fieldError)}
                                                                {fieldError && <p className="text-sm font-medium text-destructive">{fieldError}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-6">
                                        <Button type="button" variant="outline" onClick={() => handleStepChange(activePageIndex - 1)} disabled={activePageIndex === 0 || isSubmitting}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                        </Button>
                                        {isLastPage ? (
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Submit
                                            </Button>
                                        ) : (
                                            <Button type="button" onClick={() => handleStepChange(activePageIndex + 1)} disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ) : (
                                 <p className="text-muted-foreground text-center py-10">Select a page to view its content.</p>
                            )}
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

