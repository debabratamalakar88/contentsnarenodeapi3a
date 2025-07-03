
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAdminUsers } from "@/lib/api";
import type { User as UserType } from "@/lib/api";
import { format, parseISO } from 'date-fns';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      try {
        const fetchedUsers = await getAdminUsers(token);
        setUsers(fetchedUsers);
      } catch (error: any) {
        toast({
          title: "Failed to fetch users",
          description: error.message || "Could not fetch user data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [toast]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          View, edit, and manage all registered user accounts.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            A list of all registered users in the system.
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.email_verified_at ? (
                        <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                           <XCircle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at ? format(parseISO(user.created_at), 'PPP') : 'N/A'}
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
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                            Deactivate User
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
    </div>
  );
}
