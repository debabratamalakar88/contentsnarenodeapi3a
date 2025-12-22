
'use client';

import React, { useState, useEffect, useMemo, useRef, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequest, getClients, getRequestSubmissions, type Request, type Question, type Client, type Page, type Submission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageSquare, History, Info, Sparkles, CalendarDays, Mail, Phone, Clipboard, Check, Eye, Users, FileText, CheckCircle, MoreHorizontal, Edit, Archive, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

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
        case 'text': return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} minLength={question.minLength} maxLength={question.maxLength} />;
        case 'textarea': return <Textarea id={questionId} name={questionName} placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} minLength={question.minLength} maxLength={question.maxLength} />;
        case 'file': return <Input id={questionId} name={`${questionName}[]`} type="file" required={question.required} className={inputClassName} multiple />;
        case 'checkbox': return (
            <div className="space-y-2 pt-2">
                {question.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Checkbox id={`${questionId}-${i}`} name={`${questionName}[]`} value={opt.value} checked={Array.isArray(value) && value.includes(opt.value)} onCheckedChange={(checked) => { const currentValues = Array.isArray(value) ? [...value] : []; const newValues = checked ? [...currentValues, opt.value] : currentValues.filter(v => v !== opt.value); onChange(questionName, newValues); }} />
                        <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                    </div>
                ))}
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
        );
        case 'dropdown': return (
            <Select name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)} required={question.required}>
                <SelectTrigger id={questionId} className={inputClassName}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
            </Select>
        );
        case 'date': return <Input id={questionId} name={questionName} type="date" value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={cn("max-w-[240px]", inputClassName)} />;
        case 'email': return <Input id={questionId} name={questionName} type="email" placeholder={question.placeholder || "email@example.com"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'tel': return <Input id={questionId} name={questionName} type="tel" placeholder={question.placeholder || "(123) 456-7890"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'url': return <Input id={questionId} name={questionName} type="url" placeholder={question.placeholder || "https://example.com"} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'radio': return (
            <RadioGroup name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)}>
                {question.options?.map((opt, i) => (<div key={i} className="flex items-center space-x-2 pt-2"><RadioGroupItem value={opt.value} id={`${questionId}-${i}`} /><label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label></div>))}
            </RadioGroup>
        );
        case 'formatted-text': return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        case 'image-upload': return <Input id={questionId} name={`${questionName}[]`} type="file" accept="image/*" required={question.required} multiple className={inputClassName} />;
        case 'address': return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={value} onValueChange={(val) => onChange(questionName, val)} />;
        case 'number': return <Input id={questionId} name={questionName} type="number" placeholder={question.placeholder} value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'button': return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        case 'date-range': return (
            <div className="flex items-center gap-2">
                    <Input id={`${questionId}-start`} name={`${questionName}_start`} type="date" value={value?.start || ''} onChange={e => onChange(questionName, {...(value || {}), start: e.target.value})} className={inputClassName} />
                    <span>to</span>
                    <Input id={`${questionId}-end`} name={`${questionName}_end`} type="date" value={value?.end || ''} onChange={e => onChange(questionName, {...(value || {}), end: e.target.value})} className={inputClassName} />
            </div>
            );
        case 'currency':
            return <Input id={questionId} name={questionName} type="text" placeholder="$0.00" value={value || ''} onChange={e => onChange(questionName, e.target.value)} required={question.required} className={inputClassName} />;
        case 'country':
            return (
                <Select name={questionName} value={value || ''} onValueChange={val => onChange(questionName, val)} required={question.required}>
                    <SelectTrigger id={questionId} className={inputClassName}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent>
                </Select>
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
        default: return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
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
                                         <button onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: section.questions[0].id })}
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
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeIds, setActiveIds] = useState<{ pageId: number | null, sectionId: number | null, questionId: number | null }>({ pageId: null, sectionId: null, questionId: null });
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [currentTab, setCurrentTab] = useState("form");
    
    useEffect(() => {
        if (!id) { router.push('/dashboard/requests'); return; }
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, clientsData, submissionsData] = await Promise.all([
                    getRequest(token!, id),
                    getClients(token!),
                    getRequestSubmissions(token!, id)
                ]);
                setRequest(requestData);
                setClients(clientsData || []);
                setSubmissions(submissionsData || []);

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
    }, [id, router, toast]);

    const { activePage, activeSection, activeQuestion } = useMemo(() => {
        if (!request || !activeIds) return { activePage: null, activeSection: null, activeQuestion: null };
        const page = request.form_data.find(p => p.id === activeIds.pageId);
        if (!page) return { activePage: null, activeSection: null, activeQuestion: null };
        const section = page.sections.find(s => s.id === activeIds.sectionId);
        if (!section) return { activePage: page, activeSection: null, activeQuestion: null };
        const question = section.questions.find(q => q.id === activeIds.questionId);
        return { activePage: page, activeSection: section, activeQuestion: question || null };
    }, [request, activeIds]);

    const handlePrevNextPage = (direction: 'prev' | 'next') => {
        if (!request || !activePage) return;
        const currentIndex = request.form_data.findIndex(p => p.id === activePage.id);
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
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

    const activePageIndex = request.form_data.findIndex(p => p.id === activePage?.id);

    return (
        <div className="flex flex-1 overflow-hidden h-screen bg-muted/40">
            <ViewSidebar request={request} assignedClients={assignedClients} activeIds={activeIds} setActiveIds={setActiveIds} publicUrl={publicUrl} />
            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="sticky z-10 flex items-center justify-between gap-4 p-4 border-b bg-white">
                    <div className="flex items-center gap-2 w-1/3">
                        <Button variant="ghost" className="text-muted-foreground" onClick={() => handlePrevNextPage('prev')} disabled={activePageIndex === 0}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            {activePage && activePageIndex > 0 ? request.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '') : 'Previous'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 w-1/3">
                         <Button variant="outline" className="text-pink-600 border-pink-200">
                            <Sparkles className="mr-2 h-4 w-4"/> Activity
                        </Button>
                        <Button variant="outline">Client Access Settings</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit Request</DropdownMenuItem>
                                <DropdownMenuItem><Archive className="mr-2 h-4 w-4" /> Archive Request</DropdownMenuItem>
                                <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4" /> Delete Request</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                                    {renderQuestionInput(activeQuestion, formValues[activeQuestion.apiId || ''], (name, val) => setFormValues(prev => ({...prev, [name]: val})), undefined)}
                                                </div>
                                            </div>
                                            <div className="mt-8 flex justify-between items-center">
                                                <div>
                                                    <Button>SUBMIT FOR REVIEW</Button>
                                                    <Button variant="link" className="text-primary">or Save draft and continue</Button>
                                                </div>
                                                <Button variant="outline" className="rounded-full">COMMENTS</Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                           ) : (
                             <p className="text-center text-muted-foreground py-10">Select a question to view it.</p>
                           )}
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
        </div>
    );
}
