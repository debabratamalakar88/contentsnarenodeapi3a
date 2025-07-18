
'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminTemplateCategory, type TemplateCategory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, CalendarDays, Clock, PenSquare, ShieldCheck, ShieldX, Tag } from "lucide-react";
import { format, parseISO } from 'date-fns';

export default function CategoryViewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [category, setCategory] = useState<TemplateCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const id = Number(params.id);

    useEffect(() => {
        if (!id) {
            router.push('/admin/dashboard/template-categories');
            return;
        }

        async function fetchCategory() {
            const token = localStorage.getItem('adminAuthToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/admin/login');
                return;
            }

            try {
                const fetchedCategory = await getAdminTemplateCategory(token, id);
                setCategory(fetchedCategory);
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching category',
                    description: err.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchCategory();
    }, [id, router, toast]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-background">
                <header className="sticky top-0 bg-white z-10"><div className="h-16 flex items-center justify-between px-6 border-b"><div className="flex items-center gap-4"><Skeleton className="h-9 w-9" /><Skeleton className="h-6 w-48" /></div><Skeleton className="h-9 w-24" /></div></header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center gap-6"><Skeleton className="h-24 w-24 rounded-full" /><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-5 w-48" /></div></div>
                        <Card><CardHeader><Skeleton className="h-7 w-48" /></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-7 w-48" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    </div>
                </main>
            </div>
        )
    }

    if (!category) {
        return <div className="p-6 text-center">Category not found.</div>;
    }

    const isArchived = !!category.deleted_at;

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-0 bg-white z-10">
                <div className="h-16 flex items-center justify-between px-6 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/dashboard/template-categories">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-lg font-semibold">Category Details</h1>
                    </div>
                    {!isArchived && (
                        <Button asChild>
                            <Link href={`/admin/dashboard/template-categories/${category.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Category
                            </Link>
                        </Button>
                    )}
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full flex items-center justify-center bg-slate-100">
                             <div className="h-12 w-12 rounded-full" style={{ backgroundColor: category.color || 'hsl(var(--muted-foreground))' }} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">{category.title}</h2>
                            <p className="text-muted-foreground font-mono text-sm">{category.slug}</p>
                        </div>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="flex items-center gap-3"><Tag className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Slug</p><p className="text-sm text-muted-foreground font-mono">{category.slug}</p></div></div>
                             <div className="flex items-center gap-3">{isArchived ? <ShieldX className="h-5 w-5 text-red-500" /> : <ShieldCheck className="h-5 w-5 text-green-500" />}<div><p className="text-sm font-medium">Status</p><p className="text-sm text-muted-foreground">{isArchived ? 'Archived' : 'Active'}</p></div></div>
                             <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Created On</p><p className="text-sm text-muted-foreground">{category.created_at ? format(parseISO(category.created_at), 'PPP') : 'N/A'}</p></div></div>
                             <div className="flex items-center gap-3"><PenSquare className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm font-medium">Last Updated</p><p className="text-sm text-muted-foreground">{category.updated_at ? format(parseISO(category.updated_at), 'PPP') : 'N/A'}</p></div></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">{category.description || 'No description provided.'}</p></CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
