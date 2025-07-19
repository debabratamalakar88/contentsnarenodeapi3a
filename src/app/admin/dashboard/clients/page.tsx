
'use client'

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Search, LayoutGrid, ChevronDown, List, Layers, User as UserIcon, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminClients, 
  getAdminArchivedClients,
  softDeleteAdminClient,
  restoreAdminClient,
  forceDeleteAdminClient,
  getAdminUsers,
  type Client,
  type User as UserType
} from "@/lib/api";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}


export default function ManageClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("active");
  const [dataVersion, setDataVersion] = useState(0);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);
  const [clientToRestore, setClientToRestore] = useState<Client | null>(null);
  const [clientToForceDelete, setClientToForceDelete] = useState<Client | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
  const router = useRouter();

  const refetchData = () => setDataVersion(v => v + 1);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      try {
        const fetchClientsFn = currentTab === 'active' ? getAdminClients : getAdminArchivedClients;
        const [fetchedClients, fetchedUsers] = await Promise.all([
          fetchClientsFn(token),
          getAdminUsers(token)
        ]);
        setClients(fetchedClients);
        setAllUsers(fetchedUsers);
      } catch (error: any) {
        toast({
          title: `Failed to fetch data`,
          description: error.message || "Could not fetch client or user data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast, currentTab, dataVersion, token, router]);
  
  const filteredClients = clients.filter(client => {
    const createdBy = client.created_by;
    const matchesSearch = client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesUser = false;
    if (selectedUserId === 'all') {
      matchesUser = true;
    } else if (selectedUserId === 'admin') {
      matchesUser = createdBy === null;
    } else {
      matchesUser = createdBy !== null && createdBy === Number(selectedUserId);
    }

    return matchesSearch && matchesUser;
  });

  const selectedUserName = selectedUserId === 'all'
    ? 'All Users'
    : selectedUserId === 'admin'
    ? 'Admin'
    : allUsers.find(u => String(u.id) === selectedUserId)?.name || 'Filter by User';


  const handleArchive = async () => {
    if (!token || !clientToArchive) return;
    try {
      await softDeleteAdminClient(token, clientToArchive.id);
      toast({ title: "Client Archived", description: "The client has been moved to the archived list." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setClientToArchive(null);
    }
  };

  const handleRestore = async () => {
    if (!token || !clientToRestore) return;
    try {
      await restoreAdminClient(token, clientToRestore.id);
      toast({ title: "Client Restored", description: "The client has been successfully restored." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setClientToRestore(null);
    }
  };

  const handleForceDelete = async () => {
    if (!token || !clientToForceDelete) return;
    try {
      await forceDeleteAdminClient(token, clientToForceDelete.id);
      toast({ title: "Client Permanently Deleted", description: "The client and their data have been removed." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setClientToForceDelete(null);
    }
  };

  const viewProps = {
    clients: filteredClients,
    isLoading,
    onArchive: setClientToArchive,
    onRestore: setClientToRestore,
    onForceDelete: setClientToForceDelete,
    users: allUsers,
  };
  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
  
  const renderContent = (isArchived: boolean) => {
    if (isLoading) {
      return <LoadingSkeleton view={viewMode} />;
    }
    if (filteredClients.length === 0) {
      const message = isArchived ? "No archived clients found." : "No active clients found.";
      const action = !isArchived ? <Button asChild className="mt-4"><Link href="/admin/dashboard/clients/new">Add New Client</Link></Button> : null;
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{message}</p>
          {action}
        </div>
      );
    }
    const viewProps = {
      clients: filteredClients,
      isArchived,
      onArchive: setClientToArchive,
      onRestore: setClientToRestore,
      onForceDelete: setClientToForceDelete,
      users: allUsers,
    };
    return viewMode === 'grid' ? <ClientsGrid {...viewProps} /> : <ClientsTable {...viewProps} />;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
          <div className="flex items-center p-6 pb-0 border-b bg-card">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger value="active" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">ACTIVE</TabsTrigger>
              <TabsTrigger value="archived" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">ARCHIVED</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2 mb-2">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search clients..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{selectedUserName}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={selectedUserId} onValueChange={setSelectedUserId}>
                        <DropdownMenuRadioItem value="all">All Users</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        {allUsers.map((user) => (
                          <DropdownMenuRadioItem key={user.id} value={String(user.id)}>{user.name}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                          <ViewIcon className="h-4 w-4" />
                          <span>View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild><Link href="/admin/dashboard/clients/new"><PlusCircle className="mr-2 h-4 w-4"/> Add Client</Link></Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-muted/40">
            <TabsContent value="active">
                {renderContent(false)}
            </TabsContent>
            <TabsContent value="archived">
                {renderContent(true)}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <AlertDialog open={!!clientToArchive} onOpenChange={(open) => !open && setClientToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Archive this client?</AlertDialogTitle><AlertDialogDescription>This will archive the client and move it to the archived list. They can be restored later.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!clientToRestore} onOpenChange={(open) => !open && setClientToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Restore this client?</AlertDialogTitle><AlertDialogDescription>This will restore the client to the active list.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!clientToForceDelete} onOpenChange={(open) => !open && setClientToForceDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the client.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleForceDelete}>Delete Permanently</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ClientViewProps {
  clients: Client[];
  isArchived: boolean;
  onArchive: (client: Client) => void;
  onRestore: (client: Client) => void;
  onForceDelete: (client: Client) => void;
  users: UserType[];
}

function ClientsGrid({ clients, isArchived, onArchive, onRestore, onForceDelete, users }: ClientViewProps) {
  const getUserName = (userId: number | null) => {
    if (userId === null) return 'Admin';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {clients.map(client => (
        <Card key={client.id} className="bg-card shadow-sm hover:shadow-md transition-shadow relative">
           <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                {isArchived ? (
                  <><DropdownMenuItem onSelect={() => onRestore(client)}>Restore</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={() => onForceDelete(client)}>Delete Permanently</DropdownMenuItem></>
                ) : (
                  <><DropdownMenuItem asChild><Link href={`/admin/dashboard/clients/${client.id}`}>View Client</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href={`/admin/dashboard/clients/${client.id}/edit`}>Edit</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => onArchive(client)}>Archive</DropdownMenuItem></>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <CardContent className="flex flex-col items-center text-center p-6 pt-8">
              <Avatar className="h-16 w-16 mb-4"><AvatarFallback className="bg-pink-100 text-pink-800 font-bold text-xl">{getInitials(client.full_name)}</AvatarFallback></Avatar>
              <p className="font-semibold text-lg">{client.full_name}</p>
              <div className="mt-2 space-y-0.5 text-sm text-muted-foreground"><p>{client.email}</p></div>
              <p className="text-xs text-muted-foreground mt-2">Created by: {getUserName(client.created_by)}</p>
            </CardContent>
        </Card>
      ))}
      {!isArchived && (
        <Link href="/admin/dashboard/clients/new">
          <Card className="flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[240px] h-full">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4"><Layers className="h-8 w-8 text-slate-400" /></div>
            <Button variant="secondary" className="pointer-events-none bg-primary/10 text-primary hover:bg-primary/20">ADD NEW CLIENT</Button>
          </Card>
        </Link>
      )}
    </div>
  )
}

function ClientsTable({ clients, isArchived, onArchive, onRestore, onForceDelete, users }: ClientViewProps) {
   const getUserName = (userId: number | null) => {
    if (userId === null) return 'Admin';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Full Name</TableHead><TableHead>Email</TableHead><TableHead>Created By</TableHead><TableHead>{isArchived ? "Date Archived" : "Date Created"}</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{getUserName(client.created_by)}</TableCell>
              <TableCell>{isArchived ? (client.deleted_at ? format(parseISO(client.deleted_at), 'PPP') : 'N/A') : (client.created_at ? format(parseISO(client.created_at), 'PPP') : 'N/A')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                    {isArchived ? (
                      <><DropdownMenuItem onSelect={() => onRestore(client)}>Restore Client</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={() => onForceDelete(client)}>Delete Permanently</DropdownMenuItem></>
                    ) : (
                      <><DropdownMenuItem asChild><Link href={`/admin/dashboard/clients/${client.id}`}>View Details</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href={`/admin/dashboard/clients/${client.id}/edit`}>Edit Client</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => onArchive(client)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Archive Client</DropdownMenuItem></>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {!isArchived && <TableRow><TableCell colSpan={5} className="py-4"><Link href="/admin/dashboard/clients/new" className="text-primary hover:underline text-sm font-medium">Add a client...</Link></TableCell></TableRow>}
        </TableBody>
      </Table>
    </Card>
  );
}

function LoadingSkeleton({ view }: { view: 'grid' | 'list' }) {
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i}><CardContent className="flex flex-col items-center p-6 gap-3"><Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent></Card>
          ))}
        </div>
      )
    }
    return (
      <Card>
        <Table>
          <TableHeader><TableRow>{[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
          <TableBody>{[...Array(10)].map((_, i) => (<TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
        </Table>
      </Card>
    );
}
