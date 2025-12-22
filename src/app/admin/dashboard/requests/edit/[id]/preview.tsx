
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MoreHorizontal, Rocket, Edit, Archive, Trash2, ChevronLeft, ChevronRight, MessageSquare, History, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
    request: Request;
    clients: Client[];
    activeIds: { pageId: number, sectionId: number, questionId: number } | null;
    setActiveIds: (ids: { pageId: number, sectionId: number, questionId: number }) => void;
}

export default function RequestPreview({ request, clients, activeIds, setActiveIds }: RequestPreviewProps) {
    const { activeQuestion, activeSection, activePage, activePageIndex } = React.useMemo(() => {
        if (!request || !activeIds) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };
        
        const page = request.form_data.find(p => p.id === activeIds.pageId);
        if (!page) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };
        
        const section = page.sections.find(s => s.id === activeIds.sectionId);
        if (!section) return { activeQuestion: null, activeSection: null, activePage: page, activePageIndex: -1 };

        const question = section.questions.find(q => q.id === activeIds.questionId);
        if(!question) return { activeQuestion: null, activeSection: section, activePage: page, activePageIndex: -1 };
        
        const pageIndex = request.form_data.findIndex(p => p.id === page.id);

        return { activeQuestion: question, activeSection: section, activePage: page, activePageIndex: pageIndex };
    }, [request, activeIds]);

    const assignedClients = clients.filter(c => request.client_id?.includes(c.id));

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-4xl mx-auto w-full">
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
                        </>
                    ) : <p>Select a question to see the preview.</p>}
                </div>
            </div>
        </div>
    );
}
