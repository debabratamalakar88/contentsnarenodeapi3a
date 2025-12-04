
'use client';

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
    Filter
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  getRequests, 
  getClients, 
  getArchivedRequests,
  softDeleteRequest,
  restoreRequest,
  forceDeleteRequest,
  duplicateRequest,
  getTeamMembers,
  type Request, 
  type Client,
  type TeamMember,
  getProfile,
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
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
    isArchived: boolean;
    canManage: boolean;
    currentUser: UserType | null;
    userRole: string | null;
}

const RequestCard = ({ request, clientMap, onDuplicate, onArchive, onRestore, onForceDelete, isArchived, canManage, currentUser, userRole }: RequestCardProps) => {
    const clientName = request.client_id && request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    const additionalClientsCount = request.client_id ? request.client_id.length - 1 : 0;
    
    const enableHoverEffect = canManage || !isArchived;

    const showActions = canManage || !isArchived;
    const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && request.created_by === currentUser?.id);

    return (
        <Card className={cn("bg-white hover:shadow-md transition-shadow flex flex-col", enableHoverEffect && 'group')}>
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
                        <p className="text-sm font-semibold truncate">
                           {clientName}
                           {additionalClientsCount > 0 && ` +${additionalClientsCount}`}
                        </p>
                        <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                 </div>
                {showActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
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
                                    <DropdownMenuItem asChild>
                                        <Link href={request.status === 'published' ? `/dashboard/requests/${request.id}` : `/dashboard/requests/${request.id}/preview`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {request.status === 'published' ? 'View Details' : 'Preview'}
                                        </Link>
                                    </DropdownMenuItem>
                                    {canManage && request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                                    {canManage && <DropdownMenuItem onSelect={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>}
                                    {canManage && (
                                      <>
                                        <DropdownMenuItem onSelect={() => onArchive(request)}><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                </>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col relative min-h-[120px]">
                <div className={cn("transition-opacity duration-200", enableHoverEffect && "group-hover:opacity-0")}>
                    <h3 className="font-bold mb-1 mt-4">{request.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'Not set'}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>
                </div>
                {enableHoverEffect && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         {isArchived ? (
                            <>
                                <Button size="sm" className="rounded-full px-8" onClick={() => onRestore(request)}>RESTORE</Button>
                                {canDeletePermanently && (
                                    <Button variant="destructive" size="sm" className="rounded-full px-8" onClick={() => onForceDelete(request)}>DELETE PERMANENTLY</Button>
                                )}
                            </>
                         ) : request.status === 'published' ? (
                            <Button size="sm" className="rounded-full px-8" asChild>
                                <Link href={`/dashboard/requests/${request.id}`}>VIEW REQUEST</Link>
                            </Button>
                         ) : (
                            canManage ? (
                                <>
                                    <Button variant="outline" size="sm" className="rounded-full px-8 bg-white" asChild><Link href={`/dashboard/requests/${request.id}/preview`}>PREVIEW</Link></Button>
                                    <Button size="sm" className="rounded-full px-8" asChild><Link href={`/dashboard/requests/edit/${request.id}/finalize`}>PUBLISH</Link></Button>
                                </>
                            ) : (
                                <Button size="sm" className="rounded-full px-8" asChild>
                                    <Link href={`/dashboard/requests/${request.id}/preview`}>PREVIEW</Link>
                                </Button>
                            )
                         )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 border-t">
                 {isArchived ? (
                    <Badge className="capitalize font-semibold bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Archived</Badge>
                ) : (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "capitalize font-semibold", 
                            request.status === 'published' && 'bg-green-100 text-green-800 border-green-200'
                        )}
                    >
                        {request.status}
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
};

interface RequestRowProps {
    request: Request;
    clientMap: Map<number, string>;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
    isArchived: boolean;
    canManage: boolean;
    currentUser: UserType | null;
    userRole: string | null;
}

const RequestRow = ({ request, clientMap, onDuplicate, onArchive, onRestore, onForceDelete, isArchived, canManage, currentUser, userRole }: RequestRowProps) => {
    const clientName = request.client_id && request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    const additionalClientsCount = request.client_id ? request.client_id.length - 1 : 0;
    const showActions = canManage || !isArchived;
    const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && request.created_by === currentUser?.id);
    
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
            <span className="truncate">
                {clientName}
                {additionalClientsCount > 0 && (
                    <span className="text-muted-foreground"> +{additionalClientsCount}</span>
                )}
            </span>
            </div>
        </TableCell>
        <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
        <TableCell>
            {isArchived ? (
                <Badge className="capitalize font-semibold bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Archived</Badge>
            ) : (
                <Badge 
                    variant="outline"
                    className={cn(
                        "capitalize font-semibold", 
                        request.status === 'published' && 'bg-green-100 text-green-800 border-green-200'
                    )}
                >
                    {request.status}
                </Badge>
            )}
        </TableCell>
        <TableCell>
            {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                            <DropdownMenuItem asChild>
                                <Link href={request.status === 'published' ? `/dashboard/requests/${request.id}` : `/dashboard/requests/${request.id}/preview`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {request.status === 'published' ? 'View Details' : 'Preview'}
                                </Link>
                            </DropdownMenuItem>
                            {canManage && request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/dashboard/requests/edit/${request.id}/essentials`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                            {canManage && <DropdownMenuItem onSelect={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>}
                            {canManage && (
                              <>
                                <DropdownMenuItem onSelect={() => onArchive(request)}><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                </DropdownMenuItem>
                              </>
                            )}
                        </>
                     )}
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
        </TableCell>
    </TableRow>
    );
};

export default function RequestsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [allRequests, setAllRequests] = useState<Request[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);

    const [requestToArchive, setRequestToArchive] = useState<Request | null>(null);
    const [requestToRestore, setRequestToRestore] = useState<Request | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<Request | null>(null);
    
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOwnerId, setSelectedOwnerId] = useState('all');
    const [selectedClientId, setSelectedClientId] = useState('all');


    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                const [clientsResponse, profileResponse, requestsResponse, archivedResponse, teamMembersResponse] = await Promise.all([
                    getClients(token),
                    getProfile(token),
                    getRequests(token),
                    getArchivedRequests(token),
                    getTeamMembers(token),
                ]);

                setClients(clientsResponse || []);
                setCurrentUser(profileResponse.user || profileResponse.data || profileResponse);
                setTeamMembers(teamMembersResponse || []);

                const active = requestsResponse.data || [];
                const archived = archivedResponse.data || [];

                const combinedRequests = [...active, ...archived].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setAllRequests(combinedRequests);

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
    }, [router, toast, dataVersion]);
    
    const canManageRequests = userRole === 'Administrator' || userRole === 'Editor';

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.full_name])), [clients]);
    const ownerMap = useMemo(() => new Map(teamMembers.map(m => [m.id, m.name])), [teamMembers]);

    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    const handleDuplicate = async (requestId: number) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        toast({ title: 'Duplicating request...', description: 'Please wait.'});
        try {
            await duplicateRequest(token, requestId);
            toast({ title: 'Success', description: 'Request duplicated successfully. You can find the copy in your drafts.' });
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

    const filteredRequests = useMemo(() => allRequests.filter(request => {
      const clientNames = (request.client_id || []).map(id => clientMap.get(id) || '').join(' ').toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      const searchMatch = (
        request.title.toLowerCase().includes(searchLower) ||
        (request.description && request.description.toLowerCase().includes(searchLower)) ||
        clientNames.includes(searchLower)
      );

      const status = request.deleted_at ? 'archived' : request.status;
      const statusMatch = selectedStatus === 'all' || status === selectedStatus;
      
      const ownerMatch = selectedOwnerId === 'all' || String(request.created_by) === selectedOwnerId;
      
      const clientMatch = selectedClientId === 'all' || (request.client_id && request.client_id.includes(Number(selectedClientId)));
      
      return searchMatch && statusMatch && ownerMatch && clientMatch;
    }), [allRequests, searchQuery, clientMap, selectedStatus, selectedOwnerId, selectedClientId]);

    const requestStatuses = ['draft', 'published', 'scheduled', 'completed', 'archived'];
    const selectedStatusName = selectedStatus === 'all' ? 'All Statuses' : requestStatuses.find(s => s === selectedStatus) || 'All Statuses';
    const selectedOwnerName = selectedOwnerId === 'all' ? 'All Owners' : ownerMap.get(Number(selectedOwnerId)) || 'All Owners';
    const selectedClientName = selectedClientId === 'all' ? 'All Clients' : clientMap.get(Number(selectedClientId)) || 'All Clients';

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
        if (filteredRequests.length === 0) {
            const message = searchQuery ? `No requests found for "${searchQuery}"` : "No requests yet";
            
            const description = searchQuery
                ? "Try a different search term."
                : "Get started by creating your first content request.";

            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10 bg-background rounded-lg border-2 border-dashed">
                    <h3 className="text-2xl font-bold tracking-tight mb-2">
                        {message}
                    </h3>
                    <p className="text-sm mb-4">
                       {description}
                    </p>
                    {!searchQuery && canManageRequests && (
                        <Button asChild>
                            <Link href="/dashboard/requests/new"><PlusCircle className="mr-2 h-4 w-4"/>Create Request</Link>
                        </Button>
                    )}
                </div>
            );
        }
        const viewProps = {
            requests: filteredRequests,
            clientMap,
            onDuplicate: handleDuplicate,
            onArchive: setRequestToArchive,
            onRestore: setRequestToRestore,
            onForceDelete: setRequestToForceDelete,
            canManage: canManageRequests,
            currentUser: currentUser,
            userRole: userRole,
        };
        return viewMode === 'grid' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredRequests.map(request => (
                    <RequestCard key={request.id} {...viewProps} request={request} isArchived={!!request.deleted_at} />
                ))}
                {canManageRequests && (
                  <Link href="/dashboard/requests/new">
                      <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[290px] h-full">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                            <Layers className="h-8 w-8 text-slate-400" />
                        </div>
                        <Button variant="ghost" className="pointer-events-none text-primary bg-primary/10 hover:bg-primary/20">
                            ADD NEW REQUEST
                        </Button>
                      </Card>
                  </Link>
                )}
            </div>
        ) : (
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Request Name</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Client Name</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Due Date</TableHead>
                            <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.map((request) => (
                           <RequestRow key={request.id} {...viewProps} request={request} isArchived={!!request.deleted_at} />
                        ))}
                        {canManageRequests && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-2">
                                    <Link href="/dashboard/requests/new" className="text-primary hover:underline text-sm font-medium">
                                        Add new request...
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full bg-muted/40">
                <header className="sticky top-16 z-10 flex items-center justify-between gap-4 px-6 py-3 border-b bg-background flex-wrap">
                    <h1 className="text-xl font-bold">Requests</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">View:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary h-9">
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
                         {canManageRequests && (
                            <Button asChild className="h-9">
                                <Link href="/dashboard/requests/new"><PlusCircle className="h-4 w-4 mr-2"/>New Request</Link>
                            </Button>
                        )}
                    </div>
                </header>
                 <header className="sticky top-[112px] z-10 flex items-center gap-4 px-6 py-3 border-b bg-card flex-wrap">
                    <div className="flex items-center gap-2 flex-grow">
                        <span className="text-sm font-semibold text-muted-foreground">Filter by:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="h-8"><Filter className="mr-2 h-4 w-4 text-muted-foreground"/>{selectedStatusName}<ChevronDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent><DropdownMenuRadioGroup value={selectedStatus} onValueChange={setSelectedStatus}><DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem><DropdownMenuSeparator/>{requestStatuses.map(status => <DropdownMenuRadioItem key={status} value={status} className="capitalize">{status}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="h-8"><User className="mr-2 h-4 w-4 text-muted-foreground"/>{selectedOwnerName}<ChevronDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent><DropdownMenuRadioGroup value={selectedOwnerId} onValueChange={setSelectedOwnerId}><DropdownMenuRadioItem value="all">All Owners</DropdownMenuRadioItem><DropdownMenuSeparator/>{teamMembers.map(member => <DropdownMenuRadioItem key={member.id} value={String(member.id)}>{member.name}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="h-8"><Users className="mr-2 h-4 w-4 text-muted-foreground"/>{selectedClientName}<ChevronDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent><DropdownMenuRadioGroup value={selectedClientId} onValueChange={setSelectedClientId}><DropdownMenuRadioItem value="all">All Clients</DropdownMenuRadioItem><DropdownMenuSeparator/>{clients.map(client => <DropdownMenuRadioItem key={client.id} value={String(client.id)}>{client.full_name}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                     <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search requests..." className="pl-9 h-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            
            <AlertDialog open={!!requestToArchive} onOpenChange={(open) => !open && setRequestToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Archive Request?</AlertDialogTitle><AlertDialogDescription>This will move the request to the archive. You can restore it later.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!requestToRestore} onOpenChange={(open) => !open && setRequestToRestore(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Restore Request?</AlertDialogTitle><AlertDialogDescription>This will move the request back to your active list.</AlertDialogDescription></AlertDialogHeader>
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
