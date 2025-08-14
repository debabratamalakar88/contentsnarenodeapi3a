
'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminClient, getAdminUsers, type Client, type User as UserType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Mail, Phone, Building, Globe, Calendar as CalendarIcon, Clock, ShieldCheck, ShieldX, User } from "lucide-react";
import { format, parseISO } from 'date-fns';

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function ClientViewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);

    const id = Number(params.id);

    useEffect(() => {
        if (!id) {
            router.push('/admin/dashboard/clients');
            return;
        }

        async function fetchClientData() {
            setIsLoading(true);
            const token = localStorage.getItem('adminAuthToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/admin/login');
                return;
            }

            try {
                const [fetchedClient, fetchedUsersResponse] = await Promise.all([
                    getAdminClient(token, id),
                    getAdminUsers(token, 1, '', true)
                ]);
                setClient(fetchedClient);
                setAllUsers(fetchedUsersResponse.data || []);
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching client data',
                    description: err.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchClientData();
    }, [id, router, toast]);

    const getUserName = (userId: number | null) => {
        if (userId === null) return 'Admin';
        const user = allUsers.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-background p-8">
                <header className="sticky top-0 bg-white z-10"><div className="h-16 flex items-center justify-between px-6 border-b"><div className="flex items-center gap-4"><Skeleton className="h-9 w-9" /><Skeleton className="h-6 w-48" /></div><Skeleton className="h-9 w-24" /></div></header>
                <main className="flex-1 overflow-y-auto pt-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center gap-6"><Skeleton className="h-24 w-24 rounded-full" /><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-5 w-48" /></div></div>
                        <Card><CardHeader><Skeleton className="h-7 w-48" /></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-7 w-48" /></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></CardContent></Card>
                    </div>
                </main>
            </div>
        )
    }

    if (!client) {
        return <div className="p-6 text-center">Client not found.</div>;
    }

    const isArchived = !!client.deleted_at;
    const assignedUserName = getUserName(client.created_by);

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-0 bg-white z-10">
                <div className="h-16 flex items-center justify-between px-6 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild><Link href="/admin/dashboard/clients"><ArrowLeft className="h-5 w-5" /></Link></Button>
                        <h1 className="text-lg font-semibold">Client Details</h1>
                    </div>
                    {!isArchived && (<Button asChild><Link href={`/admin/dashboard/clients/${client.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Client</Link></Button>)}
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 text-4xl"><AvatarFallback className="bg-pink-100 text-pink-800 font-bold border">{getInitials(client.full_name)}</AvatarFallback></Avatar>
                        <div><h2 className="text-3xl font-bold">{client.full_name}</h2><p className="text-muted-foreground">{client.email}</p></div>
                    </div>
                    
                    <Card>
                        <CardHeader><CardTitle>Contact & Account Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Email</p><p className="text-sm text-muted-foreground">{client.email}</p></div></div>
                            <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Phone</p><p className="text-sm text-muted-foreground">{client.phone_number || 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3"><Building className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Companies</p><p className="text-sm text-muted-foreground">{client.companies?.join(', ') || 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Created By</p><p className="text-sm text-muted-foreground">{assignedUserName}</p></div></div>
                            <div className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Client Since</p><p className="text-sm text-muted-foreground">{client.created_at ? format(parseISO(client.created_at), 'PPP') : 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3">{isArchived ? <ShieldX className="h-5 w-5 text-red-500" /> : <ShieldCheck className="h-5 w-5 text-green-500" />}<div><p className="text-sm font-medium">Account Status</p><p className="text-sm text-muted-foreground">{isArchived ? 'Archived' : 'Active'}</p></div></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Language</p><p className="text-sm text-muted-foreground">{client.app_language || 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3"><CalendarIcon className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Date Format</p><p className="text-sm text-muted-foreground">{client.date_format || 'N/A'}</p></div></div>
                            <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Time Zone</p><p className="text-sm text-muted-foreground">{client.time_zone || 'N/A'}</p></div></div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
