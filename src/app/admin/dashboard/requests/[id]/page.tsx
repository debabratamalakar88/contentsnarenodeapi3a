
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminRequest, getAdminClient, getAdminUsers, type Request, type Client, type User, type Submission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, CalendarDays, Check, Clipboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function AdminViewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [request, setRequest] = useState<Request | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState("details");

    useEffect(() => {
        if (!id) { router.push('/admin/dashboard/requests'); return; }
        const token = localStorage.getItem('adminAuthToken');
        if (!token) { router.push('/admin/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, clientsData, usersData] = await Promise.all([
                    getAdminRequest(token!, id),
                    // Assuming you have an admin function to get all clients, else it needs to be created
                    // For now, let's assume getClients can work with an admin token if permissions allow
                    getAdminClients(token!), 
                    getAdminUsers(token!),
                ]);
                setRequest(requestData);
                setClients(clientsData || []);
                setUsers(usersData || []);
            } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load request data.' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRequestData();
    }, [id, router, toast]);

    const assignedClients = useMemo(() => {
        if (!request?.client_id || !clients) return [];
        return clients.filter(c => request.client_id!.includes(c.id));
    }, [request, clients]);
    
    const owner = useMemo(() => {
        if (!request?.user_id || !users) return null;
        return users.find(u => u.id === request.user_id);
    }, [request, users]);

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col">
                <header className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4"><Skeleton className="h-9 w-9" /><Skeleton className="h-8 w-48" /></div>
                </header>
                <div className="flex flex-1"><Skeleton className="w-64" /><div className="flex-1 p-6"><Skeleton className="h-full w-full" /></div></div>
            </div>
        );
    }

    if (!request) {
        return <div className="p-6 text-center text-muted-foreground">Request data could not be loaded.</div>;
    }

    return (
        <div className="flex flex-1 flex-col bg-muted/40 overflow-hidden">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-shrink-0">
                <Button variant="outline" size="icon" asChild><Link href="/admin/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link></Button>
                 <h1 className="text-lg font-semibold">{request.title}</h1>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                 <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
                                <p className="font-semibold">{owner?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                <Badge variant="outline" className={cn("capitalize", request.status === 'published' && "bg-green-100 text-green-800")}>{request.status}</Badge>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                                <p className="font-semibold">{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {assignedClients.length > 0 ? (
                                <div className="space-y-4">
                                    {assignedClients.map(client => (
                                        <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10"><AvatarFallback>{getInitials(client.full_name)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-semibold">{client.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/dashboard/clients/${client.id}`}><Eye className="mr-2 h-4 w-4"/>View Client</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-muted-foreground">No clients assigned to this request.</p>
                             )}
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </div>
    );
}

