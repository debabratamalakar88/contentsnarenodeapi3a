
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Search, LayoutGrid, MoreHorizontal, ChevronDown, List, ArrowUpDown, Layers, Loader2 } from "lucide-react";
import { getClients, deleteClient, type Client } from "@/lib/api";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchClients() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedClients = await getClients(token);
        setClients(fetchedClients);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch clients.');
        toast({
          variant: 'destructive',
          title: 'Error fetching clients',
          description: err.message || 'An unexpected error occurred.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchClients();
  }, [toast]);

  const handleArchiveClient = async (clientId: number) => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        return;
      }
      try {
        await deleteClient(token, clientId);
        setClients(prevClients => prevClients.map(c => c.id === clientId ? {...c, is_archived: true} : c));
        toast({
          title: 'Client Archived',
          description: 'The client has been moved to the archive.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error archiving client',
          description: error.message || 'An unexpected error occurred.',
        });
      }
  };

  const activeClients = clients.filter(c => !c.is_archived);
  const archivedClients = clients.filter(c => c.is_archived);

  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
  
  const renderClientGrid = (clientList: Client[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {clientList.map((client) => (
        <AlertDialog key={client.id}>
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Client</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Archive</DropdownMenuItem>
                </AlertDialogTrigger>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CardContent className="flex flex-col items-center text-center p-6 pt-8">
              <Avatar className="h-16 w-16 mb-4">
                <AvatarFallback className="bg-green-100 text-green-800 font-bold text-xl">
                  {getInitials(client.full_name)}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{client.full_name}</p>
              <p className="text-sm text-muted-foreground mt-2">{client.companies?.[0]}</p>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                <p>{client.email}</p>
                <p>{client.phone_number}</p>
              </div>
            </CardContent>
          </Card>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to archive this client?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will move the client to the archived list. You can restore them later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleArchiveClient(client.id)}>Archive</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
      <Link href="/dashboard/clients/new">
        <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[268px]">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
            <Layers className="h-8 w-8 text-slate-400" />
          </div>
          <Button className="bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 pointer-events-none">
            ADD NEW CLIENT
          </Button>
        </Card>
      </Link>
    </div>
  );

  const renderClientList = (clientList: Client[]) => (
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
                {clientList.map((client) => (
                    <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.full_name}</TableCell>
                        <TableCell>{client.companies?.[0]}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone_number}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Client</DropdownMenuItem>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Archive</DropdownMenuItem></AlertDialogTrigger>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to archive this client?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will move the client to the archived list. You can restore them later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleArchiveClient(client.id)}>Archive</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
                 <TableRow>
                    <TableCell colSpan={5} className="py-4">
                        <Link href="/dashboard/clients/new" className="text-primary hover:underline text-sm font-medium">Add a client...</Link>
                    </TableCell>
                </TableRow>
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
          <Skeleton className="h-4 w-24" />
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Tabs defaultValue="active" className="flex flex-col h-full">
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
                <Button variant="outline" className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">IMPORT</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1 text-primary border-primary hover:bg-primary/5 hover:text-primary">
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
                    <Input placeholder="Search clients..." className="pl-9" />
                </div>
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
                {activeClients.length > 0 ? (
                    viewMode === 'grid' ? renderClientGrid(activeClients) : renderClientList(activeClients)
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                        <p className="text-lg font-semibold mb-2">No active clients yet.</p>
                        <p>Get started by adding your first client.</p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/clients/new">Add New Client</Link>
                        </Button>
                    </div>
                )}
              </TabsContent>
              <TabsContent value="archived">
                  {archivedClients.length > 0 ? (
                      viewMode === 'grid' ? renderClientGrid(archivedClients) : renderClientList(archivedClients)
                  ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Archived clients will be shown here.</p>
                      </div>
                  )}
              </TabsContent>
            </>
            )}
        </div>
      </Tabs>
    </div>
  );
}
