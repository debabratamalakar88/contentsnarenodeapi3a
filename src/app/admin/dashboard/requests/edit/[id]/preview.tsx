
'use client';

import React, { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { CalendarDays, MessageSquare, History, Info, Badge, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Request, Client, Page, Section, Question } from '@/lib/api';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

const renderQuestionPreview = (question: Question) => {
    const questionId = `preview-${question.id}`;
    
    switch (question.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'number':
        case 'date':
        case 'currency':
             return <Input id={questionId} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'textarea':
             return <Textarea id={questionId} placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'radio':
            return (
                <RadioGroup defaultValue={question.defaultValue} disabled>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`preview-${question.id}-${i}`} value={opt.value} disabled />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </div>
            )
        case 'dropdown':
            return (
                <Select defaultValue={question.defaultValue} disabled>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )
        case 'formatted-text':
            return <div className="prose prose-sm max-w-none p-2 border rounded-md min-h-[60px]" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        default:
            return <Input id={questionId} type="text" placeholder={question.label} disabled />;
    }
}

interface RequestPreviewProps {
    initialData: Request;
    clients: Client[];
    activeIds: { pageId: number, sectionId: number, questionId: number } | null;
    setActiveIds: (ids: { pageId: number, sectionId: number, questionId: number }) => void;
}

export default function RequestPreview({ initialData: request, clients, activeIds, setActiveIds }: RequestPreviewProps) {
    const assignedClients = clients.filter(c => request.client_id?.includes(c.id));
    const [activeAccordionItem, setActiveAccordionItem] = React.useState<string>(`page-${activeIds?.pageId}`);

     useEffect(() => {
        if (activeIds) {
            setActiveAccordionItem(`page-${activeIds.pageId}`);
        }
    }, [activeIds]);

    const handleContinue = () => {
        if (!request || !activeIds) return;

        const { pageId, sectionId, questionId } = activeIds;

        const pageIndex = request.form_data.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;
        const currentPage = request.form_data[pageIndex];

        const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;
        const currentSection = currentPage.sections[sectionIndex];

        const questionIndex = currentSection.questions.findIndex(q => q.id === questionId);

        // Try to find the next question in the current section
        if (questionIndex < currentSection.questions.length - 1) {
            const nextQuestion = currentSection.questions[questionIndex + 1];
            setActiveIds({ pageId, sectionId, questionId: nextQuestion.id });
            return;
        }
        // Try to find the next section in the current page
        if (sectionIndex < currentPage.sections.length - 1) {
            const nextSection = currentPage.sections[sectionIndex + 1];
            if (nextSection.questions.length > 0) {
                const nextQuestion = nextSection.questions[0];
                setActiveIds({ pageId, sectionId: nextSection.id, questionId: nextQuestion.id });
                return;
            }
        }
        // Try to find the next page
        if (pageIndex < request.form_data.length - 1) {
            const nextPage = request.form_data[pageIndex + 1];
            if (nextPage.sections.length > 0 && nextPage.sections[0].questions.length > 0) {
                const nextSection = nextPage.sections[0];
                const nextQuestion = nextSection.questions[0];
                setActiveIds({ pageId: nextPage.id, sectionId: nextSection.id, questionId: nextQuestion.id });
            }
        }
    };
    
    const isLastQuestion = useMemo(() => {
        if (!request || !activeIds) return true;
        const { pageId, sectionId, questionId } = activeIds;
        const lastPage = request.form_data[request.form_data.length - 1];
        if (pageId !== lastPage.id) return false;
        const lastSection = lastPage.sections[lastPage.sections.length - 1];
        if (sectionId !== lastSection.id) return false;
        const lastQuestion = lastSection.questions[lastSection.questions.length - 1];
        return questionId === lastQuestion.id;
    }, [request, activeIds]);
    
    const { activeQuestion, activeSection } = React.useMemo(() => {
        if (!request || !activeIds) return { activeQuestion: null, activeSection: null };
        
        const page = request.form_data.find(p => p.id === activeIds.pageId);
        if (!page) return { activeQuestion: null, activeSection: null };
        
        const section = page.sections.find(s => s.id === activeIds.sectionId);
        if (!section) return { activeQuestion: null, activeSection: null };

        const question = section.questions.find(q => q.id === activeIds.questionId);
        if(!question) return { activeQuestion: null, activeSection: section };
        
        return { activeQuestion: question, activeSection: section };
    }, [request, activeIds]);

    return (
        <div className="flex-1 flex overflow-hidden">
            <aside 
                 className="h-full bg-card"
                 style={{
                    display: 'flex',
                    width: '20rem',
                    flexDirection: 'column',
                    minHeight: '0px',
                    borderRight: '1px solid hsl(var(--border))',
                }}
            >
                <div className="p-4 border-b">
                    <h1 className="text-lg font-bold">{request.title}</h1>
                     <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">{request.status}</Badge>
                        {request.due_date && <Badge variant="outline"><CalendarDays className="h-3 w-3 mr-1.5" />Due: {format(parseISO(request.due_date), 'dd/MM/yyyy')}</Badge>}
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-2">
                    <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                        {request.form_data.map((page) => (
                            <AccordionItem value={`page-${page.id}`} key={page.id} className="border-none">
                                <AccordionTrigger 
                                    className={cn("w-full text-left p-2 font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer hover:no-underline rounded-md", activeIds?.pageId === page.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                                    onClick={() => { if(page.sections[0]?.questions[0]) setActiveIds({ pageId: page.id, sectionId: page.sections[0].id, questionId: page.sections[0].questions[0].id }) }}
                                >
                                    <span className="truncate">{page.title}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pl-4 mt-1 pb-0">
                                    {page.sections.map(section => (
                                        <div key={section.id} className="border-l my-1">
                                            <div 
                                                className={cn("w-full text-left p-1.5 rounded-md font-medium transition-colors text-sm flex items-center justify-between cursor-pointer pl-2", activeIds?.sectionId === section.id && activeIds?.pageId === page.id ? "bg-blue-100 text-blue-700" : "hover:bg-muted")}
                                                onClick={() => {if(section.questions[0]) setActiveIds({ pageId: page.id, sectionId: section.id, questionId: section.questions[0].id })}}
                                            >
                                                <span className="truncate">{section.title}</span>
                                            </div>
                                            <div className="pl-6 border-l ml-2">
                                                {section.questions.map(question => (
                                                    <div key={question.id} className={cn("pl-2 border-l -ml-4", question.id === activeIds?.questionId && section.id === activeIds.sectionId && activeIds.pageId === page.id ? "border-primary" : "border-transparent")}>
                                                        <TooltipProvider delayDuration={100}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button 
                                                                        className="w-full text-left py-1 text-sm rounded-r-md pl-4 transition-colors"
                                                                        onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: question.id })}
                                                                    >
                                                                        <p className={cn("truncate", question.id === activeIds?.questionId && section.id === activeIds.sectionId && activeIds.pageId === page.id ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>
                                                                            {question.label}
                                                                        </p>
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" align="start"><p className="max-w-xs">{question.label}</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 bg-muted/40">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">{activeSection?.title.replace(/^[0-9\.]+\s*/, '')}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><History className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-200/80">
                        {activeQuestion ? (
                            <>
                                <h3 className="font-semibold text-lg">{activeQuestion.label}</h3>
                                {activeQuestion.instructions && <p className="text-muted-foreground mt-2">{activeQuestion.instructions}</p>}
                                <div className="mt-6">
                                    {renderQuestionPreview(activeQuestion)}
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <Button variant="link" className="p-0 h-auto text-primary font-semibold" onClick={handleContinue} disabled={isLastQuestion}>
                                        {isLastQuestion ? "End of Form" : "Continue to next question"}
                                    </Button>
                                    <Button variant="outline" className="rounded-full">COMMENTS</Button>
                                </div>
                            </>
                        ) : <p>Select a question to see the preview.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
}
