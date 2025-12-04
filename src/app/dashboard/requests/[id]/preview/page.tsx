
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequest, type Request, type Page, softDeleteRequest, forceDeleteRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MoreHorizontal, CalendarDays, Rocket, Sparkles, Edit, Archive, Trash2 } from 'lucide-react';
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

export default function RequestPreviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePageIndex, setActivePageIndex] = useState(0);

    const [requestToArchive, setRequestToArchive] = useState<Request | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<Request | null>(null);
    const [dataVersion, setDataVersion] = useState(0);

    const id = Number(params.id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const refetchData = () => setDataVersion(v => v + 1);

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
            } catch (err: any) {
                const message = err.message || 'Failed to load request data.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRequestData();
    }, [id, router, toast, token, dataVersion]);

    const handleArchive = async () => {
        if (!token || !requestToArchive) return;
        try {
            await softDeleteRequest(token, requestToArchive.id);
            toast({ title: 'Request archived' });
            refetchData();
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
            refetchData();
            router.push('/dashboard/requests');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting request', description: err.message });
        } finally {
            setRequestToForceDelete(null);
        }
    };

    const activePage = request?.form_data[activePageIndex];

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
                <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link href="/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="border-pink-200 text-pink-600 bg-pink-50 hover:bg-pink-100 hover:text-pink-700">
                            <Sparkles className="mr-2 h-4 w-4"/> Activity
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
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/requests/edit/${request.id}/finalize`}>
                                        <Rocket className="mr-2 h-4 w-4" /> Publish Request
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/requests/edit/${request.id}/essentials`}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Request
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setRequestToArchive(request)}>
                                    <Archive className="mr-2 h-4 w-4" /> Archive Request
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setRequestToForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Request
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-72 bg-background border-r p-6 flex flex-col gap-8">
                        <div>
                            <h1 className="text-xl font-bold">{request.title}</h1>
                             <div className="flex items-center gap-2 mt-2">
                                 {request.due_date && <Badge variant="outline"><CalendarDays className="h-3 w-3 mr-1.5"/>Due: {format(parseISO(request.due_date), 'dd/MM/yyyy')}</Badge>}
                                 <Badge variant="secondary" className="capitalize">{request.status}</Badge>
                             </div>
                        </div>
                        <nav className="flex-1">
                            <ul className="space-y-1">
                                {request.form_data.map((page, index) => (
                                    <li key={page.id}>
                                        <button 
                                            className={cn("w-full text-left p-3 rounded-lg font-semibold transition-colors text-sm flex items-center justify-between",
                                                activePageIndex === index ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                            )}
                                            onClick={() => setActivePageIndex(index)}
                                        >
                                            <span className="truncate">{page.title}</span>
                                            <span className="text-xs text-muted-foreground">0/{page.sections.reduce((acc, s) => acc + s.questions.length, 0)}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Getting Started</Button>
                    </aside>

                    <main className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-sm">
                             {activePage?.instructions && (
                                 <div className="prose prose-sm max-w-none text-foreground mb-8" dangerouslySetInnerHTML={{ __html: activePage.instructions }}/>
                             )}
                             {activePage?.sections.map(section => (
                                <div key={section.id}>
                                    <h2 className="text-lg font-semibold border-b pb-2 mb-4">{section.title}</h2>
                                    {section.instructions && <p className="text-muted-foreground mb-4">{section.instructions}</p>}
                                    <div className="space-y-6">
                                         {section.questions.map(q => (
                                            <div key={q.id}>
                                                <p className="font-medium">{q.label}</p>
                                                {q.instructions && <p className="text-sm text-muted-foreground">{q.instructions}</p>}
                                            </div>
                                         ))}
                                    </div>
                                </div>
                             ))}
                             {request.description && (
                                 <div className="mt-8">
                                    <h2 className="text-lg font-semibold border-b pb-2 mb-4">How it works</h2>
                                     <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: request.description }}/>
                                    <div className="mt-6 aspect-video bg-muted rounded-lg flex items-center justify-center">
                                        <p className="text-muted-foreground">Video player placeholder</p>
                                    </div>
                                 </div>
                             )}
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
