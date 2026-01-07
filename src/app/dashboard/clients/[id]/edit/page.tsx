
'use client';

import React, { useEffect, useState, useMemo, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation"
import { format, parseISO } from 'date-fns';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Info, Loader2, User, X, LayoutGrid, List, Search, Layers, MoreHorizontal, Eye, Edit, Archive, ArchiveRestore, Trash2, PlusCircle, Download, Upload, ChevronDown, Copy, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getClient, updateClient, getRequests, getArchivedRequests, type Request as RequestType, duplicateRequest, softDeleteRequest, forceDeleteRequest, restoreRequest } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"

const clientFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  companies: z.array(z.string()).optional(),
  phone_number: z.string().nullable().optional(),
  app_language: z.string().optional(),
  date_format: z.string().optional(),
  time_zone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}


function EditClientPageComponent() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [companyInput, setCompanyInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [allRequests, setAllRequests] = useState<RequestType[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    
    const initialTab = searchParams.get('tab') || 'requests';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [dataVersion, setDataVersion] = useState(0);

    const [requestToArchive, setRequestToArchive] = useState<RequestType | null>(null);
    const [requestToRestore, setRequestToRestore] = useState<RequestType | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<RequestType | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const id = params.id as string;

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            full_name: "",
            email: "",
            companies: [],
            phone_number: "",
            app_language: "english",
            date_format: "mm/dd/yyyy",
            time_zone: "ist",
        }
    });

    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        
        if (!id) return;

        async function fetchClientData() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/login');
                return;
            }

            try {
                const [fetchedClient, requestsData, archivedRequestsData] = await Promise.all([
                    getClient(token, id),
                    getRequests(token),
                    getArchivedRequests(token)
                ]);
                
                form.reset(fetchedClient);
                const activeReqs = (requestsData.data || []).map(r => ({...r, deleted_at: null}));
                const archivedReqs = (archivedRequestsData.data || []).map(r => ({...r, deleted_at: r.deleted_at || new Date().toISOString()}));
                setAllRequests([...activeReqs, ...archivedReqs]);

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
    }, [id, router, toast, form, dataVersion]);

    const canManageRequests = userRole === 'Administrator' || userRole === 'Editor';

    const { isSubmitting } = form.formState;

    async function onSubmit(data: ClientFormValues) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
            return;
        }

        try {
            await updateClient(token, id, data);
            toast({ title: "Success", description: "Client updated successfully." });
            router.push('/dashboard/clients');
            router.refresh(); 
        } catch (error: any) {
             const description = error.errors
                ? Object.values(error.errors).flat().join("\n")
                : error.message || "Could not update client.";
            toast({
                title: "Client Update Failed",
                description: description,
                variant: "destructive",
            });
        }
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push(`${pathname}?tab=${tab}`, { scroll: false });
    };
    
    const handleDuplicate = async (requestId: number) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        toast({ title: 'Duplicating request...', description: 'Please wait.'});
        try {
            await duplicateRequest(token, requestId);
            toast({ title: 'Success', description: 'Request duplicated successfully.' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error duplicating request', description: err.message });
        }
    };
    
    const handleArchive = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !requestToArchive) return;
        try {
            await softDeleteRequest(token, requestToArchive.id);
            toast({ title: 'Request archived' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error archiving request', description: err.message });
        } finally {
            setRequestToArchive(null);
        }
    };
    
    const handleRestore = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !requestToRestore) return;
        try {
            await restoreRequest(token, requestToRestore.id);
            toast({ title: 'Request restored' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error restoring request', description: err.message });
        } finally {
            setRequestToRestore(null);
        }
    };

    const handleForceDelete = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !requestToForceDelete) return;
        try {
            await forceDeleteRequest(token, requestToForceDelete.id);
            toast({ title: 'Request permanently deleted' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting request', description: err.message });
        } finally {
            setRequestToForceDelete(null);
        }
    };

    const companies = form.watch("companies", []);
    const fullName = form.watch("full_name");
    const email = form.watch("email");

    const clientRequests = useMemo(() => {
        return allRequests.filter(req => 
            Array.isArray(req.client_id) && req.client_id.includes(Number(id))
        );
    }, [allRequests, id]);
    
    const filteredRequests = useMemo(() => {
        if (!searchQuery) return clientRequests;
        return clientRequests.filter(req => req.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [clientRequests, searchQuery]);


    const handleCompanyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && companyInput.trim()) {
            e.preventDefault();
            const newCompany = companyInput.trim();
            if (!companies.includes(newCompany)) {
                form.setValue("companies", [...companies, newCompany]);
            }
            setCompanyInput("");
        }
    };

    const removeCompany = (companyToRemove: string) => {
        form.setValue("companies", companies.filter(company => company !== companyToRemove));
    };

    const initials = getInitials(fullName);
    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    if (isLoading) {
        return (
             <div className="flex flex-col h-full bg-white">
                <header className="sticky top-16 bg-white z-10">
                    <div className="h-16 flex items-center justify-between px-6 border-b">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex items-center gap-2">
                             <Skeleton className="h-9 w-24" />
                             <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                </header>
                 <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-xl mx-auto space-y-8">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-24 w-24 rounded-full" />
                             <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-5 w-28" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                 </main>
            </div>
        )
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-muted/40">
                    <header className="sticky top-16 bg-white z-10">
                        <div className="h-16 flex items-center justify-between px-6 border-b">
                            <div className="w-1/3">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/dashboard/clients">
                                        <ChevronLeft className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="w-1/3 text-center">
                                <h1 className="text-sm font-semibold">{fullName}</h1>
                                <p className="text-xs text-muted-foreground">{email}</p>
                            </div>
                            <div className="w-1/3 flex justify-end items-center gap-2">
                                {activeTab === 'requests' ? (
                                    <>
                                        <span className="text-sm text-muted-foreground">View:</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="text-pink-600 border-pink-200">
                                                    <ViewIcon className="mr-2 h-4 w-4" />
                                                    {viewMode === 'grid' ? 'Grid' : 'List'}
                                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search requests..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        </div>
                                    </>
                                ) : activeTab === 'client-details' ? (
                                    <>
                                        <Button variant="outline" type="button" asChild className="text-gray-700 font-semibold border-gray-300">
                                            <Link href="/dashboard/clients">CANCEL</Link>
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            SAVE
                                        </Button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-transparent mb-6">
                                <TabsTrigger value="requests" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">REQUESTS</TabsTrigger>
                                <TabsTrigger value="client-portal" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">CLIENT PORTAL</TabsTrigger>
                                <TabsTrigger value="client-details" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">CLIENT DETAILS</TabsTrigger>
                            </TabsList>
                            <TabsContent value="requests">
                                <div className="w-full">
                                    {viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {filteredRequests.map(req => (
                                                <RequestCard key={req.id} request={req} clientName={fullName} clientInitials={initials} onArchive={setRequestToArchive} onRestore={setRequestToRestore} onForceDelete={setRequestToForceDelete} onDuplicate={handleDuplicate} canManage={canManageRequests} />
                                            ))}
                                            {canManageRequests && (
                                                <Card className="border-2 border-dashed bg-transparent shadow-none flex flex-col items-center justify-center min-h-[300px]">
                                                    <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                                                    <Layers className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20" asChild>
                                                    <Link href={`/dashboard/requests/new?clientId=${id}`}>ADD NEW REQUEST</Link>
                                                    </Button>
                                                </Card>
                                            )}
                                        </div>
                                    ) : (
                                        <Card>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Request Title</TableHead>
                                                        <TableHead>Due Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRequests.map(req => (
                                                        <RequestRow key={req.id} request={req} onArchive={setRequestToArchive} onRestore={setRequestToRestore} onForceDelete={setRequestToForceDelete} onDuplicate={handleDuplicate} canManage={canManageRequests} />
                                                    ))}
                                                    {canManageRequests && (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="py-4">
                                                                <Link href={`/dashboard/requests/new?clientId=${id}`} className="text-primary hover:underline text-sm font-medium">
                                                                    Add new request...
                                                                </Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="client-portal">
                                <div className="max-w-2xl mx-auto text-center py-16">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">You haven't added any files for this client yet</h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto">
                                        Client Portal gives your clients one easy place to access the files you've shared with them - anytime, without sending you yet another email.
                                    </p>
                                    <p className="text-muted-foreground max-w-lg mx-auto mt-4">
                                        Upload anything you like: invoices, completed docs, past advice, communication, and more.
                                    </p>
                                    <p className="text-muted-foreground max-w-lg mx-auto mt-4">
                                        Everything's in one spot, ready to download on demand.
                                    </p>
                                    <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700 text-base font-bold rounded-full">
                                        UPLOAD YOUR FIRST FILES HERE
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="client-details">
                                <Card className="max-w-xl mx-auto">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl font-bold border">
                                                    {initials || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-lg">{fullName}</p>
                                                <Button variant="link" type="button" className="text-pink-600 font-semibold p-0 h-auto">Change Image</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="full_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="fullName" className="font-semibold text-gray-700">Full Name</Label>
                                                        <FormControl><Input id="fullName" className="bg-gray-50 mt-1" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="emailAddress" className="font-semibold text-gray-700">Email Address</Label>
                                                        <FormControl><Input id="emailAddress" type="email" className="bg-gray-50 mt-1" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div>
                                                <Label htmlFor="companyName" className="font-semibold text-gray-700">Company Name (optional)</Label>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {companies?.map((company, index) => (
                                                        <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                                                            {company}
                                                            <button type="button" onClick={() => removeCompany(company)} className="ml-1.5 rounded-full hover:bg-gray-300/50 p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    id="companyName"
                                                    value={companyInput}
                                                    onChange={(e) => setCompanyInput(e.target.value)}
                                                    onKeyDown={handleCompanyKeyDown}
                                                    placeholder="Type a company name and press Enter..."
                                                    className="bg-gray-50 mt-2"
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="phone_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="phoneNumber" className="font-semibold text-gray-700">Phone Number (optional)</Label>
                                                        <div className="flex items-center mt-1">
                                                            <Select defaultValue="us">
                                                                <SelectTrigger className="w-[80px] rounded-r-none bg-gray-50"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="in">🇮🇳</SelectItem>
                                                                    <SelectItem value="us">🇺🇸</SelectItem>
                                                                    <SelectItem value="gb">🇬🇧</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormControl>
                                                                <Input id="phoneNumber" type="tel" placeholder="(415) 555-1212" className="rounded-l-none bg-gray-50" {...field} value={field.value ?? ''} />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="app_language"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="appLanguage" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                                            Application Language <Info className="w-4 h-4 text-gray-400" />
                                                        </Label>
                                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                            <FormControl><SelectTrigger id="appLanguage" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="english">English</SelectItem>
                                                                <SelectItem value="spanish">Spanish</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="date_format"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="dateFormat" className="flex items-center gap-1.5 font-semibold text-gray-700">Date Format <Info className="w-4 h-4 text-gray-400" /></Label>
                                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                            <FormControl><SelectTrigger id="dateFormat" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                                                                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                                                                <SelectItem value="yyyy/mm/dd">YYYY/MM/DD</SelectItem>
                                                                <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                                                                <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                                                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                                                                <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                                                                <SelectItem value="yyyy.mm.dd">YYYY.MM.DD</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="time_zone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Label htmlFor="timeZone" className="flex items-center gap-1.5 font-semibold text-gray-700">Time Zone <Info className="w-4 h-4 text-gray-400" /></Label>
                                                        <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                                            <FormControl><SelectTrigger id="timeZone" className="bg-gray-50 mt-1"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="ist">(+05:30) India Standard Time</SelectItem>
                                                                <SelectItem value="pst">(-08:00) Pacific Standard Time</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </form>
            </Form>
            
            <AlertDialog open={!!requestToArchive} onOpenChange={(open) => !open && setRequestToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Archive Request?</AlertDialogTitle><AlertDialogDescription>This will move the request to the archive. You can restore it later.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!requestToRestore} onOpenChange={(open) => !open && setRequestToRestore(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Restore Request?</AlertDialogTitle><AlertDialogDescription>This will move the request back to the active list.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!requestToForceDelete} onOpenChange={(open) => !open && setRequestToForceDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All data for this request will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleForceDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

const RequestCard = ({ request, clientName, clientInitials, onDuplicate, onArchive, onRestore, onForceDelete, canManage }: { request: RequestType, clientName: string, clientInitials: string, onDuplicate: (id: number) => void, onArchive: (req: RequestType) => void, onRestore: (req: RequestType) => void, onForceDelete: (req: RequestType) => void, canManage: boolean }) => {
    const isPublished = request.status === 'published';
    const isArchived = !!request.deleted_at;
    const enableHoverEffect = canManage || isArchived;
    const canDeletePermanently = canManage;

    return (
        <Card className={cn("flex flex-col shadow-sm", enableHoverEffect && "group")}>
            <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 text-sm"><AvatarFallback className="bg-pink-100 text-pink-700">{clientInitials}</AvatarFallback></Avatar>
                        <div>
                            <p className="font-semibold">{clientName}</p>
                            <p className="text-xs text-muted-foreground">Client</p>
                        </div>
                    </div>
                     {(canManage || isArchived) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {isArchived ? (
                                    <>
                                        <DropdownMenuItem onSelect={() => onRestore(request)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                                        {canDeletePermanently && <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>}
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/requests/${request.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link></DropdownMenuItem>
                                        {request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                                        <DropdownMenuItem onClick={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onArchive(request)}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-3 relative min-h-[120px]">
                <div className={cn("transition-opacity duration-200", enableHoverEffect && "group-hover:opacity-0")}>
                    <h3 className="font-bold">{request.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</p>
                </div>
                 {enableHoverEffect && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-card/80">
                         {isArchived ? (
                             <>
                                <Button size="sm" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700" onClick={() => onRestore(request)}>RESTORE</Button>
                                {canDeletePermanently && (
                                    <Button variant="destructive" size="sm" className="rounded-full px-8" onClick={() => onForceDelete(request)}>DELETE PERMANENTLY</Button>
                                )}
                             </>
                         ) : isPublished ? (
                            <Button size="sm" className="rounded-full px-8" asChild>
                                <Link href={`/dashboard/requests/${request.id}`}>VIEW REQUEST</Link>
                            </Button>
                         ) : (
                            canManage ? (
                                <>
                                    <Button variant="outline" size="sm" className="rounded-full px-8 bg-white" asChild><Link href={`/dashboard/requests/edit/${request.id}/preview`}>PREVIEW</Link></Button>
                                    <Button size="sm" className="rounded-full px-8" asChild><Link href={`/dashboard/requests/edit/${request.id}/finalize`}>PUBLISH</Link></Button>
                                </>
                            ) : (
                                 <Button size="sm" className="rounded-full px-8" asChild>
                                    <Link href={`/dashboard/requests/${request.id}`}>VIEW REQUEST</Link>
                                </Button>
                            )
                         )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
                 <Badge variant="outline" className={cn("capitalize", 
                    isArchived ? "bg-red-100 text-red-800" :
                    isPublished ? "bg-cyan-100 text-cyan-800" : "bg-gray-100 text-gray-800")}>
                    {isArchived ? 'archived' : request.status}
                </Badge>
            </CardFooter>
        </Card>
    );
};

const RequestRow = ({ request, onArchive, onRestore, onForceDelete, onDuplicate, canManage }: { request: RequestType, onArchive: (req: RequestType) => void, onRestore: (req: RequestType) => void, onForceDelete: (req: RequestType) => void, onDuplicate: (id: number) => void, canManage: boolean }) => {
    const isArchived = !!request.deleted_at;
    const canDeletePermanently = canManage;
    
    return (
        <TableRow>
            <TableCell className="font-medium">{request.title}</TableCell>
            <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
            <TableCell>
                <Badge variant="outline" className={cn("capitalize", 
                    isArchived ? "bg-red-100 text-red-800" :
                    request.status === 'published' ? "bg-cyan-100 text-cyan-800" : "bg-gray-100 text-gray-800")}>
                    {isArchived ? 'archived' : request.status}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {isArchived ? (
                            <>
                                <DropdownMenuItem onClick={() => onRestore(request)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                                {canDeletePermanently && <DropdownMenuItem onClick={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>}
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem asChild><Link href={`/dashboard/requests/${request.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link></DropdownMenuItem>
                                {request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onArchive(request)}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};


export default function EditClientPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <EditClientPageComponent />
        </Suspense>
    )
}
