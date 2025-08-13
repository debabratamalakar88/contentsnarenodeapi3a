
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminRequest, getAdminUsers, getAdminClients, type Request, type Client, type User as UserType, Page, Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, CalendarDays, User, Check, Sparkles, Bold, Italic, Underline, List as ListIcon, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile, Link2Off, Code, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}


const RichTextEditorPreview = ({ question }: { question: Question }) => {
    return (
        <div className="rounded-md border border-input bg-background">
            <div className="prose prose-preview min-h-[100px] w-full p-3" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />
        </div>
    );
};

const DateRangePicker = ({ question }: { question: Question }) => (
    <div className="flex items-center gap-2">
        <Input type="date" disabled />
        <span>to</span>
        <Input type="date" disabled />
    </div>
);

const CurrencyInput = ({ question }: { question: Question }) => {
    return (
        <div className="flex items-center gap-0 max-w-xs">
            <Select disabled>
                <SelectTrigger className="w-[90px] rounded-r-none border-r-0">
                    <SelectValue placeholder="$" />
                </SelectTrigger>
            </Select>
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                <Input type="number" placeholder="100.00" disabled className="pl-8 rounded-l-none" />
            </div>
        </div>
    );
};

const renderQuestionInput = (question: Question) => {
    const questionId = `q-preview-${question.id}`;
    switch(question.type) {
        case 'text': return <Input id={questionId} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'textarea': return <Textarea id={questionId} placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'file': return <Input id={questionId} type="file" disabled />;
        case 'checkbox': return (
            <div className="space-y-2 pt-2">{question.options?.map((opt, i) => (<div key={i} className="flex items-center space-x-2"><Checkbox id={`${questionId}-${i}`} value={opt.value} disabled /><label htmlFor={`${questionId}-${i}`}>{opt.label}</label></div>))}</div>
        );
        case 'dropdown': return (
            <Select defaultValue={question.defaultValue} disabled><SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger><SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
        );
        case 'date': return <Input id={questionId} type="date" defaultValue={question.defaultValue} disabled className="max-w-[240px]" />;
        case 'email': return <Input id={questionId} type="email" placeholder={question.placeholder || "email@example.com"} defaultValue={question.defaultValue} disabled />;
        case 'tel': return <Input id={questionId} type="tel" placeholder={question.placeholder || "(123) 456-7890"} defaultValue={question.defaultValue} disabled />;
        case 'url': return <Input id={questionId} type="url" placeholder={question.placeholder || "https://example.com"} defaultValue={question.defaultValue} disabled />;
        case 'radio': return (
            <RadioGroup defaultValue={question.defaultValue}>{question.options?.map((opt, i) => (<div key={i} className="flex items-center space-x-2 pt-2"><RadioGroupItem value={opt.value} id={`${questionId}-${i}`} disabled /><label htmlFor={`${questionId}-${i}`}>{opt.label}</label></div>))}</RadioGroup>
        );
        case 'formatted-text': return <RichTextEditorPreview question={question} />;
        case 'image-upload': return <Input id={questionId} type="file" accept="image/*" disabled multiple />;
        case 'address': return <AddressAutocompleteInput id={questionId} placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'number': return <Input id={questionId} type="number" placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'currency': return <CurrencyInput question={question} />;
        case 'country': return <Select defaultValue={question.defaultValue} disabled><SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger><SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent></Select>;
        case 'date-range': return <DateRangePicker question={question} />;
        case 'icon-selector': return <IconSelector defaultValue={question.defaultValue} />;
        case 'color-picker': return (<div className="flex items-center gap-2"><div className="w-10 h-10 p-1 rounded-md border" style={{backgroundColor: question.defaultValue || '#000000'}} /><Input type="text" value={question.defaultValue || '#000000'} disabled className="max-w-[150px]"/></div>);
        case 'button': return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'} disabled>{question.label}</Button>;
        default: return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
    }
}

interface ViewSidebarProps {
  request: Request;
  ownerName: string;
  assignedClients: Client[];
  pages: Page[];
  activePageIndex: number;
  setActivePageIndex: (id: number) => void;
}

const ViewSidebar = ({ request, ownerName, assignedClients, pages, activePageIndex, setActivePageIndex }: ViewSidebarProps) => (
    <aside className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
        <div className="flex-shrink-0">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg leading-tight">{request.title}</h2>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Created by {ownerName}</span>
                </div>
                 {request.due_date && (
                    <div className="text-xs font-medium text-muted-foreground mt-3 flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        Due: {format(parseISO(request.due_date), 'PPP')}
                    </div>
                )}
            </div>
             {assignedClients.length > 0 && (
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Clients</h3>
                    <div className="space-y-2">
                        {assignedClients.map(client => (
                            <Link key={client.id} href={`/admin/dashboard/clients/${client.id}`}>
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-pink-100 text-pink-700">{getInitials(client.full_name)}</AvatarFallback></Avatar>
                                    <div><p className="text-sm font-semibold">{client.full_name}</p><p className="text-xs text-muted-foreground">{client.email}</p></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
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


export default function AdminViewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [request, setRequest] = useState<Request | null>(null);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activePageIndex, setActivePageIndex] = useState(0);

    useEffect(() => {
        if (!id) { router.push('/admin/dashboard/requests'); return; }
        const token = localStorage.getItem('adminAuthToken');
        if (!token) { router.push('/admin/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, usersData, clientsData] = await Promise.all([
                    getAdminRequest(token!, id),
                    getAdminUsers(token!),
                    getAdminClients(token!)
                ]);
                setRequest(requestData);
                setAllUsers(usersData);
                setAllClients(clientsData);
            } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load request data.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRequestData();
    }, [id, router, toast]);

    const ownerName = useMemo(() => {
        if (!request || !allUsers.length) return `User #${request?.user_id}`;
        const owner = allUsers.find(u => u.id === request.user_id);
        return owner?.name || `User #${request.user_id}`;
    }, [request, allUsers]);

    const assignedClients = useMemo(() => {
        if (!request?.client_id || !allClients.length) return [];
        const clientIds = Array.isArray(request.client_id) ? request.client_id : [request.client_id];
        return allClients.filter(c => clientIds.includes(c.id));
    }, [request, allClients]);
    
    const activePage = request?.form_data?.[activePageIndex];

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col">
                <header className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4"><Skeleton className="h-9 w-9" /><Skeleton className="h-8 w-48" /></div>
                </header>
                <div className="flex flex-1"><Skeleton className="w-72" /><div className="flex-1 p-6"><Skeleton className="h-full w-full" /></div></div>
            </div>
        );
    }

    if (!request) {
        return <div className="p-6 text-center text-muted-foreground">Request data could not be loaded.</div>;
    }
     const isLastPage = activePageIndex === (request?.form_data.length || 0) - 1;


    return (
        <div className="flex flex-1 flex-col bg-muted/40 overflow-hidden">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-shrink-0">
                <Button variant="outline" size="icon" asChild><Link href="/admin/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link></Button>
                 <h1 className="text-lg font-semibold truncate" title={request.title}>{request.title}</h1>
                 <Badge variant="outline" className={cn("capitalize", request.status === 'published' && "bg-green-100 text-green-800")}>{request.status}</Badge>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <ViewSidebar request={request} ownerName={ownerName} assignedClients={assignedClients} pages={request.form_data || []} activePageIndex={activePageIndex} setActivePageIndex={setActivePageIndex} />
                <main className="flex-1 overflow-y-auto">
                     <div className="max-w-3xl mx-auto p-6">
                        {activePage ? (
                            <Card>
                                <CardHeader><CardTitle>{activePage.title}</CardTitle>{activePage.instructions && <CardDescription>{activePage.instructions}</CardDescription>}</CardHeader>
                                <CardContent className="space-y-8">
                                    {activePage.sections.map(section => (
                                        <div key={section.id}>
                                            <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                                            {section.instructions && <p className="text-sm text-muted-foreground mt-1 mb-4">{section.instructions}</p>}
                                            {section.questions.map(question => (
                                                <div key={question.id} className="grid gap-2 mb-4">
                                                    {question.type !== 'button' && question.type !== 'formatted-text' && <Label htmlFor={`q-preview-${question.id}`}>{question.label}{question.required && <span className="text-destructive"> *</span>}</Label>}
                                                    {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                    {renderQuestionInput(question)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-6">
                                    <Button type="button" variant="outline" onClick={() => setActivePageIndex(p => p - 1)} disabled={activePageIndex === 0}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                    </Button>
                                    {!isLastPage && (
                                        <Button type="button" onClick={() => setActivePageIndex(p => p + 1)}>
                                            Next <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ) : (
                             <p className="text-muted-foreground text-center py-10">Select a page to view its content.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

    