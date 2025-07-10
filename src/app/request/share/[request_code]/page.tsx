

'use client';

import React, { useEffect, useState, type FormEvent, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
    getSharedRequest, 
    startRequestSubmission, 
    saveSubmissionStep, 
    finalizeSubmission,
    getSubmissionData,
    type Request, 
    type Question, 
    type Page 
} from '@/lib/api';
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
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CalendarDays, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile, Link2Off, Code, Link as LucideLink, CheckCircle } from 'lucide-react';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const RichTextEditorPreview = ({ question, value, onChange }: { question: Question, value: string, onChange: (value: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    const [viewMode, setViewMode] = useState<'editor' | 'html'>('editor');
    
    const updateToolbarState = useCallback(() => {
        if (editorRef.current) {
            setIsBold(document.queryCommandState('bold'));
            setIsItalic(document.queryCommandState('italic'));
            setIsUnderline(document.queryCommandState('underline'));
        }
    }, []);

    const updateWordCount = useCallback((content: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.innerText || "";
        const words = textContent.trim().split(/\s+/).filter(Boolean);
        setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
    }, []);

    useEffect(() => {
        updateWordCount(value);
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value, updateWordCount]);
    
    const execCmd = (command: string, val?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, val);
            onChange(editorRef.current.innerHTML);
            updateToolbarState();
        }
    };
    
    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }

    const isPlaceholderVisible = viewMode === 'editor' && !value.replace(/<p><br><\/p>/g, '').trim();

    return (
      <div className="rounded-md border border-input bg-background">
        <div className="p-2 border-b flex items-center gap-1 text-muted-foreground flex-wrap">
          <Button variant={isBold ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); execCmd('bold')}}><Bold className="h-4 w-4" /></Button>
          <Button variant={isItalic ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); execCmd('italic')}}><Italic className="h-4 w-4" /></Button>
          <Button variant={isUnderline ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => {e.preventDefault(); execCmd('underline')}}><Underline className="h-4 w-4" /></Button>
        </div>
        
        <div className="relative">
            {isPlaceholderVisible && (
                <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">Enter text here...</div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="prose-preview min-h-[200px] w-full resize-y overflow-auto p-3 ring-offset-background focus-visible:outline-none"
              onInput={handleInput}
              onFocus={updateToolbarState}
            />
        </div>
        <div className="p-2 border-t text-xs text-muted-foreground flex justify-end items-center"><span>Words: {wordCount}</span></div>
      </div>
    );
};

const DateRangePicker = ({ question, value, onChange }: { question: Question, value: {start?: string, end?: string}, onChange: (value: {start?: string, end?: string}) => void }) => {
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        const currentEndDate = value.end;
        const newEnd = (currentEndDate && newStartDate > currentEndDate) ? '' : currentEndDate;
        onChange({ start: newStartDate, end: newEnd });
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, end: e.target.value });
    };

    return (
        <div className="flex items-center gap-2">
            <Input type="date" value={value.start || ''} onChange={handleStartDateChange} />
            <span>to</span>
            <Input type="date" value={value.end || ''} onChange={handleEndDateChange} min={value.start} disabled={!value.start} />
        </div>
    );
};

const CurrencyInput = ({ question, value, onChange }: { question: Question, value: {currency?: string, amount?: string}, onChange: (value: {currency?:string, amount?: string}) => void }) => {
    const defaultCountry = countries.find(c => c.code === 'US');
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(value.currency || defaultCountry?.code || 'US');
    const selectedCountry = countries.find(c => c.code === selectedCountryCode);

    const handleCurrencyChange = (code: string) => {
        setSelectedCountryCode(code);
        onChange({ ...value, currency: code });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, amount: e.target.value });
    };

    return (
        <div className="flex items-center gap-0 max-w-xs">
            <Select onValueChange={handleCurrencyChange} value={selectedCountryCode}>
                <SelectTrigger className="w-[90px] rounded-r-none border-r-0">
                    <SelectValue>
                        {selectedCountry ? <div className="flex items-center gap-2 truncate"><span className="text-lg">{selectedCountry.flag}</span> <span className="text-xs text-muted-foreground">{selectedCountry.currency}</span></div> : '...'}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    {countries.filter(c => c.currency && c.symbol).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{country.flag}</span>
                                <span className="font-medium">{country.name}</span>
                                <span className="text-muted-foreground ml-auto">{country.currency} ({country.symbol})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{selectedCountry?.symbol}</span>
                <Input type="number" placeholder="100.00" value={value.amount || ''} onChange={handleAmountChange} className="pl-8 rounded-l-none" />
            </div>
        </div>
    );
};

const renderQuestionInput = (question: Question, value: any, onChange: (value: any) => void) => {
    const questionId = `q-${question.id}`;
    
    switch (question.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'number':
            return <Input id={questionId} type={question.type} placeholder={question.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} required={question.required} />;
        case 'textarea':
            return <Textarea id={questionId} placeholder={question.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} required={question.required} />;
        case 'file':
            return <Input id={questionId} type="file" required={question.required} />; // File inputs are uncontrolled
        case 'image-upload':
            return <Input id={questionId} type="file" accept="image/*" required={question.required} multiple />; // File inputs are uncontrolled
        case 'checkbox':
            const onCheckboxChange = (checked: boolean, optionValue: string) => {
                const currentValues = Array.isArray(value) ? value : [];
                if (checked) {
                    onChange([...currentValues, optionValue]);
                } else {
                    onChange(currentValues.filter(v => v !== optionValue));
                }
            };
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`${questionId}-${i}`} checked={Array.isArray(value) && value.includes(opt.value)} onCheckedChange={(checked) => onCheckboxChange(!!checked, opt.value)} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </div>
            );
        case 'dropdown':
            return (
                <Select onValueChange={onChange} value={value || ''} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date':
            return <Input id={questionId} type="date" value={value || ''} onChange={e => onChange(e.target.value)} required={question.required} className="max-w-[240px]" />;
        case 'radio':
            return (
                <RadioGroup onValueChange={onChange} value={value || ''}>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2 pt-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case 'formatted-text':
             return <RichTextEditorPreview question={question} value={value || ''} onChange={onChange}/>;
        case 'address':
             return <AddressAutocompleteInput id={questionId} placeholder={question.placeholder} defaultValue={value || ''} />; // This component manages its own state for now
        case 'currency':
             return <CurrencyInput question={question} value={value || {}} onChange={onChange} />;
        case 'country':
            return (
                <Select onValueChange={onChange} value={value || ''} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date-range':
             return <DateRangePicker question={question} value={value || {}} onChange={onChange} />;
        case 'icon-selector':
            return <IconSelector defaultValue={value || ''} />;
        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-10 p-1" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
                    <Input type="text" placeholder="#000000" value={value || '#000000'} readOnly className="max-w-[150px]"/>
                </div>
            );
        case 'button':
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        default:
            return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
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
    const [submissionCode, setSubmissionCode] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isComplete, setIsComplete] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    // Effect to start/resume submission
    useEffect(() => {
        if (!requestCode) {
            setError('Request code is missing.');
            setIsLoading(false);
            return;
        }

        const lsKey = `submission_code_${requestCode}`;

        async function initializeSubmission() {
            try {
                // 1. Fetch the main request details
                const data = await getSharedRequest(requestCode);
                setRequest(data);
                if (!data.form_data || data.form_data.length === 0) {
                    setError('This request has no form content.');
                    return;
                }

                // 2. Check for existing submission code in local storage
                let sCode = localStorage.getItem(lsKey);
                
                if (sCode) {
                    // 3a. If code exists, fetch previous answers
                    const submissionData = await getSubmissionData(sCode);
                    if (submissionData.status === 'completed') {
                        setIsComplete(true);
                    } else {
                        setFormValues(submissionData.form_data);
                    }
                } else {
                    // 3b. If no code, start a new submission
                    const { submission_code } = await startRequestSubmission(requestCode);
                    sCode = submission_code;
                    localStorage.setItem(lsKey, sCode);
                }
                setSubmissionCode(sCode);
            } catch (err: any) {
                const message = err.message || 'Failed to load request. The link may be invalid or expired.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
                localStorage.removeItem(lsKey); // Clear invalid code
            } finally {
                setIsLoading(false);
            }
        }
        
        initializeSubmission();
    }, [requestCode, toast]);

    const handleFormValueChange = (apiId: string, value: any) => {
        setFormValues(prev => ({ ...prev, [apiId]: value }));
    };

    const saveCurrentStep = useCallback(async () => {
        if (!submissionCode || !request || !formRef.current) return;
        
        const currentPageData: Record<string, any> = {};
        const formData = new FormData(formRef.current);
        
        request.form_data[activePageIndex]?.sections.forEach(section => {
            section.questions.forEach(q => {
                if (q.apiId) {
                    const value = formData.get(q.apiId);
                    if (value !== null) {
                        currentPageData[q.apiId] = value;
                    } else {
                         // For complex fields like checkbox group
                        const values = formData.getAll(q.apiId + '[]');
                        if(values.length > 0) {
                             currentPageData[q.apiId] = values;
                        }
                    }
                }
            });
        });
        
        try {
            await saveSubmissionStep(submissionCode, activePageIndex, currentPageData);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Could not save progress', description: err.message });
        }
    }, [submissionCode, request, activePageIndex, toast]);

    const handleNextPage = async () => {
        await saveCurrentStep();
        if (request && activePageIndex < request.form_data.length - 1) {
            setActivePageIndex(prev => prev + 1);
        }
    };

    const handlePrevPage = async () => {
        await saveCurrentStep();
        if (activePageIndex > 0) {
            setActivePageIndex(prev => prev - 1);
        }
    };
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        await saveCurrentStep();

        if (!submissionCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Submission identifier is missing.' });
            setIsSubmitting(false);
            return;
        }

        try {
            await finalizeSubmission(submissionCode);
            localStorage.removeItem(`submission_code_${requestCode}`);
            setIsComplete(true);
        } catch (err: any) {
             toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) { return <div className="flex min-h-screen w-full items-center justify-center bg-muted"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div> }
    if (error) { return <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 text-center"><Card className="w-full max-w-md"><CardHeader><CardTitle className="text-destructive">Request Not Found</CardTitle><CardDescription>{error}</CardDescription></CardHeader></Card></div> }
    if (isComplete) { return <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 text-center"><Card className="w-full max-w-md"><CardHeader className="items-center"><CheckCircle className="h-12 w-12 text-green-500 mb-4" /><CardTitle>Submission Complete</CardTitle><CardDescription>Thank you! Your response has been submitted successfully.</CardDescription></CardHeader></Card></div> }
    if (!request || !request.form_data || request.form_data.length === 0) { return <div className="p-6 text-center text-muted-foreground">Request data is not available.</div> }
    
    const currentPage = request.form_data[activePageIndex];
    const isLastPage = activePageIndex === request.form_data.length - 1;

    return (
        <div className="min-h-screen bg-muted flex flex-col">
            <header className="w-full p-4 flex-shrink-0 bg-background border-b">
                <div className="max-w-7xl mx-auto flex justify-center items-center">
                    <Logo className="h-8 w-8 text-primary" />
                </div>
            </header>
             <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
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
                                            <h4 className="text-lg font-semibold mb-4 border-b pb-2">{section.title}</h4>
                                            {section.instructions && <p className="text-sm text-muted-foreground mt-1 mb-4">{section.instructions}</p>}
                                            <div className="space-y-6">
                                                {section.questions.map(question => (
                                                    <div key={question.id} className="grid gap-2">
                                                        {question.type !== 'button' && question.type !== 'formatted-text' && <Label htmlFor={`q-${question.id}`}>{question.label}{question.required && <span className="text-destructive"> *</span>}</Label>}
                                                        {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                        {renderQuestionInput(question, formValues[question.apiId!], (value) => handleFormValueChange(question.apiId!, value))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-6">
                                    <Button type="button" variant="outline" onClick={handlePrevPage} disabled={activePageIndex === 0 || isSubmitting}>Previous</Button>
                                    {isLastPage ? (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit
                                        </Button>
                                    ) : (
                                        <Button type="button" onClick={handleNextPage} disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Next
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
