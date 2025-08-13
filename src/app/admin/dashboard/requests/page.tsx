
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
    PlusCircle,
    Copy,
    Archive as ArchiveIcon,
    ArchiveRestore,
    Trash2,
    Eye,
    PenSquare,
    FileText,
    CheckCircle,
    Building
} from "lucide-react"
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  DropdownMenuSeparator,
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getAdminAllRequests, 
  getAdminArchivedRequests,
  getAdminUsers,
  getAdminClients,
  type Request, 
  type Client,
  type User as UserType
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

interface RequestCardProps {
    request: Request;
    clientMap: Map<number, string>;
    userMap: Map<number, string>;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
    isArchived: boolean;
    canManage: boolean;
    currentUser: UserType | null;
    userRole: string | null;
}

const RequestCard = ({ request, clientMap, userMap, onDuplicate, onArchive, onRestore, onForceDelete, isArchived, canManage, currentUser, userRole }: RequestCardProps) => {
    const ownerName = userMap.get(request.user_id) || 'Unknown User';
    const clientName = request.client_id && request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    const additionalClientsCount = request.client_id ? request.client_id.length - 1 : 0;
    
    const showActions = canManage || !isArchived;
    const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && request.created_by === currentUser?.id);

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {clientName === "(No Client)" ? (
                            <Avatar className="h-10 w-10 border bg-muted">
                                <AvatarFallback className="bg-transparent">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <Avatar className="h-10 w-10 border"><AvatarFallback>{clientInitial}</AvatarFallback></Avatar>
                        )}
                        <div>
                            <p className="font-semibold">{clientName}{additionalClientsCount > 0 && <span className="text-muted-foreground"> +{additionalClientsCount}</span>}</p>
                            <p className="text-xs text-muted-foreground">Client</p>
                        </div>
                    </div>
                     {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                                {isArchived ? (
                                    <>
                                        <DropdownMenuItem onClick={() => onRestore(request)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                                        {canDeletePermanently && (
                                            <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild><Link href={`/admin/dashboard/requests/${request.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link></DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <h3 className="font-bold text-lg">{request.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{request.description}</p>
                 <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <p>Owner: {ownerName}</p>
                    <p>Company: {request.company?.company_name || 'N/A'}</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex flex-col items-start gap-3">
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <span>Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</span>
                    <Badge variant="outline" className="capitalize">{request.status}</Badge>
                </div>
                <div className="flex justify-between w-full">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{request.submissions_count || 0} Submissions</span>
                    </div>
                     <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/dashboard/requests/${request.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

interface RequestRowProps {
    request: Request;
    clientMap: Map<number, string>;
    userMap: Map<number, string>;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
    isArchived: boolean;
    canManage: boolean;
    currentUser: UserType | null;
    userRole: string | null;
}

const RequestRow = ({ request, clientMap, userMap, onDuplicate, onArchive, onRestore, onForceDelete, isArchived, canManage, currentUser, userRole }: RequestRowProps) => {
    const ownerName = userMap.get(request.user_id) || 'Unknown User';
    const companyName = request.company?.company_name || 'N/A';
    const clientName = request.client_id && request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const additionalClientsCount = request.client_id ? request.client_id.length - 1 : 0;
    
    const showActions = canManage || !isArchived;
    const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && request.created_by === currentUser?.id);
    
    return (
     <TableRow>
        <TableCell className="font-medium">{request.title}</TableCell>
        <TableCell>{ownerName}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                {companyName}
            </div>
        </TableCell>
        <TableCell>
            {clientName}
            {additionalClientsCount > 0 && <span className="text-muted-foreground ml-1">+{additionalClientsCount}</span>}
        </TableCell>
        <TableCell><Badge variant="outline" className="capitalize">{request.status}</Badge></TableCell>
        <TableCell>{request.submissions_count || 0}</TableCell>
        <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
        <TableCell>
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/dashboard/requests/${request.id}`}>View Details</Link>
            </Button>
        </TableCell>
    </TableRow>
    );
};

export default function AdminRequestsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [requests, setRequests] = useState<Request[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [currentTab, setCurrentTab] = useState('active');
    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;

    useEffect(() => {
        if (!token) {
            router.push('/admin/login');
            return;
        }

        async function loadData() {
            setIsLoading(true);
            try {
                const [requestsData, usersData, clientsData] = await Promise.all([
                    currentTab === 'active' ? getAdminAllRequests(token!) : getAdminArchivedRequests(token!),
                    getAdminUsers(token!),
                    getAdminClients(token!)
                ]);
                setRequests(requestsData.data || []);
                setAllUsers(usersData || []);
                setAllClients(clientsData || []);
            } catch (err: any) {
                toast({ title: "Error", description: err.message || "Could not fetch data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [router, toast, currentTab, dataVersion, token]);
    
    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
    
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.name])), [allUsers]);
    const clientMap = useMemo(() => new Map(allClients.map(c => [c.id, c.full_name])), [allClients]);

    const filteredRequests = useMemo(() => requests.filter(request => {
        const searchLower = searchQuery.toLowerCase();
        const userName = userMap.get(request.user_id)?.toLowerCase() || '';
        const companyName = request.company?.company_name.toLowerCase() || '';
        const clientNames = (request.client_id || []).map(id => clientMap.get(id) || '').join(' ').toLowerCase();

        return request.title.toLowerCase().includes(searchLower) ||
               userName.includes(searchLower) ||
               companyName.includes(searchLower) ||
               clientNames.includes(searchLower);
    }), [requests, searchQuery, userMap, clientMap]);

    const renderContent = (reqs: Request[]) => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            );
        }
        if (reqs.length === 0) {
            return (
                <div className="text-center py-20">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Requests Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        There are no {currentTab} requests to display.
                    </p>
                </div>
            )
        }
        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {reqs.map(req => <RequestCard key={req.id} request={req} userMap={userMap} clientMap={clientMap} onDuplicate={()=>{}} onArchive={()=>{}} onRestore={()=>{}} onForceDelete={()=>{}} isArchived={currentTab==='archived'} canManage={true} currentUser={null} userRole={null} />)}
                </div>
            )
        }
        return <RequestTable requests={reqs} userMap={userMap} clientMap={clientMap} />;
    }

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-wrap">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow">
                    <TabsList>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 font-semibold h-9">
                                <ViewIcon className="h-4 w-4" />
                                {viewMode === 'grid' ? 'Grid' : 'List'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search requests..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent(filteredRequests)}
            </main>
        </div>
    );
}

const RequestTable = ({ requests, userMap, clientMap }: { requests: Request[]; userMap: Map<number, string>; clientMap: Map<number, string> }) => {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Request Title</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Client(s)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map(request => {
                        const ownerName = userMap.get(request.user_id) || 'Unknown User';
                        const companyName = request.company?.company_name || 'N/A';
                        const clientIds = Array.isArray(request.client_id) ? request.client_id : [];
                        const firstClientName = clientIds.length > 0 ? clientMap.get(clientIds[0]) : '(No Client)';
                        const additionalClientCount = clientIds.length > 1 ? clientIds.length - 1 : 0;
                        
                        return (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.title}</TableCell>
                                <TableCell>{ownerName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        {companyName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {firstClientName}
                                    {additionalClientCount > 0 && <span className="text-muted-foreground ml-1">+{additionalClientCount}</span>}
                                </TableCell>
                                <TableCell><Badge variant="outline" className="capitalize">{request.status}</Badge></TableCell>
                                <TableCell>{request.submissions_count || 0}</TableCell>
                                <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/admin/dashboard/requests/${request.id}`}>View Details</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
