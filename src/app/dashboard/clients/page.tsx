
'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, LayoutGrid, MoreHorizontal, ChevronDown, List, ArrowUpDown, Layers, Loader2, PlusCircle, Eye, Edit, Archive, ArchiveRestore, Trash2, Upload, Download } from "lucide-react";
import { getClients, getArchivedClients, createClient, deleteClient, restoreClient, forceDeleteClient, type Client, getProfile, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeClients, setActiveClients] = useState<Client[]>([]);
  const [archivedClients, setArchivedClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);
  const [clientToPermanentlyDelete, setClientToPermanentlyDelete] = useState<Client | null>(null);
  const [currentTab, setCurrentTab] = useState('active');
  const [dataVersion, setDataVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const refetchData = () => setDataVersion(v => v + 1);
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  useEffect(() => {
    async function fetchClientsData() {
        if (!token) {
            setError("Authentication required. Please log in.");
            setIsLoading(false);
            router.push('/login');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const fetchClientsFn = currentTab === 'active' ? getClients : getArchivedClients;
            const [clientsData, profileData] = await Promise.all([
                fetchClientsFn(token),
                getProfile(token),
            ]);
            
            if (currentTab === 'active') {
                setActiveClients(clientsData);
            } else {
                setArchivedClients(clientsData);
            }
            setCurrentUser(profileData.user || profileData.data || profileData);
        } catch (err: any) {
            setError(err.message || `Failed to fetch ${currentTab} clients.`);
            toast({
                variant: 'destructive',
                title: `Error fetching ${currentTab} clients`,
                description: err.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchClientsData();
  }, [toast, token, router, currentTab, dataVersion]);
  
  const canManageClients = userRole === 'Administrator' || userRole === 'Editor';

  const handleArchive = async (clientId: number) => {
    if (!token) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        return;
    }
    try {
        await deleteClient(token, clientId);
        toast({ title: "Client Archived", description: "The client has been moved to the archive." });
        refetchData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error archiving client', description: error.message || 'An unexpected error occurred.' });
    } finally {
        setClientToArchive(null);
    }
  };
  
  const handleRestore = async (clientId: number) => {
      if (!token) {
          toast({ variant: 'destructive', title: 'Authentication Error' });
          return;
      }
      try {
          await restoreClient(token, clientId);
          toast({ title: "Client Restored", description: "The client has been successfully restored." });
          refetchData();
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error restoring client', description: error.message || 'An unexpected error occurred.' });
      }
  };

  const handleForceDelete = async (clientId: number) => {
      if (!token) {
          toast({ variant: 'destructive', title: 'Authentication Error' });
          return;
      }
      try {
          await forceDeleteClient(token, clientId);
          toast({ title: "Client Deleted", description: "The client has been permanently deleted." });
          refetchData();
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error deleting client', description: error.message || 'An unexpected error occurred.' });
      } finally {
          setClientToPermanentlyDelete(null);
      }
  };

  const handleExport = () => {
    const clientsToExport = currentTab === 'active' ? filteredActiveClients : filteredArchivedClients;
    if (clientsToExport.length === 0) {
      toast({ title: "No clients to export", description: "There are no clients in the current view to export.", variant: "destructive" });
      return;
    }
    
    const headers = ['Full Name', 'Email', 'Companies', 'Phone Number'];
    const rows = clientsToExport.map(client => {
      // Ensure values are properly quoted and escaped for CSV
      const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;
      
      const fullName = escapeCsv(client.full_name);
      const email = escapeCsv(client.email);
      const companies = escapeCsv((client.companies || []).join(', '));
      const phoneNumber = escapeCsv(client.phone_number || '');

      return [fullName, email, companies, phoneNumber].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `clients-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const headerLine = lines.shift()?.trim() || '';
        const headers = headerLine.split(',').map(h => h.toLowerCase().replace(/"/g, '').replace(/ /g, '_').replace(/\r/g, ''));

        const requiredHeaders = ['full_name', 'email'];
        if (!requiredHeaders.every(h => headers.includes(h))) {
            toast({ title: 'Invalid CSV', description: `CSV must contain the following headers: ${requiredHeaders.join(', ')}`, variant: 'destructive' });
            setIsImporting(false);
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const line of lines) {
            if (!line.trim()) continue;
            
            const values = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
            
            const clientData: any = {};
            
            headers.forEach((header, index) => {
                const value = values[index] || '';
                if (header === 'companies') {
                    clientData[header] = value.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    clientData[header] = value;
                }
            });

            if (Object.keys(clientData).length > 0 && clientData.full_name) {
                try {
                    await createClient(token, clientData);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    console.error("Failed to import client:", clientData, error);
                }
            }
        }
        
        toast({
            title: "Import Complete",
            description: `${successCount} clients imported successfully. ${errorCount} clients failed.`
        });
        
        refetchData();
        setIsImporting(false);
        setIsImportDialogOpen(false);
    };

    reader.readAsText(file);
  }


  const filteredActiveClients = activeClients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchivedClients = archivedClients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
  
  const renderClientGrid = (clientList: Client[], isArchived: boolean) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {clientList.map((client) => {
        const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && client.created_by === currentUser?.id);
        
        return (
            <Card key={client.id} className="bg-card shadow-sm hover:shadow-md transition-shadow relative">
            {(!isArchived || canManageClients) && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isArchived ? (
                    canManageClients && (
                        <>
                        <DropdownMenuItem onSelect={() => handleRestore(client.id)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                        {canDeletePermanently && <DropdownMenuItem onSelect={() => setClientToPermanentlyDelete(client)} className="focus:bg-destructive focus:text-destructive-foreground text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>}
                        </>
                    )
                    ) : (
                    <>
                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=client-details`}><Eye className="mr-2 h-4 w-4" /> View Client</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=requests`}><List className="mr-2 h-4 w-4" /> Go to Requests</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=client-portal`}><Layers className="mr-2 h-4 w-4" /> Go to Client Portal</Link></DropdownMenuItem>
                        {canManageClients && (
                            <>
                                <DropdownMenuItem onSelect={() => setClientToArchive(client)}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                            </>
                        )}
                    </>
                    )}
                </DropdownMenuContent>
                </DropdownMenu>
            )}
            <CardContent className="flex flex-col items-center text-center p-6 pt-8">
                <Avatar className="h-16 w-16 mb-4">
                <AvatarFallback className="bg-pink-100 text-pink-700 font-bold text-xl">
                    {getInitials(client.full_name)}
                </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-lg">{client.full_name}</p>
                <p className="text-sm text-muted-foreground h-5">{client.companies?.[0]}</p>
                <p className="text-sm text-muted-foreground mt-2">{client.email}</p>
            </CardContent>
            </Card>
        );
      })}
      {!isArchived && canManageClients && (
        <Link href="/dashboard/clients/new">
          <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[240px]">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
              <Layers className="h-8 w-8 text-slate-400" />
            </div>
            <Button variant="ghost" className="pointer-events-none text-primary bg-primary/10 hover:bg-primary/20">
              Add New Client
            </Button>
          </Card>
        </Link>
      )}
    </div>
  );

  const renderClientList = (clientList: Client[], isArchived: boolean) => (
     <Card className="bg-card shadow-sm">
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase">
                        <div className="flex items-center">
                            Full Name
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Company Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Email Address</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clientList.map((client) => {
                    const canDeletePermanently = userRole === 'Administrator' || (userRole === 'Editor' && client.created_by === currentUser?.id);
                    return (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.full_name}</TableCell>
                            <TableCell>{client.companies?.join(', ')}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone_number}</TableCell>
                            <TableCell>
                            {(!isArchived || canManageClients) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    {isArchived ? (
                                        canManageClients && (
                                        <>
                                            <DropdownMenuItem onSelect={() => handleRestore(client.id)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                                            {canDeletePermanently && <DropdownMenuItem onSelect={() => setClientToPermanentlyDelete(client)} className="focus:bg-destructive focus:text-destructive-foreground text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>}
                                        </>
                                        )
                                    ) : (
                                        <>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=client-details`}><Eye className="mr-2 h-4 w-4" /> View Client</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=requests`}><List className="mr-2 h-4 w-4" /> Go to Requests</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/dashboard/clients/${client.id}/edit?tab=client-portal`}><Layers className="mr-2 h-4 w-4" /> Go to Client Portal</Link></DropdownMenuItem>
                                        {canManageClients && (
                                            <>
                                                <DropdownMenuItem onSelect={() => setClientToArchive(client)}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
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
                })}
                {!isArchived && canManageClients && (
                 <TableRow>
                    <TableCell colSpan={5} className="py-4">
                        <Link href="/dashboard/clients/new" className="text-primary hover:underline text-sm font-medium">Add new client...</Link>
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </Card>
  );
  
  const renderLoadingSkeleton = () => {
    const SkeletonCard = () => (
      <Card>
        <CardContent className="flex flex-col items-center text-center p-6 pt-8 gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    )
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    return (
      <Card>
        <Table>
          <TableHeader>
             <TableRow>
                {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
             </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                 {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Tabs defaultValue="active" onValueChange={setCurrentTab} className="flex flex-col h-full">
          <div className="flex items-center p-6 pb-0 border-b bg-card">
              <TabsList className="bg-transparent p-0">
                  <TabsTrigger value="active" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                      ACTIVE
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                      ARCHIVED
                  </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2 mb-2">
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
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  {canManageClients && (
                      <>
                        <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Import</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Import Clients</DialogTitle>
                              <DialogDescription>Upload a CSV file to import clients. The file must have 'full_name' and 'email' columns.</DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="csv-file">CSV File</Label>
                              <Input id="csv-file" type="file" accept=".csv" onChange={handleImport} disabled={isImporting} />
                              {isImporting && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Importing clients, please wait...</p>}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button asChild>
                            <Link href="/dashboard/clients/new">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Client
                            </Link>
                        </Button>
                      </>
                  )}
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-muted/40">
              {isLoading ? renderLoadingSkeleton() : error ? (
                  <div className="flex items-center justify-center h-full text-destructive">
                      <p>{error}</p>
                  </div>
              ) : (
              <>
                <TabsContent value="active">
                  {filteredActiveClients.length > 0 ? (
                      viewMode === 'grid' ? renderClientGrid(filteredActiveClients, false) : renderClientList(filteredActiveClients, false)
                  ) : searchQuery ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>No clients found for "{searchQuery}".</p>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                          <p className="text-lg font-semibold mb-2">No active clients yet.</p>
                          {canManageClients && (
                            <>
                                <p>Get started by adding your first client.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/dashboard/clients/new">Add New Client</Link>
                                </Button>
                            </>
                          )}
                      </div>
                  )}
                </TabsContent>
                <TabsContent value="archived">
                    {filteredArchivedClients.length > 0 ? (
                        viewMode === 'grid' ? renderClientGrid(filteredArchivedClients, true) : renderClientList(filteredArchivedClients, true)
                    ) : searchQuery ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No archived clients found for "{searchQuery}".</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No archived clients found.</p>
                        </div>
                    )}
                </TabsContent>
              </>
              )}
          </div>
        </Tabs>
      </div>

      <AlertDialog open={!!clientToArchive} onOpenChange={(open) => !open && setClientToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will move the client to the archived list. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => clientToArchive && handleArchive(clientToArchive.id)}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!clientToPermanentlyDelete} onOpenChange={(open) => !open && setClientToPermanentlyDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => clientToPermanentlyDelete && handleForceDelete(clientToPermanentlyDelete.id)}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
