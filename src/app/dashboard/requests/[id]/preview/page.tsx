'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequest, softDeleteRequest, forceDeleteRequest, type Request, type Question, type Page, type Section } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MoreHorizontal, CalendarDays, Rocket, Edit, Archive, Trash2, ChevronLeft, ChevronRight, MessageSquare, History, Info } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

const Sidebar = ({ request, activeIds, setActiveIds }: { request: Request; activeIds: { pageId: number, sectionId: number, questionId: number }; setActiveIds: any }) => {
    const { pageId: activePageId, sectionId: activeSectionId, questionId: activeQuestionId } = activeIds;

    const handleQuestionClick = (pageId: number, sectionId: number, questionId: number) => {
        setActiveIds({ pageId, sectionId, questionId });
    };

    return (
        <aside className="w-72 bg-background border-r p-6 flex flex-col gap-8 h-full overflow-y-auto">
            <div>
                <h1 className="text-xl font-bold">{request.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                    {request.due_date && <Badge variant="outline"><CalendarDays className="h-3 w-3 mr-1.5" />Due: {format(parseISO(request.due_date), 'dd/MM/yyyy')}</Badge>}
                    <Badge variant="secondary" className="capitalize">{request.status}</Badge>
                </div>
            </div>
            <nav className="flex-1">
                <ul className="space-y-1">
                    {request.form_data.map((page) => {
                        const isPageActive = page.id === activePageId;
                        return (
                            <li key={page.id}>
                                <div 
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer",
                                        isPageActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    )}
                                    onClick={() => handleQuestionClick(page.id, page.sections[0].id, page.sections[0].questions[0].id)}
                                >
                                    <span className="truncate">{page.title}</span>
                                    <span className="text-xs text-muted-foreground">0/{page.sections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                                </div>
                                {isPageActive && (
                                    <div className="pl-4 mt-1">
                                        {page.sections.map(section => (
                                            <div key={section.id} className="border-l">
                                                <div 
                                                    className={cn(
                                                        "w-full text-left p-2 rounded-md font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer pl-2",
                                                        section.id === activeSectionId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                                    )}
                                                    onClick={() => handleQuestionClick(page.id, section.id, section.questions[0].id)}
                                                >
                                                    <span className="truncate">{section.title}</span>
                                                    <span className="text-xs text-muted-foreground">0/{section.questions.length}</span>
                                                </div>
                                                <div className="pl-6 border-l ml-2">
                                                     {section.questions.map(question => (
                                                        <div key={question.id} className={cn("pl-2 border-l -ml-4", question.id === activeQuestionId ? "border-primary" : "border-transparent")}>
                                                            <button 
                                                                className={cn("w-full text-left py-1.5 text-sm rounded-r-md pl-4 transition-colors", question.id === activeQuestionId ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}
                                                                onClick={() => handleQuestionClick(page.id, section.id, question.id)}
                                                            >
                                                                <span className="truncate">{question.label}</span>
                                                            </button>
                                                        </div>
                                                     ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <Button className="w-full bg-pink-600 hover:bg-pink-700">GETTING STARTED</Button>
        </aside>
    );
};

export default function RequestPreviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIds, setActiveIds] = useState<{ pageId: number, sectionId: number, questionId: number } | null>(null);

    const [requestToArchive, setRequestToArchive] = useState<Request | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<Request | null>(null);

    const id = Number(params.id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/requests');
            return;
        }
        if (!token) {
            router.push('/login');
            return;
        }

        async function fetchRequestData() {
            try {
                const data = await getRequest(token!, id);
                setRequest(data);
                if (data.form_data && data.form_data.length > 0 && data.form_data[0].sections.length > 0 && data.form_data[0].sections[0].questions.length > 0) {
                    setActiveIds({
                        pageId: data.form_data[0].id,
                        sectionId: data.form_data[0].sections[0].id,
                        questionId: data.form_data[0].sections[0].questions[0].id
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

    const handleArchive = async () => {
        if (!token || !requestToArchive) return;
        try {
            await softDeleteRequest(token, requestToArchive.id);
            toast({ title: 'Request archived' });
            router.push('/dashboard/requests');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error archiving request', description: err.message });
        } finally {
            setRequestToArchive(null);
        }
    };
    
    const handleForceDelete = async () => {
        if (!token || !requestToForceDelete) return;
        try {
            await forceDeleteRequest(token, requestToForceDelete.id);
            toast({ title: 'Request permanently deleted' });
            router.push('/dashboard/requests');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting request', description: err.message });
        } finally {
            setRequestToForceDelete(null);
        }
    };
    
    const { activeQuestion, activeSection, activePage, activePageIndex, activeQuestionIndex, totalQuestionsInSection } = useMemo(() => {
        if (!request || !activeIds) return {};

        const page = request.form_data.find(p => p.id === activeIds.pageId);
        if (!page) return {};
        
        const section = page.sections.find(s => s.id === activeIds.sectionId);
        if (!section) return {};

        const question = section.questions.find(q => q.id === activeIds.questionId);
        if(!question) return {};
        
        const pageIndex = request.form_data.findIndex(p => p.id === page.id);
        const questionIndex = section.questions.findIndex(q => q.id === question.id);
        const totalQuestions = section.questions.length;

        return { activeQuestion: question, activeSection: section, activePage: page, activePageIndex: pageIndex, activeQuestionIndex: questionIndex, totalQuestionsInSection: totalQuestions };
    }, [request, activeIds]);
    
    const navigatePage = (direction: 'next' | 'prev') => {
        if (!request || !activePage) return;
        const currentIndex = request.form_data.findIndex(p => p.id === activePage.id);
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < request.form_data.length) {
            const newPage = request.form_data[newIndex];
            setActiveIds({
                pageId: newPage.id,
                sectionId: newPage.sections[0].id,
                questionId: newPage.sections[0].questions[0].id,
            });
        }
    };

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
                <Button asChild className="mt-4"><Link href="/dashboard/requests">Go Back</Link></Button>
             </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full bg-muted/40">
                <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
                    <Sidebar request={request} activeIds={activeIds!} setActiveIds={setActiveIds} />
                    <main className="flex-1 overflow-y-auto">
                        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('prev')} disabled={activePageIndex === 0}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">{activePageIndex > 0 && request.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="border-pink-200 text-pink-600 bg-pink-50 hover:bg-pink-100 hover:text-pink-700">
                                    <History className="mr-2 h-4 w-4"/> Activity
                                </Button>
                                <Button asChild>
                                     <Link href={`/dashboard/requests/edit/${request.id}/finalize`}>
                                        <Rocket className="mr-2 h-4 w-4"/> Publish
                                     </Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/finalize`}><Rocket className="mr-2 h-4 w-4" /> Publish Request</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}><Edit className="mr-2 h-4 w-4" /> Edit Request</Link></DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setRequestToArchive(request)}><Archive className="mr-2 h-4 w-4" /> Archive Request</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setRequestToForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Request</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                               <span className="text-sm font-medium text-muted-foreground">{activePageIndex < request.form_data.length - 1 && request.form_data[activePageIndex + 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('next')} disabled={activePageIndex === request.form_data.length - 1}>
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </header>
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
                                            <Textarea
                                                placeholder="Enter text here..."
                                                className="min-h-[100px] bg-background text-foreground"
                                            />
                                        </div>
                                         <div className="mt-6 flex justify-between items-center">
                                            <Button variant="link" className="p-0 h-auto text-primary font-semibold">Continue to next question</Button>
                                            <Button variant="outline" className="rounded-full">COMMENTS</Button>
                                         </div>
                                    </>
                                ) : <p>Select a question to see the preview.</p>}
                            </div>
                         </div>
                    </main>
                </div>
            </div>
             <AlertDialog open={!!requestToArchive} onOpenChange={(open) => !open && setRequestToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Archive Request?</AlertDialogTitle><AlertDialogDescription>This will move the request to the archive. You can restore it later.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={!!requestToForceDelete} onOpenChange={(open) => !open && setRequestToForceDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All data for this request will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleForceDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
