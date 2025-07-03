
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminClients, getAdminArchivedClients, type Client } from "@/lib/api";
import { format, parseISO } from 'date-fns';

export default function ManageClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("active");

  useEffect(() => {
    async function fetchClients() {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        setIsLoading(false);
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
  }, [toast, currentTab]);

  return (
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
          <ClientTable clients={clients} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="archived">
           <ClientTable clients={clients} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
}

function ClientTable({ clients, isLoading }: ClientTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Client List</CardTitle>
        <CardDescription>
          A list of clients from all user accounts.
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
                <TableHead>Created At</TableHead>
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
                    {client.created_at ? format(parseISO(client.created_at), 'PPP') : 'N/A'}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                          Archive Client
                        </DropdownMenuItem>
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
