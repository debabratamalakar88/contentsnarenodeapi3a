
'use client'

import { 
    Users, 
    MoreHorizontal, 
    ChevronDown, 
    LayoutGrid, 
    Search,
    Layers,
    List,
    User,
    Mail,
    PlusCircle
} from "lucide-react"
import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton";
import { getRequests, getClients, type Request, type Client } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";


const FilterButton = ({ label, value }: { label: string; value: string }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 font-normal h-9">
                {label}: <span className="font-semibold">{value}</span> <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            <DropdownMenuItem>{value}</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

const RequestCard = ({ request, clientMap }: { request: Request, clientMap: Map<number, string> }) => {
    const clientName = request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    
    return (
        <Card className="bg-white hover:shadow-md transition-shadow flex flex-col group">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-2">
                     {clientName === "(No Client)" ? (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                     ) : (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-800">{clientInitial}</AvatarFallback>
                        </Avatar>
                     )}
                    <div>
                        <p className="text-sm font-semibold">{clientName}</p>
                        <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}>Edit</Link></DropdownMenuItem>
                         <DropdownMenuItem>Duplicate</DropdownMenuItem>
                         <DropdownMenuItem>Archive</DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col relative min-h-[120px]">
                <div className="transition-opacity duration-200 group-hover:opacity-0">
                    <h3 className="font-bold mb-1 mt-4">{request.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'Not set'}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <Button variant="outline" size="sm" className="rounded-full px-8 bg-white" asChild><Link href={`/dashboard/requests/edit/${request.id}/preview`}>PREVIEW</Link></Button>
                     <Button size="sm" className="rounded-full px-8" asChild><Link href={`/dashboard/requests/edit/${request.id}/finalize`}>PUBLISH</Link></Button>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <Badge variant="outline" className="font-semibold text-gray-600 bg-gray-100 capitalize">{request.status}</Badge>
            </CardFooter>
        </Card>
    )
}

const RequestRow = ({ request, clientMap }: { request: Request, clientMap: Map<number, string> }) => {
    const clientName = request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    
    return (
     <TableRow>
        <TableCell className="font-medium">{request.title}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
            {clientName === "(No Client)" ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            ) : (
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">{clientInitial}</AvatarFallback>
                </Avatar>
            )}
            <span>{clientName}</span>
            </div>
        </TableCell>
        <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
        <TableCell>
            <Badge variant="outline" className="capitalize">{request.status}</Badge>
        </TableCell>
        <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}>Edit</Link></DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
    )
}

const RequestsTable = ({ requests, clientMap }: { requests: Request[], clientMap: Map<number, string> }) => {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Request Name</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Client Name</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Due Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                       <RequestRow key={request.id} request={request} clientMap={clientMap} />
                    ))}
                    <TableRow>
                        <TableCell colSpan={5} className="py-2">
                            <Link href="/dashboard/requests/new" className="text-primary hover:underline text-sm font-medium">
                                Add new request...
                            </Link>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    )
}

const RequestsGrid = ({ requests, clientMap }: { requests: Request[], clientMap: Map<number, string> }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {requests.map(request => (
                <RequestCard key={request.id} request={request} clientMap={clientMap}/>
            ))}
            <Link href="/dashboard/requests/new">
                <div className="flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer border-2 border-dashed hover:border-primary/50 rounded-lg min-h-[290px] h-full text-muted-foreground">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                        <Layers className="h-8 w-8 text-slate-400" />
                    </div>
                    <Button variant="ghost" className="text-primary font-semibold bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg">
                        ADD NEW REQUEST
                    </Button>
                </div>
            </Link>
        </div>
    )
}


export default function RequestsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [requests, setRequests] = useState<Request[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        async function loadData() {
            setIsLoading(true);
            try {
                const [requestsResponse, clientsResponse] = await Promise.all([
                    getRequests(token),
                    getClients(token)
                ]);
                setRequests(requestsResponse.data || []);
                setClients(clientsResponse || []);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
                toast({
                    title: "Error",
                    description: err.message || "Could not fetch data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [router, toast]);

    const clientMap = new Map(clients.map(c => [c.id, c.full_name]));

    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    const renderLoadingSkeleton = () => (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}><CardHeader className="p-4 border-b"><Skeleton className="h-8 w-full" /></CardHeader><CardContent className="p-4 pt-4"><div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-2" /></div></CardContent><CardFooter className="p-4 border-t"><Skeleton className="h-6 w-1/4" /></CardFooter></Card>
                ))}
            </div>
        ) : (
            <Card>
                <Table>
                    <TableHeader>{[...Array(1)].map((_, i) => <TableRow key={i}>{[...Array(5)].map((_, j) => <TableHead key={j}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow>)}</TableHeader>
                    <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
                </Table>
            </Card>
        )
    );

    const renderContent = () => {
        if (isLoading) {
            return renderLoadingSkeleton();
        }
        if (error) {
            return <div className="text-center text-destructive py-10">{error}</div>;
        }
        if (requests.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10 bg-background rounded-lg border-2 border-dashed">
                    <h3 className="text-2xl font-bold tracking-tight mb-2">No requests found</h3>
                    <p className="text-sm mb-4">Get started by creating your first content request.</p>
                    <Button asChild>
                        <Link href="/dashboard/requests/new"><PlusCircle className="mr-2 h-4 w-4"/>Create Request</Link>
                    </Button>
                </div>
            );
        }
        return viewMode === 'grid' ? (
            <RequestsGrid requests={requests} clientMap={clientMap} />
        ) : (
            <RequestsTable requests={requests} clientMap={clientMap} />
        );
    }

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Group By:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 h-9">
                                <User className="h-4 w-4" />
                                Owner
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="start">
                            <DropdownMenuItem>Owner</DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Filter By:</span>
                    <FilterButton label="Status" value="All" />
                    <FilterButton label="Owner" value="Anyone" />
                    <FilterButton label="Client" value="All" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 h-9">
                                <ViewIcon className="h-4 w-4" />
                                {viewMode === 'grid' ? 'Grid' : 'List'}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search requests..." className="pl-9 h-9" />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    )
}

    