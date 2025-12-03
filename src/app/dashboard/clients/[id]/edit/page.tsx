
'use client'

import { useEffect, useState, useMemo, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { format, parseISO } from 'date-fns';
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Info, Loader2, User, X, LayoutGrid, List, Search, Layers, MoreHorizontal, Eye, Edit, Archive, ArchiveRestore, Trash2, PlusCircle, Download, Upload, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getClient, updateClient, getRequests, type Request as RequestType } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import placeholderImages from '@/app/lib/placeholder-images.json'

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


const RequestCard = ({ request, clientName, clientInitials }: { request: RequestType, clientName: string, clientInitials: string }) => {
    const isPublished = request.status === 'published';
    return (
        <Card className="flex flex-col shadow-sm">
            <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 text-sm"><AvatarFallback className="bg-pink-100 text-pink-700">{clientInitials}</AvatarFallback></Avatar>
                        <div>
                            <p className="font-semibold">{clientName}</p>
                            <p className="text-xs text-muted-foreground">Client</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>View</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-3">
                <h3 className="font-bold text-lg">{request.title}</h3>
                <p className="text-sm text-muted-foreground">Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</p>
                <Progress value={0} className="h-2" />
                <div className="grid grid-cols-3 text-center">
                    <div><p className="font-bold text-lg">0</p><p className="text-xs text-muted-foreground">Approved</p></div>
                    <div><p className="font-bold text-lg">0</p><p className="text-xs text-muted-foreground">Complete</p></div>
                    <div><p className="font-bold text-lg">37</p><p className="text-xs text-muted-foreground">To Do</p></div>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
                <Badge className={cn("capitalize", isPublished ? "bg-cyan-100 text-cyan-800" : "bg-gray-100 text-gray-800")}>{request.status}</Badge>
                {request.communication_mode && <Info className="h-4 w-4 text-muted-foreground" />}
            </CardFooter>
        </Card>
    );
};

function EditClientPageComponent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [companyInput, setCompanyInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [allRequests, setAllRequests] = useState<RequestType[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    
    const initialTab = searchParams.get('tab') || 'requests';
    const [activeTab, setActiveTab] = useState(initialTab === 'client-details' ? initialTab : 'requests');

    const id = Number(params.id);

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

    useEffect(() => {
        if (!id) return;

        async function fetchClientData() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/login');
                return;
            }

            try {
                const [fetchedClient, requestsData] = await Promise.all([
                    getClient(token, id),
                    getRequests(token),
                ]);
                
                form.reset(fetchedClient);
                setAllRequests(requestsData.data || []);
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
    }, [id, router, toast, form]);

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

    const companies = form.watch("companies", []);
    const fullName = form.watch("full_name");
    const email = form.watch("email");

    const clientRequests = useMemo(() => {
        return allRequests.filter(req => 
            Array.isArray(req.client_id) && req.client_id.includes(id)
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
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-transparent mb-6">
                            <TabsTrigger value="requests" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">REQUESTS</TabsTrigger>
                            <TabsTrigger value="client-portal" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">CLIENT PORTAL</TabsTrigger>
                            <TabsTrigger value="client-details" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 rounded-none">CLIENT DETAILS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="requests">
                            <div className="w-full">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredRequests.map(req => (
                                        <RequestCard key={req.id} request={req} clientName={fullName} clientInitials={initials} />
                                    ))}
                                    <Card className="border-2 border-dashed bg-transparent shadow-none flex flex-col items-center justify-center min-h-[300px]">
                                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                                          <Layers className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">ADD NEW REQUEST</Button>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="client-portal">
                            <div className="max-w-2xl mx-auto text-center py-16">
                                <Image
                                    src={placeholderImages.clientPortalEmpty.src}
                                    alt={placeholderImages.clientPortalEmpty.alt}
                                    width={250}
                                    height={250}
                                    className="mx-auto mb-8"
                                    data-ai-hint={placeholderImages.clientPortalEmpty['data-ai-hint']}
                                />
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
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                                    <Select onValueChange={field.onChange} value={field.value}>
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
    )
}

export default function EditClientPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <EditClientPageComponent />
        </Suspense>
    )
}
