
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminRequest, getAdminClients, type Request, type Question, type Page, type Client } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MoreHorizontal, CalendarDays, Rocket, Edit, Archive, Trash2, ChevronLeft, ChevronRight, MessageSquare, History, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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


const Sidebar = ({ request, clients, activeIds, setActiveIds }: { request: Request; clients: Client[]; activeIds: { pageId: number, sectionId: number, questionId: number }; setActiveIds: any }) => {
    const { pageId: activePageId, sectionId: activeSectionId, questionId: activeQuestionId } = activeIds;
    const [activeAccordionItem, setActiveAccordionItem] = useState<string>(`page-${activePageId}`);
    
    useEffect(() => {
        setActiveAccordionItem(`page-${activePageId}`);
    }, [activePageId]);

    const handleQuestionClick = (pageId: number, sectionId: number, questionId: number) => {
        setActiveIds({ pageId, sectionId, questionId });
    };

    const assignedClients = clients.filter(c => request.client_id?.includes(c.id));

    return (
        <aside 
             style={{
                display: 'flex',
                width: '20vw',
                flexDirection: 'column',
                maxWidth: '26rem',
                minWidth: 'min(22rem, 100vw)',
                minHeight: '0px',
                borderRight: '1px solid #d9d9d9',
            }}
            className="bg-card h-screen"
        >
            <div className="p-6">
                <h1 className="text-xl font-bold">{request.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                    {request.due_date && <Badge variant="outline"><CalendarDays className="h-3 w-3 mr-1.5" />Due: {format(parseISO(request.due_date), 'dd/MM/yyyy')}</Badge>}
                    <Badge variant="secondary" className="capitalize">{request.status}</Badge>
                </div>
                 {assignedClients && assignedClients.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {assignedClients.map(client => (
                            <div key={client.id} className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{client.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{client.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 min-h-0">
                <nav className="h-full overflow-y-auto" style={{borderTop: "1px solid #ddd", padding: '10px'}}>
                    <Accordion type="single" collapsible className="w-full" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                        {request.form_data.map((page) => {
                            const isPageActive = page.id === activePageId;
                            const totalQuestions = page.sections.reduce((acc, s) => acc + s.questions.length, 0);
                            return (
                                <AccordionItem value={`page-${page.id}`} key={page.id} className="border-none">
                                    <AccordionTrigger 
                                        className={cn(
                                            "w-full text-left p-3 font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer hover:no-underline",
                                            isPageActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                        )}
                                        onClick={() => { if(page.sections[0]?.questions[0]) handleQuestionClick(page.id, page.sections[0].id, page.sections[0].questions[0].id) }}
                                    >
                                        <span className="truncate">{page.title}</span>
                                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{0}/{totalQuestions}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4 mt-1 pb-0">
                                        {page.sections.map(section => (
                                            <div key={section.id} className="border-l">
                                                <div 
                                                    className={cn(
                                                        "w-full text-left p-2 rounded-md font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer pl-2",
                                                        section.id === activeSectionId && isPageActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                                    )}
                                                    onClick={() => {if(section.questions[0]) handleQuestionClick(page.id, section.id, section.questions[0].id)}}
                                                >
                                                    <span className="truncate">{section.title}</span>
                                                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{0}/{section.questions.length}</span>
                                                </div>
                                                <div className="pl-6 border-l ml-2">
                                                    {section.questions.map(question => (
                                                        <div key={question.id} className={cn("pl-2 border-l -ml-4", question.id === activeQuestionId && section.id === activeSectionId && isPageActive ? "border-primary" : "border-transparent")}>
                                                            <TooltipProvider delayDuration={100}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button 
                                                                            className="w-full text-left py-1.5 text-sm rounded-r-md pl-4 transition-colors"
                                                                            onClick={() => handleQuestionClick(page.id, section.id, question.id)}
                                                                        >
                                                                            <p className={cn(
                                                                                "truncate",
                                                                                question.id === activeQuestionId && section.id === activeSectionId && isPageActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                                                                            )}>
                                                                                {question.label}
                                                                            </p>
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start">
                                                                        <p className="max-w-xs">{question.label}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </nav>
            </div>
            <div className="p-6">
                <Button className="w-full bg-pink-600 hover:bg-pink-700">GETTING STARTED</Button>
            </div>
        </aside>
    );
};

export default function AdminRequestPreviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [request, setRequest] = useState<Request | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIds, setActiveIds] = useState<{ pageId: number, sectionId: number, questionId: number } | null>(null);

    const id = Number(params.id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;

    useEffect(() => {
        if (!id) { router.push('/admin/dashboard/requests'); return; }
        if (!token) { router.push('/admin/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, clientData] = await Promise.all([
                    getAdminRequest(token!, id),
                    getAdminClients(token!)
                ]);
                
                if (requestData.status !== 'draft') {
                    router.replace(`/admin/dashboard/requests/${id}`);
                    return;
                }

                setRequest(requestData);
                setClients(clientData.data || []);

                if (requestData.form_data && requestData.form_data.length > 0 && requestData.form_data[0].sections.length > 0 && requestData.form_data[0].sections[0].questions.length > 0) {
                    setActiveIds({
                        pageId: requestData.form_data[0].id,
                        sectionId: requestData.form_data[0].sections[0].id,
                        questionId: requestData.form_data[0].sections[0].questions[0].id
                    });
                }
            } catch (err: any) {
                const message = err.message || 'Failed to load request data.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRequestData();
    }, [id, router, toast, token]);

    const { activeQuestion, activeSection, activePage, activePageIndex } = useMemo(() => {
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
    
    const navigatePage = (direction: 'next' | 'prev') => {
        if (!request || !activePage) return;
        const newIndex = direction === 'next' ? activePageIndex + 1 : activePageIndex - 1;

        if (newIndex >= 0 && newIndex < request.form_data.length) {
            const newPage = request.form_data[newIndex];
            if (newPage.sections[0] && newPage.sections[0].questions[0]) {
                setActiveIds({
                    pageId: newPage.id,
                    sectionId: newPage.sections[0].id,
                    questionId: newPage.sections[0].questions[0].id,
                });
            }
        }
    };

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
        if (questionIndex === -1) return;

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
                return;
            }
        }
        toast({ title: "End of Form", description: "You have reached the last question."});
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

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col bg-muted/40">
                <header className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </header>
                <div className="flex flex-1 gap-6">
                    <div className="w-72"><Skeleton className="h-full w-full" /></div>
                    <div className="flex-1 space-y-6"><Skeleton className="h-full w-full" /></div>
                </div>
            </div>
        );
    }
    
    if (error || !request) {
        return (
             <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-semibold text-destructive">Could not load request</h2>
                <p className="text-muted-foreground">{error || "The request could not be found."}</p>
                <Button asChild className="mt-4"><Link href="/admin/dashboard/requests">Go Back</Link></Button>
             </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                <Sidebar request={request} clients={clients} activeIds={activeIds!} setActiveIds={setActiveIds} />
                <main className="flex-1 flex flex-col overflow-hidden">
                     <header className="sticky z-10 flex flex-col gap-4 p-4 border-b bg-card">
                         <div className="flex items-center justify-between">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/admin/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="border-pink-200 text-pink-600 bg-pink-50 hover:bg-pink-100 hover:text-pink-700">
                                    <Sparkles className="mr-2 h-4 w-4"/> Activity
                                </Button>
                                <Button asChild>
                                    <Link href={`/admin/dashboard/requests/edit/${request.id}/finalize`}>
                                        <Rocket className="mr-2 h-4 w-4"/> Publish
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('prev')} disabled={activePageIndex === 0}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">{activePageIndex > 0 && request.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                               <span className="text-sm font-medium text-muted-foreground">{activePageIndex < request.form_data.length - 1 && request.form_data[activePageIndex + 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('next')} disabled={activePageIndex === request.form_data.length - 1}>
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </header>
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
                     </div>
                </main>
            </div>
        </div>
    );
}
