
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
    Building,
    CalendarClock,
    Send,
    Briefcase,
    Filter,
    Check
} from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
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
  softDeleteAdminRequest,
  restoreAdminRequest,
  forceDeleteAdminRequest,
  duplicateAdminRequest,
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

const statusStyles: { [key: string]: string } = {
  draft: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  published: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  archived: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  completed: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100",
};

const statusIcons = {
  draft: PenSquare,
  published: Send,
  scheduled: CalendarClock,
  archived: ArchiveIcon,
  completed: CheckCircle,
};

const StatusBadge = ({ status }: { status: Request['status'] | 'archived' }) => {
    const Icon = statusIcons[status] || FileText;
    return (
        <Badge variant="outline" className={cn("capitalize font-semibold", statusStyles[status])}>
            <Icon className="mr-1 h-3 w-3" />
            {status}
        </Badge>
    );
};


interface RequestCardProps {
    request: Request;
    clientMap: Map<number, string>;
    isArchived: boolean;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
}

const RequestCard = ({ request, clientMap, isArchived, onDuplicate, onArchive, onRestore, onForceDelete }: RequestCardProps) => {
    const ownerName = request.user?.name || 'Unknown User';
    const clientIds = Array.isArray(request.client_id) ? request.client_id : [];
    const clientName = clientIds.length > 0 ? clientMap.get(clientIds[0]) || "(No Client)" : "(No Client)";
    const clientInitial = getInitials(clientName);
    const additionalClientsCount = clientIds.length > 1 ? clientIds.length - 1 : 0;
    
    const viewUrl = request.status === 'draft' ? `/admin/dashboard/requests/preview/${request.id}` : `/admin/dashboard/requests/${request.id}`;

    const isPublished = request.status === 'published';

    return (
        <Card className="flex flex-col group">
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
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                             {isArchived ? (
                                <>
                                    <DropdownMenuItem onSelect={() => onRestore(request)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                                </>
                             ) : (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={viewUrl}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {request.status === 'draft' ? 'Preview' : 'View Details'}
                                        </Link>
                                    </DropdownMenuItem>
                                    {request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/admin/dashboard/requests/edit/${request.id}`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                                    <DropdownMenuItem onClick={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => onArchive(request)}><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                                </>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow relative">
                <div className="transition-opacity duration-200 group-hover:opacity-0">
                    <h3 className="font-bold text-lg">{request.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{request.description}</p>
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <p>Owner: {ownerName}</p>
                        <p>Company: {request.company?.company_name || 'N/A'}</p>
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/80">
                    {isArchived ? (
                        <>
                            <Button size="sm" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700" onClick={() => onRestore(request)}>RESTORE</Button>
                            <Button variant="destructive" size="sm" className="rounded-full px-8" onClick={() => onForceDelete(request)}>DELETE PERMANENTLY</Button>
                        </>
                    ) : isPublished ? (
                        <Button size="sm" className="rounded-full px-8" asChild>
                            <Link href={`/admin/dashboard/requests/${request.id}`}>VIEW REQUEST</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" className="rounded-full px-8 bg-white" asChild><Link href={`/admin/dashboard/requests/preview/${request.id}`}>PREVIEW</Link></Button>
                            <Button size="sm" className="rounded-full px-8" asChild><Link href={`/admin/dashboard/requests/edit/${request.id}/finalize`}>PUBLISH</Link></Button>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t flex flex-col items-start gap-3">
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <span>Due: {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</span>
                    <StatusBadge status={isArchived ? 'archived' : request.status} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{request.submissions_count || 0} Submissions</span>
                </div>
            </CardFooter>
        </Card>
    );
};

interface RequestRowProps {
    request: Request;
    clientMap: Map<number, string>;
    isArchived: boolean;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
}

const RequestRow = ({ request, clientMap, isArchived, onDuplicate, onArchive, onRestore, onForceDelete }: RequestRowProps) => {
    const ownerName = request.user?.name || 'Unknown User';
    const companyName = request.company?.company_name || 'N/A';
    const clientIds = Array.isArray(request.client_id) ? request.client_id : [];
    const clientName = clientIds.length > 0 ? clientMap.get(clientIds[0]) || "(No Client)" : "(No Client)";
    const additionalClientsCount = clientIds.length > 1 ? clientIds.length - 1 : 0;
    
    const viewUrl = request.status === 'draft' ? `/admin/dashboard/requests/preview/${request.id}` : `/admin/dashboard/requests/${request.id}`;

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
            {clientName === "(No Client)" ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>(No Client)</span>
                </div>
            ) : (
                <>
                    {clientName}
                    {additionalClientsCount > 0 && <span className="text-muted-foreground ml-1">+{additionalClientsCount}</span>}
                </>
            )}
        </TableCell>
        <TableCell><StatusBadge status={isArchived ? 'archived' : request.status} /></TableCell>
        <TableCell>{request.submissions_count || 0}</TableCell>
        <TableCell>{request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}</TableCell>
        <TableCell className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                     {isArchived ? (
                        <>
                            <DropdownMenuItem onSelect={() => onRestore(request)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onForceDelete(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                        </>
                     ) : (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={viewUrl}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {request.status === 'draft' ? 'Preview' : 'View Details'}
                                </Link>
                            </DropdownMenuItem>
                            {request.status !== 'published' && <DropdownMenuItem asChild><Link href={`/admin/dashboard/requests/edit/${request.id}`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => onDuplicate(request.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onArchive(request)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                        </>
                     )}
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
    );
};

interface RequestTableProps {
    requests: Request[];
    clientMap: Map<number, string>;
    isArchived: boolean;
    onDuplicate: (id: number) => void;
    onArchive: (request: Request) => void;
    onRestore: (request: Request) => void;
    onForceDelete: (request: Request) => void;
}

const RequestTable = ({ requests, clientMap, isArchived, ...props }: RequestTableProps) => {
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
                    {requests.map(request => (
                        <RequestRow
                          key={request.id}
                          request={request}
                          clientMap={clientMap}
                          isArchived={isArchived}
                          {...props}
                        />
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

export default function AdminRequestsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [requests, setRequests] = useState<Request[]>([]);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentTab, setCurrentTab] = useState('active');
    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOwnerId, setSelectedOwnerId] = useState('all');
    const [selectedCompanyId, setSelectedCompanyId] = useState('all');
    const [selectedClientId, setSelectedClientId] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    
    const [isOwnerFilterOpen, setIsOwnerFilterOpen] = useState(false);
    const [isCompanyFilterOpen, setIsCompanyFilterOpen] = useState(false);
    const [isClientFilterOpen, setIsClientFilterOpen] = useState(false);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const [requestToArchive, setRequestToArchive] = useState<Request | null>(null);
    const [requestToRestore, setRequestToRestore] = useState<Request | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<Request | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
    
    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const initialOwnerId = searchParams.get('created_by');
        if (initialOwnerId) {
            setSelectedOwnerId(initialOwnerId);
        }
    }, [searchParams]);

    const fetchData = useCallback(async (page: number, filters: any) => {
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsLoading(true);
        try {
            const fetchFn = currentTab === 'active' ? getAdminAllRequests : getAdminArchivedRequests;
            const requestsData = await fetchFn(token, page, filters);
            setRequests(requestsData.data || []);
            setPagination({
                current_page: requestsData.current_page,
                last_page: requestsData.last_page,
                total: requestsData.total,
            });
        } catch(err: any) {
            toast({ title: "Error", description: err.message || "Could not fetch requests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [token, router, toast, currentTab]);
    
    useEffect(() => {
        if (!token) return;
        async function loadSupportingData() {
            try {
                const [usersResponse, clientsResponse] = await Promise.all([
                    getAdminUsers(token, 1, '', true),
                    getAdminClients(token, 1, '', true)
                ]);
                setAllUsers(usersResponse.data || []);
                setAllClients(clientsResponse.data || []);
            } catch (err: any) {
                toast({ title: "Error", description: err.message || "Could not fetch supporting data.", variant: "destructive" });
            }
        }
        loadSupportingData();
    }, [token, toast]);
    
    useEffect(() => {
        const filters = {
            search: searchQuery,
            created_by: selectedOwnerId,
            company_id: selectedCompanyId,
            client_id: selectedClientId,
            status: currentTab === 'active' ? selectedStatus : undefined
        };
        fetchData(pagination.current_page, filters);
    }, [searchQuery, selectedOwnerId, selectedCompanyId, selectedClientId, selectedStatus, currentTab, dataVersion, fetchData, pagination.current_page]);


    const handleDuplicate = async (requestId: number) => {
        if (!token) return;
        toast({ title: 'Duplicating request...', description: 'Please wait.' });
        try {
            await duplicateAdminRequest(token, requestId);
            toast({ title: 'Success', description: 'Request duplicated successfully.' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error duplicating request', description: err.message });
        }
    };
    
    const handleArchive = async () => {
        if (!token || !requestToArchive) return;
        try {
            await softDeleteAdminRequest(token, requestToArchive.id);
            toast({ title: 'Request archived' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error archiving request', description: err.message });
        } finally {
            setRequestToArchive(null);
        }
    };

    const handleRestore = async () => {
        if (!token || !requestToRestore) return;
        try {
            await restoreAdminRequest(token, requestToRestore.id);
            toast({ title: 'Request restored' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error restoring request', description: err.message });
        } finally {
            setRequestToRestore(null);
        }
    };
    
    const handleForceDelete = async () => {
        if (!token || !requestToForceDelete) return;
        try {
            await forceDeleteAdminRequest(token, requestToForceDelete.id);
            toast({ title: 'Request permanently deleted' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting request', description: err.message });
        } finally {
            setRequestToForceDelete(null);
        }
    };


    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
    
    const clientMap = useMemo(() => new Map(allClients.map(c => [c.id, c.full_name])), [allClients]);
    
    const uniqueCompanies = useMemo(() => {
        const companies = new Map<number, { id: number, name: string }>();
        requests.forEach(req => {
            if (req.company && !companies.has(req.company.id)) {
                companies.set(req.company.id, { id: req.company.id, name: req.company.company_name });
            }
        });
        return Array.from(companies.values());
    }, [requests]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    const selectedOwnerName = allUsers.find(u => String(u.id) === selectedOwnerId)?.name || 'All Owners';
    const selectedCompanyName = uniqueCompanies.find(c => String(c.id) === selectedCompanyId)?.name || 'All Companies';
    const selectedClientName = selectedClientId === 'no-client' ? 'No Client' : (allClients.find(c => String(c.id) === selectedClientId)?.full_name || 'All Clients');
    const activeRequestStatuses = ['draft', 'published', 'scheduled', 'completed'];
    const selectedStatusName = selectedStatus === 'all' ? 'All Statuses' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                </div>
            );
        }
        if (requests.length === 0) {
            return (
                <div className="text-center py-20">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Requests Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        There are no {currentTab} requests that match your filters.
                    </p>
                </div>
            )
        }
        
        const viewProps = {
            clientMap,
            onDuplicate: handleDuplicate,
            onArchive: setRequestToArchive,
            onRestore: setRequestToRestore,
            onForceDelete: setRequestToForceDelete,
        };

        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {requests.map(req => <RequestCard key={req.id} request={req} isArchived={currentTab === 'archived'} {...viewProps}/>)}
                </div>
            )
        }
        return <RequestTable requests={requests} isArchived={currentTab === 'archived'} {...viewProps} />;
    }

    const ownerOptions = [
        { value: 'all', label: 'All Owners' },
        ...allUsers.map(user => ({ value: String(user.id), label: user.name }))
    ];

    const companyOptions = [
        { value: 'all', label: 'All Companies' },
        ...uniqueCompanies.map(co => ({ value: String(co.id), label: co.name }))
    ];
    
    const clientOptions = [
        { value: 'all', label: 'All Clients' },
        { value: 'no-client', label: 'No Client' },
        ...allClients.map(client => ({ value: String(client.id), label: client.full_name }))
    ];

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        ...activeRequestStatuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))
    ];

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-4rem)]">
                <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-wrap">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow">
                        <TabsList>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="flex items-center gap-2 font-semibold h-9"><ViewIcon className="h-4 w-4" />{viewMode === 'grid' ? 'Grid' : 'List'}</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem><DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search requests..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                    </div>
                </header>
                <div className="flex items-center gap-2 px-6 py-3 border-b bg-background flex-wrap">
                    <span className="text-sm font-semibold text-muted-foreground">Filter by:</span>
                     <Popover open={isOwnerFilterOpen} onOpenChange={setIsOwnerFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="h-8"><User className="mr-2 h-4 w-4"/>{selectedOwnerName}<ChevronDown className="ml-2 h-4 w-4"/></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search owner..."/>
                                <CommandList>
                                <CommandEmpty>No owner found.</CommandEmpty>
                                <CommandGroup>
                                    {ownerOptions.map((option) => (
                                        <CommandItem key={option.value} value={option.label} onSelect={(currentLabel) => {
                                            const selectedOption = ownerOptions.find(opt => opt.label.toLowerCase() === currentLabel.toLowerCase());
                                            setSelectedOwnerId(selectedOption ? selectedOption.value : 'all');
                                            setIsOwnerFilterOpen(false);
                                        }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedOwnerId === option.value ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                     <Popover open={isCompanyFilterOpen} onOpenChange={setIsCompanyFilterOpen}>
                        <PopoverTrigger asChild>
                           <Button variant="outline" className="h-8"><Briefcase className="mr-2 h-4 w-4"/>{selectedCompanyName}<ChevronDown className="ml-2 h-4 w-4"/></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                             <Command>
                                <CommandInput placeholder="Search company..."/>
                                <CommandList>
                                <CommandEmpty>No company found.</CommandEmpty>
                                <CommandGroup>
                                    {companyOptions.map(option => (
                                        <CommandItem key={option.value} value={option.label} onSelect={() => { setSelectedCompanyId(option.value); setIsCompanyFilterOpen(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedCompanyId === option.value ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    
                    <Popover open={isClientFilterOpen} onOpenChange={setIsClientFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8"><Users className="mr-2 h-4 w-4"/>{selectedClientName}<ChevronDown className="ml-2 h-4 w-4"/></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                           <Command>
                                <CommandInput placeholder="Search client..."/>
                                <CommandList>
                                <CommandEmpty>No client found.</CommandEmpty>
                                <CommandGroup>
                                    {clientOptions.map(option => (
                                         <CommandItem key={option.value} value={option.label} onSelect={() => { setSelectedClientId(option.value); setIsClientFilterOpen(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedClientId === option.value ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {currentTab === 'active' && (
                        <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-8"><Filter className="mr-2 h-4 w-4"/>{selectedStatusName}<ChevronDown className="ml-2 h-4 w-4"/></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                               <Command>
                                <CommandInput placeholder="Search status..."/>
                                <CommandList>
                                <CommandEmpty>No status found.</CommandEmpty>
                                <CommandGroup>
                                    {statusOptions.map(option => (
                                        <CommandItem key={option.value} value={option.label} onSelect={() => { setSelectedStatus(option.value); setIsStatusFilterOpen(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", selectedStatus === option.value ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t bg-card">
                        <div className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} requests)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>Previous</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>Next</Button>
                        </div>
                    </div>
                )}
            </div>

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
    );
}
