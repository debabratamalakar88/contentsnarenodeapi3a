
'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminUser, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Mail, Phone, Building, CheckCircle, XCircle, Calendar as CalendarIcon, ShieldCheck, ShieldX } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function UserViewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const id = Number(params.id);

    useEffect(() => {
        if (!id) {
            router.push('/admin/dashboard/users');
            return;
        }

        async function fetchUser() {
            const token = localStorage.getItem('adminAuthToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/admin/login');
                return;
            }

            try {
                const fetchedUser = await getAdminUser(token, id);
                setUser(fetchedUser);
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching user',
                    description: err.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, [id, router, toast]);

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <header className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <Skeleton className="h-9 w-9" />
                         <Skeleton className="h-6 w-48" />
                     </div>
                     <Skeleton className="h-9 w-24" />
                </header>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-48" />
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!user) {
        return <div className="p-6 text-center">User not found.</div>;
    }

    const isArchived = !!user.deleted_at;

    return (
        <div className="p-8 space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/dashboard/users">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">User Details</h1>
                </div>
                {!isArchived && (
                    <Button asChild>
                        <Link href={`/admin/dashboard/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                        </Link>
                    </Button>
                )}
            </header>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 text-4xl">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Contact & Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                             <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">{user.phone || 'N/A'}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Company</p>
                                <p className="text-sm text-muted-foreground">{user.company || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Joined On</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.created_at ? format(parseISO(user.created_at), 'PPP') : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             {user.email_verified_at ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Email Verification</p>
                                <p className="text-sm text-muted-foreground">
                                     {user.email_verified_at ? `Verified on ${format(parseISO(user.email_verified_at), 'PPP')}` : 'Not Verified'}
                                </p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                             {isArchived ? (
                                <ShieldX className="h-5 w-5 text-red-500" />
                            ) : (
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Account Status</p>
                                <p className="text-sm text-muted-foreground">
                                     {isArchived ? 'Archived' : 'Active'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bio</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground">{user.bio || 'No bio provided.'}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
