
'use client'

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminClients, 
  getAdminArchivedClients,
  softDeleteAdminClient,
  restoreAdminClient,
  forceDeleteAdminClient,
  type Client 
} from "@/lib/api";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function ManageClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("active");
  const [dataVersion, setDataVersion] = useState(0);

  const [clientToArchive, setClientToArchive] = useState<Client | null>(null);
  const [clientToRestore, setClientToRestore] = useState<Client | null>(null);
  const [clientToForceDelete, setClientToForceDelete] = useState<Client | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
  const router = useRouter();

  const refetchData = () => setDataVersion(v => v + 1);

  useEffect(() => {
    async function fetchClients() {
      if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      try {
        const fetchFunction = currentTab === 'active' ? getAdminClients : getAdminArchivedClients;
        const fetchedClients = await fetchFunction(token);
        setClients(fetchedClients);
      } catch (error: any) {
        toast({
          title: `Failed to fetch ${currentTab} clients`,
          description: error.message || "Could not fetch client data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, [toast, currentTab, dataVersion, token, router]);

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

  const clientViewProps = {
    clients,
    isLoading,
    onArchive: setClientToArchive,
    onRestore: setClientToRestore,
    onForceDelete: setClientToForceDelete,
  };

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manage All Clients</h1>
          <p className="text-muted-foreground">
            Browse and manage clients across all user accounts.
          </p>
        </div>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ClientTable {...clientViewProps} isArchived={false} />
          </TabsContent>
          <TabsContent value="archived">
            <ClientTable {...clientViewProps} isArchived={true} />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!clientToArchive} onOpenChange={(open) => !open && setClientToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the client and move it to the archived list. They can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!clientToRestore} onOpenChange={(open) => !open && setClientToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the client to the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!clientToForceDelete} onOpenChange={(open) => !open && setClientToForceDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleForceDelete}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  isArchived: boolean;
  onArchive: (client: Client) => void;
  onRestore: (client: Client) => void;
  onForceDelete: (client: Client) => void;
}

function ClientTable({ clients, isLoading, isArchived, onArchive, onRestore, onForceDelete }: ClientTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isArchived ? "Archived" : "Active"} Clients</CardTitle>
        <CardDescription>
          A list of {isArchived ? "archived" : "active"} clients from all user accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>{isArchived ? "Date Archived" : "Date Created"}</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.full_name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.companies?.join(', ')}</TableCell>
                  <TableCell>
                    {isArchived
                        ? (client.deleted_at ? format(parseISO(client.deleted_at), 'PPP') : 'N/A')
                        : (client.created_at ? format(parseISO(client.created_at), 'PPP') : 'N/A')
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isArchived ? (
                          <>
                            <DropdownMenuItem onSelect={() => onRestore(client)}>Restore Client</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={() => onForceDelete(client)}>
                              Delete Permanently
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem asChild><Link href="#">View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="#">Edit Client</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onArchive(client)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                              Archive Client
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
