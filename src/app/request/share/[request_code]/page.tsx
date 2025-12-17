

'use client';

import React, { useEffect, useState, useMemo, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getSharedRequest, getSubmission, startSubmission, saveStep, submitRequest, type Request, type Question, type Page, type Section } from '@/lib/api';
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CalendarDays, CheckCircle, Info, MessageSquare, History } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const renderQuestionInput = (
    question: Question,
    value: any,
    onChange: (fieldName: string, value: any) => void,
    error?: string
) => {
    const questionId = `q-${question.id}`;
    const questionName = question.apiId || questionId;
    const inputClassName = error ? "border-destructive focus-visible:ring-destructive" : "bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring";

    switch(question.type) {
        case 'text':
            return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} minLength={question.minLength} maxLength={question.maxLength} />;
        case 'textarea':
            return <Textarea id={questionId} name={questionName} placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} minLength={question.minLength} maxLength={question.maxLength} />;
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
             return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={value || ''} onValueChange={(val) => onChange(questionName, val)} />;
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
            return <IconSelector name={questionName} defaultValue={value || ''} onValueChange={(val) => onChange(questionName, val)} />;
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
  activeIds: { pageId: number; sectionId: number; questionId: number };
  setActiveIds: (ids: { pageId: number; sectionId: number; questionId: number }) => void;
}

const PublicRequestSidebar = ({ request, pages, activeIds, setActiveIds }: PublicRequestSidebarProps) => {
    return (
        <aside className="w-[340px] flex-shrink-0 bg-white border-r flex flex-col h-screen overflow-y-auto">
            <div className="p-6 border-b">
                <h2 className="font-bold text-2xl leading-tight">{request.title}</h2>
                {request.due_date && (
                    <div className="text-sm font-medium text-muted-foreground mt-2 flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Due: {format(parseISO(request.due_date), 'dd/MM/yyyy')}
                    </div>
                )}
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                <Accordion type="multiple" defaultValue={pages.map(p => `page-${p.id}`)} className="w-full">
                    {pages.map((page, pageIndex) => (
                        <AccordionItem value={`page-${page.id}`} key={page.id} className="border-none">
                            <AccordionTrigger 
                                className={cn(
                                    "p-3 rounded-md font-semibold text-sm hover:no-underline",
                                    activeIds.pageId === page.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                                )}
                                onClick={() => setActiveIds({ pageId: page.id, sectionId: page.sections[0].id, questionId: page.sections[0].questions[0].id })}
                            >
                                <div className="flex items-center gap-2 flex-1 truncate">
                                    <span className="truncate">{page.title}</span>
                                    <span className="text-xs text-muted-foreground ml-auto shrink-0">0/{page.sections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pb-0">
                                {page.sections.map((section, sectionIndex) => (
                                    <div key={section.id} className="border-l my-1">
                                        <Accordion type="multiple" defaultValue={sectionIndex === 0 && pageIndex === 0 ? [`section-${section.id}`] : []} className="w-full">
                                            <AccordionItem value={`section-${section.id}`} className="border-none">
                                                <AccordionTrigger 
                                                    className={cn("p-2 rounded-md font-medium text-sm hover:no-underline", activeIds.sectionId === section.id && 'bg-primary/5')}
                                                    onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: section.questions[0].id })}
                                                >
                                                   <div className="flex items-center gap-2 flex-1 truncate">
                                                        <span className="truncate">{section.title}</span>
                                                        <span className="text-xs text-muted-foreground ml-auto shrink-0">0/{section.questions.length}</span>
                                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pl-4 border-l ml-4 pb-0">
                                                    {section.questions.map(question => (
                                                        <button 
                                                            key={question.id} 
                                                            onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: question.id })}
                                                            className={cn(
                                                                "w-full text-left py-1 text-sm text-muted-foreground truncate hover:text-primary",
                                                                activeIds.questionId === question.id && "text-primary font-semibold"
                                                            )}
                                                        >
                                                            {question.label}
                                                        </button>
                                                    ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </aside>
    );
}

export default function SharedRequestPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const requestCode = params.request_code as string;
    
    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeIds, setActiveIds] = useState<{ pageId: number, sectionId: number, questionId: number } | null>(null);
    const [submissionCode, setSubmissionCode] = useState<string | null>(null);
    const [allAnswers, setAllAnswers] = useState<any>({});
    const [isComplete, setIsComplete] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [clientId, setClientId] = useState<string | null>(null);

    useEffect(() => {
      const id = searchParams.get('client_id');
      if (id) {
        setClientId(id);
      }
    }, [searchParams]);
    
    useEffect(() => {
        if (!requestCode) return;
    
        const storageKey = `submission_code_${requestCode}`;
    
        async function fetchInitialData() {
            setIsLoading(true);
            try {
                const requestData = await getSharedRequest(requestCode);
                setRequest(requestData);
                
                if (requestData.form_data?.length > 0 && requestData.form_data[0].sections.length > 0 && requestData.form_data[0].sections[0].questions.length > 0) {
                    setActiveIds({
                        pageId: requestData.form_data[0].id,
                        sectionId: requestData.form_data[0].sections[0].id,
                        questionId: requestData.form_data[0].sections[0].questions[0].id
                    });
                }
    
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
                                if (pageData && Array.isArray(pageData.sections)) {
                                    pageData.sections.forEach((section: any) => {
                                        if (section && typeof section.questions === 'object') {
                                            Object.assign(acc, section.questions);
                                        }
                                    });
                                }
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
    }, [requestCode, toast, submissionCode]);
    
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
    
    const { activePage, activeSection, activeQuestion, activePageIndex } = useMemo(() => {
        if (!request || !activeIds) return { activePage: null, activeSection: null, activeQuestion: null, activePageIndex: -1 };
        const page = request.form_data.find(p => p.id === activeIds.pageId);
        if (!page) return { activePage: null, activeSection: null, activeQuestion: null, activePageIndex: -1 };
        const section = page.sections.find(s => s.id === activeIds.sectionId);
        if (!section) return { activePage: page, activeSection: null, activeQuestion: null, activePageIndex: -1 };
        const question = section.questions.find(q => q.id === activeIds.questionId);
        const pageIndex = request.form_data.findIndex(p => p.id === page.id);
        return { activePage: page, activeSection: section, activeQuestion: question || null, activePageIndex: pageIndex };
    }, [request, activeIds]);

    const isLastQuestion = useMemo(() => {
        if (!request || !activePage || !activeSection || !activeQuestion) return false;
        const lastPage = request.form_data[request.form_data.length - 1];
        if (activePage.id !== lastPage.id) return false;
        const lastSection = lastPage.sections[lastPage.sections.length - 1];
        if (activeSection.id !== lastSection.id) return false;
        const lastQuestion = lastSection.questions[lastSection.questions.length - 1];
        return activeQuestion.id === lastQuestion.id;
    }, [request, activePage, activeSection, activeQuestion]);
    
    const handleNextPrevPage = (direction: 'prev' | 'next') => {
        if (!request || !activePage) return;
        const newIndex = direction === 'next' ? activePageIndex + 1 : activePageIndex - 1;
        if (newIndex >= 0 && newIndex < request.form_data.length) {
            const newPage = request.form_data[newIndex];
            setActiveIds({ pageId: newPage.id, sectionId: newPage.sections[0].id, questionId: newPage.sections[0].questions[0].id });
        }
    }

    const constructFormData = () => {
        const formData = new FormData();
        Object.entries(allAnswers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item));
          } else if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        if (clientId) {
          formData.append('client_id', clientId);
        }
        return formData;
    };
    
    const validateCurrentQuestion = (): boolean => {
        if (!activeQuestion) return true;
        
        const fieldName = activeQuestion.apiId || `q-${activeQuestion.id}`;
        const value = allAnswers[fieldName];
        
        if (activeQuestion.required) {
            let isMissing = false;
            if (activeQuestion.type === 'checkbox') {
                if (!Array.isArray(value) || value.length === 0) isMissing = true;
            } else if (value === null || value === undefined || String(value).trim() === '') {
                isMissing = true;
            }

            if (isMissing) {
                setValidationErrors(prev => ({...prev, [fieldName]: "This field is required."}));
                return false;
            }
        }
        
        return true;
    };

    const handleContinue = async () => {
        if (!request || !activeIds || !validateCurrentQuestion()) return;

        await handleSaveStep();

        const { pageId, sectionId, questionId } = activeIds;
        const pageIndex = request.form_data.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;
        const currentPage = request.form_data[pageIndex];

        const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;
        const currentSection = currentPage.sections[sectionIndex];

        const questionIndex = currentSection.questions.findIndex(q => q.id === questionId);

        if (questionIndex < currentSection.questions.length - 1) {
            setActiveIds({ pageId, sectionId, questionId: currentSection.questions[questionIndex + 1].id });
        } else if (sectionIndex < currentPage.sections.length - 1) {
            const nextSection = currentPage.sections[sectionIndex + 1];
            setActiveIds({ pageId, sectionId: nextSection.id, questionId: nextSection.questions[0].id });
        } else if (pageIndex < request.form_data.length - 1) {
            const nextPage = request.form_data[pageIndex + 1];
            setActiveIds({ pageId: nextPage.id, sectionId: nextPage.sections[0].id, questionId: nextPage.sections[0].questions[0].id });
        }
    };
    
    const handleSaveStep = async () => {
        if (!activePage) return;
        const formData = constructFormData();
        setIsSubmitting(true);
        try {
            if (!submissionCode) {
                 const response = await startSubmission(requestCode, formData);
                 setSubmissionCode(response.submission_code);
                 localStorage.setItem(`submission_code_${requestCode}`, response.submission_code);
            } else {
                 await saveStep(submissionCode, activePageIndex + 1, formData);
            }
        } catch (err: any) {
            toast({ title: "Error Saving Draft", description: err.message || "Could not save your progress.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const validateFullForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        let isValid = true;
        let firstErrorIds: { pageId: number; sectionId: number; questionId: number } | null = null;
        
        request?.form_data.forEach(page => {
            page.sections.forEach(section => {
                section.questions.forEach(question => {
                    if (question.required && question.type !== 'button' && question.type !== 'formatted-text') {
                        const fieldName = question.apiId || `q-${question.id}`;
                        const value = allAnswers[fieldName];
                        let isMissing = false;
                        if (question.type === 'checkbox') {
                            if (!Array.isArray(value) || value.length === 0) isMissing = true;
                        } else if (value === null || value === undefined || String(value).trim() === '') {
                            isMissing = true;
                        }
                        
                        if (isMissing) {
                            isValid = false;
                            errors[fieldName] = "This field is required.";
                            if (!firstErrorIds) {
                                firstErrorIds = { pageId: page.id, sectionId: section.id, questionId: question.id };
                            }
                        }
                    }
                });
            });
        });

        setValidationErrors(errors);

        if (!isValid && firstErrorIds) {
            setActiveIds(firstErrorIds);
            toast({ title: "Missing Information", description: "Please fill out all required fields before submitting.", variant: "destructive"});
        }
        
        return isValid;
    }

    const handleSubmitForReview = async () => {
        if (!validateFullForm()) return;
        
        setIsSubmitting(true);
        const formData = constructFormData();
        
        try {
            let currentSubmissionCode = submissionCode;
            if (!currentSubmissionCode) {
                 const response = await startSubmission(requestCode, formData);
                 currentSubmissionCode = response.submission_code;
                 setSubmissionCode(currentSubmissionCode);
                 localStorage.setItem(`submission_code_${requestCode}`, currentSubmissionCode);
            }

            await saveStep(currentSubmissionCode, 'all', formData); // Save final state
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
    
    const handleAnotherSubmission = () => {
        setIsComplete(false);
        setAllAnswers({});
        setSubmissionCode(null);
        localStorage.removeItem(`submission_code_${requestCode}`);
        if(request && request.form_data.length > 0) {
           setActiveIds({ pageId: request.form_data[0].id, sectionId: request.form_data[0].sections[0].id, questionId: request.form_data[0].sections[0].questions[0].id });
        }
        setValidationErrors({});
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
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle>Submission Complete</CardTitle>
                    <CardDescription>Thank you! Your information has been successfully submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleAnotherSubmission}>Submit Another Response</Button>
                </CardContent>
            </Card>
        </div>
      )
    }

    if (!request || !request.form_data || request.form_data.length === 0 || !activeIds) {
        return <div className="p-6 text-center text-muted-foreground">Request data is not available.</div>;
    }
    
    return (
        <div className="min-h-screen bg-muted flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <PublicRequestSidebar request={request} pages={request.form_data} activeIds={activeIds} setActiveIds={setActiveIds} />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 border-b bg-background">
                         <Button variant="ghost" className="text-muted-foreground" onClick={() => handleNextPrevPage('prev')} disabled={activePageIndex === 0}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {activePageIndex > 0 ? request.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '') : 'Previous'}
                        </Button>
                         <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ArrowLeft /></Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><CheckCircle /></Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ArrowRight /></Button>
                         </div>
                        <Button variant="ghost" className="text-muted-foreground" onClick={() => handleNextPrevPage('next')} disabled={activePageIndex === request.form_data.length - 1}>
                            {activePageIndex === request.form_data.length - 1 ? "Final Page" : (request.form_data[activePageIndex + 1]?.title.replace(/^[0-9\.]+\s*/, '') || 'Next')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto p-8">
                            <form noValidate>
                                {activeQuestion ? (
                                    <>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold">{activeSection?.title.replace(/^[0-9\.]+\s*/, '')}</h2>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><History className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-200/80">
                                            <div className="grid gap-2">
                                                <h3 className="font-semibold text-lg">{activeQuestion.label}{activeQuestion.required && <span className="text-destructive ml-1">*</span>}</h3>
                                                {activeQuestion.instructions && <p className="text-muted-foreground text-sm">{activeQuestion.instructions}</p>}
                                                <div className="mt-4">
                                                    {renderQuestionInput(activeQuestion, allAnswers[activeQuestion.apiId || ''], handleAnswerChange, validationErrors[activeQuestion.apiId || ''])}
                                                     {validationErrors[activeQuestion.apiId || ''] && <p className="text-sm font-medium text-destructive mt-1">{validationErrors[activeQuestion.apiId || '']}</p>}
                                                </div>
                                            </div>
                                            <div className="mt-8 flex justify-between items-center">
                                                {isLastQuestion ? (
                                                     <Button type="button" size="lg" className="bg-pink-600 hover:bg-pink-700" onClick={handleSubmitForReview} disabled={isSubmitting}>
                                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        SUBMIT FOR REVIEW
                                                    </Button>
                                                ) : (
                                                    <Button type="button" size="lg" className="bg-pink-600 hover:bg-pink-700" onClick={handleContinue} disabled={isSubmitting}>
                                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        CONTINUE
                                                    </Button>
                                                )}
                                                <Button variant="outline" className="rounded-full" type="button">ASK A QUESTION</Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-muted-foreground py-10">Select a question to view it.</p>
                                )}
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
