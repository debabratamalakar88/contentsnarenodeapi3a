

'use client';

import React, { useState, useEffect, useMemo, useRef, type FormEvent, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequest, getClients, getRequestSubmissions, getComments, addComment, updateComment, deleteComment, getProfile, type User, type Request, type Question, type Client, type Page, type Section, type Comment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageSquare, History, Info, Sparkles, CalendarDays, Mail, Phone, Clipboard, Check, Eye, Users, FileText, CheckCircle, MoreHorizontal, Edit, Archive, Trash2, Pencil, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { iconList } from '@/components/ui/icon-selector';
import { cn } from "@/lib/utils";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

interface ViewSidebarProps {
  request: Request;
  assignedClients: Client[];
  activeIds: { pageId: number | null, sectionId: number | null, questionId: number | null };
  setActiveIds: (ids: { pageId: number; sectionId: number; questionId: number }) => void;
  publicUrl: string;
}

const ViewSidebar = ({ request, assignedClients, activeIds, setActiveIds, publicUrl }: ViewSidebarProps) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast({ title: "Copied to clipboard!", description: "The public URL has been copied." });
        setTimeout(() => setCopied(false), 2000);
    };

    const { pageId: activePageId, sectionId: activeSectionId, questionId: activeQuestionId } = activeIds;
    const [openPages, setOpenPages] = useState<number[]>([activePageId || (request.form_data[0]?.id ?? 0)]);

    const handlePageClick = (pageId: number) => {
        setOpenPages(current => current.includes(pageId) ? current.filter(id => id !== pageId) : [...current, pageId]);
    };
    
    return (
        <aside className="w-80 flex-shrink-0 bg-white border-r flex flex-col h-screen">
            <div className="flex-shrink-0 p-6 space-y-4">
                <h2 className="font-bold text-2xl leading-tight">{request.title}</h2>
                 {request.status === 'published' && request.request_code && publicUrl && (
                    <div className="mt-4">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Public URL</Label>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="flex h-8 w-full items-center truncate rounded-md border border-input bg-muted/50 px-3 text-xs ring-offset-background">
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate hover:underline"
                                    title={publicUrl}
                                >
                                    {publicUrl}
                                </a>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
                {request.due_date && (
                    <div className="text-sm font-medium text-muted-foreground flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Due: {format(parseISO(request.due_date), 'PPP')}
                    </div>
                )}
                {assignedClients.map(client => (
                    <div key={client.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-pink-100 text-pink-700">{getInitials(client.full_name)}</AvatarFallback></Avatar>
                        <div>
                            <p className="text-sm font-semibold">{client.full_name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto border-t">
                {request.form_data.map((page) => (
                    <div key={page.id}>
                        <button
                            onClick={() => handlePageClick(page.id)}
                            className={cn(
                                "w-full text-left flex items-center justify-between text-sm p-3 rounded-md font-semibold",
                                activePageId === page.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                            )}
                        >
                            <span className="truncate">{page.title}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs">0/{page.sections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </button>
                        {openPages.includes(page.id) && (
                            <div className="pl-4 mt-1 space-y-1">
                                {page.sections.map(section => (
                                    <div key={section.id}>
                                         <button onClick={() => { if(section.questions[0]) setActiveIds({ pageId: page.id, sectionId: section.id, questionId: section.questions[0].id })}}
                                            className={cn("w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-semibold", activeSectionId === section.id && activePageId === page.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
                                        >
                                            <span className="truncate">{section.title}</span>
                                             <div className="flex items-center gap-2">
                                                <span className="text-xs">0/{section.questions.length}</span>
                                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </button>
                                        {activeSectionId === section.id && activePageId === page.id && (
                                            <div className="pl-4 mt-1 border-l-2 ml-2">
                                                {section.questions.map(question => (
                                                    <button key={question.id} onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: question.id })} className={cn("w-full text-left flex items-center gap-2 text-sm p-2 rounded-md", activeQuestionId === question.id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50")}>
                                                        - <span className="truncate">{question.label}</span>
                                                        <CheckCircle className="h-4 w-4 ml-auto text-gray-300" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
             <div className="p-4 border-t">
                <Button className="w-full bg-pink-600 hover:bg-pink-700">GETTING STARTED</Button>
            </div>
        </aside>
    )
}

export default function ViewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [request, setRequest] = useState<Request | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIds, setActiveIds] = useState<{ pageId: number | null, sectionId: number | null, questionId: number | null }>({ pageId: null, sectionId: null, questionId: null });
    const [currentTab, setCurrentTab] = useState("form");
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const fetchComments = useCallback(async () => {
        if (!activeIds?.questionId || !token || !request) return;
        setIsCommentsLoading(true);
        try {
            const questionIdStr = String(activeIds.questionId);
            const commentsData = await getComments(token, request.id, questionIdStr);
            setComments(commentsData);
        } catch (err: any) {
            console.error("Failed to fetch comments:", err);
            setComments([]);
        } finally {
            setIsCommentsLoading(false);
        }
    }, [activeIds?.questionId, request, token]);

    useEffect(() => {
        if (request) {
            fetchComments();
        }
    }, [request, activeIds, fetchComments]);
    
    useEffect(() => {
        if (!id) { router.push('/dashboard/requests'); return; }
        if (!token) { router.push('/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, clientsData, submissionsData, profileData] = await Promise.all([
                    getRequest(token!, id),
                    getClients(token!),
                    getRequestSubmissions(token!, id),
                    getProfile(token!),
                ]);
                setRequest(requestData);
                setClients(clientsData || []);
                setSubmissions(submissionsData || []);
                setCurrentUser(profileData.user);

                if (requestData.form_data?.length > 0) {
                     const firstPage = requestData.form_data[0];
                     const firstSection = firstPage.sections[0];
                     const firstQuestion = firstSection.questions[0];
                     setActiveIds({ pageId: firstPage.id, sectionId: firstSection.id, questionId: firstQuestion.id });
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

    const handlePrevNextPage = (direction: 'prev' | 'next') => {
        if (!request || !activePage) return;
        const newIndex = direction === 'next' ? activePageIndex + 1 : activePageIndex - 1;
        if (newIndex >= 0 && newIndex < request.form_data.length) {
            const newPage = request.form_data[newIndex];
            const firstSection = newPage.sections[0];
            const firstQuestion = firstSection?.questions[0];
            if (firstSection && firstQuestion) {
                 setActiveIds({ pageId: newPage.id, sectionId: firstSection.id, questionId: firstQuestion.id });
            }
        }
    };
    
    const assignedClients = useMemo(() => {
        if (!request?.client_id || !clients) return [];
        const clientIds = Array.isArray(request.client_id) ? request.client_id : [request.client_id];
        return clients.filter(c => clientIds.includes(c.id));
    }, [request, clients]);
    
    const publicUrl = (typeof window !== 'undefined' && request?.status === 'published' && request.request_code)
        ? `${window.location.origin}/request/share/${request.request_code}`
        : '';
        
    const handleAddComment = async () => {
        if (!token || !request || !activeIds?.questionId || !newComment.trim() || !currentUser) return;
        
        setIsSubmittingComment(true);
        try {
            await addComment(token, {
                request_id: request.id,
                user_id: currentUser.id,
                question_id: String(activeIds.questionId),
                comment: newComment
            });
            setNewComment('');
            toast({ title: 'Comment added' });
            await fetchComments();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error adding comment', description: err.message });
        } finally {
            setIsSubmittingComment(false);
        }
    };
    
    const handleUpdateComment = async () => {
        if (!token || !editingCommentId || !editingCommentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            await updateComment(token, editingCommentId, { comment: editingCommentText });
            toast({ title: 'Comment updated' });
            setEditingCommentId(null);
            setEditingCommentText('');
            await fetchComments();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error updating comment', description: err.message });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!token || !commentToDelete) return;
        
        try {
            await deleteComment(token, commentToDelete.id);
            toast({ title: 'Comment deleted' });
            await fetchComments();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting comment', description: err.message });
        } finally {
            setCommentToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-muted/40">
                <Skeleton className="w-80 h-full" />
                <div className="flex-1 p-6 space-y-6">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }
    
    if (error || !request) {
        return <div className="p-6 text-center text-muted-foreground">{error || 'Request data could not be loaded.'}</div>;
    }

    return (
        <div className="flex flex-1 overflow-hidden h-screen bg-muted/40">
            <ViewSidebar request={request} assignedClients={assignedClients} activeIds={activeIds!} setActiveIds={setActiveIds} publicUrl={publicUrl} />
            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="sticky z-10 flex items-center justify-between gap-4 p-4 border-b bg-white">
                    <div className="flex items-center gap-2 w-1/3">
                        <Button variant="ghost" className="text-muted-foreground" onClick={() => handlePrevNextPage('prev')} disabled={activePageIndex === 0}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            {activePage && activePageIndex > 0 ? request.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '') : 'Previous'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-1/3">
                        {/* Buttons removed */}
                    </div>
                    <div className="flex items-center gap-2 w-1/3 justify-end">
                        <Button variant="ghost" className="text-muted-foreground" onClick={() => handlePrevNextPage('next')} disabled={activePageIndex === request.form_data.length - 1}>
                            {activePage && activePageIndex < request.form_data.length - 1 ? request.form_data[activePageIndex + 1].title.replace(/^[0-9\.]+\s*/, '') : 'Next'}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </header>
                 <div className="flex-1 overflow-y-auto p-8">
                   <Tabs value={currentTab} onValueChange={setCurrentTab} className="max-w-3xl mx-auto">
                        <TabsList className="mb-6">
                            <TabsTrigger value="form">Form</TabsTrigger>
                            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="form">
                           <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    {activeQuestion ? (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-bold">{activeSection?.title.replace(/^[0-9\.]+\s*/, '')}</h2>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"><History className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/80">
                                                <form>
                                                    <div className="grid gap-2">
                                                        <h3 className="font-semibold text-lg">{activeQuestion.label}</h3>
                                                        {activeQuestion.instructions && <p className="text-muted-foreground text-sm">{activeQuestion.instructions}</p>}
                                                        <div className="mt-4">
                                                            {renderQuestionPreview(activeQuestion)}
                                                        </div>
                                                    </div>
                                                     <div className="mt-6 flex justify-end">
                                                        <Button variant="outline" className="rounded-full" onClick={() => setShowComments(prev => !prev)}>
                                                            {showComments ? 'CLOSE COMMENTS' : `COMMENTS (${comments.length})`}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                   ) : (
                                     <p className="text-center text-muted-foreground py-10">Select a question to view it.</p>
                                   )}
                                </div>
                                {showComments && (
                                    <div className="w-80 flex-shrink-0 relative animate-in fade-in-50 slide-in-from-right-5">
                                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200/80"></div>
                                        <Card className="shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="text-lg">Comments ({comments.length})</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                                    {isCommentsLoading ? (
                                                      <div className="space-y-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
                                                    ) : comments.length > 0 ? (
                                                        comments.map(comment => (
                                                            <div key={comment.id} className="p-3 bg-muted rounded-lg group">
                                                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                                    <p className="font-semibold">{comment.user?.name || 'User'}</p>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {currentUser?.id === comment.user.id && editingCommentId !== comment.id && (
                                                                            <>
                                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.comment); }}><Pencil className="h-3 w-3" /></Button>
                                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setCommentToDelete(comment)}><Trash2 className="h-3 w-3" /></Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</p>
                                                                {editingCommentId === comment.id ? (
                                                                    <div className="mt-2">
                                                                        <Textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} className="bg-white" />
                                                                        <div className="flex justify-end gap-2 mt-2">
                                                                            <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                                                            <Button size="sm" onClick={handleUpdateComment} disabled={isSubmittingComment}>
                                                                                {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm mt-2">{comment.comment}</p>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-center text-muted-foreground py-4">No comments yet.</p>
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-4 border-t">
                                                    <Textarea placeholder="Enter your comment here..." className="min-h-[100px] border-0 focus-visible:ring-0 shadow-none p-2" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                                    <Button className="w-full mt-2" onClick={handleAddComment} disabled={isSubmittingComment}>
                                                        {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        ADD COMMENT
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                           </div>
                        </TabsContent>
                        <TabsContent value="submissions">
                           <Card>
                                <CardHeader>
                                    <CardTitle>Request Submissions</CardTitle>
                                    <CardDescription>Here are all the submissions received for this request.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Submission Code</TableHead>
                                                <TableHead>Submitted On</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead><span className="sr-only">Actions</span></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.length > 0 ? submissions.map(submission => (
                                                <TableRow key={submission.id}>
                                                    <TableCell className="font-mono text-xs">{submission.submission_code}</TableCell>
                                                    <TableCell>{submission.updated_at ? format(parseISO(submission.updated_at), 'PPP p') : 'N/A'}</TableCell>
                                                    <TableCell>
                                                      <Badge
                                                          variant={'outline'}
                                                          className={cn(
                                                              "capitalize",
                                                              submission.status === 'completed' && "border-green-200 bg-green-100 text-green-800"
                                                          )}
                                                      >
                                                          {submission.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                          {submission.status}
                                                      </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="default" size="sm" asChild className="bg-pink-600 hover:bg-pink-700 text-white">
                                                            <Link href={`/dashboard/requests/${request.id}/submissions/${submission.id}`}>View</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                                        No submissions received yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                           </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
             <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete this comment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteComment} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    



    