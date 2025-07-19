
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, XCircle, PlusCircle, LayoutGrid, List, Search, ChevronDown, ShieldAlert, ShieldCheck, UserPlus, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminUsers, 
  getAdminArchivedUsers,
  softDeleteAdminUser,
  restoreAdminUser,
  forceDeleteAdminUser,
  type User as UserType 
} from "@/lib/api";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";
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


export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("active");
  const [dataVersion, setDataVersion] = useState(0);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");

  const [userToArchive, setUserToArchive] = useState<UserType | null>(null);
  const [userToRestore, setUserToRestore] = useState<UserType | null>(null);
  const [userToForceDelete, setUserToForceDelete] = useState<UserType | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null;
  const router = useRouter();

  const refetchData = () => setDataVersion(v => v + 1);

  useEffect(() => {
    async function fetchUsers() {
      if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      try {
        const fetchFunction = currentTab === 'active' ? getAdminUsers : getAdminArchivedUsers;
        const fetchedUsers = await fetchFunction(token);
        setUsers(fetchedUsers);
      } catch (error: any) {
        toast({
          title: `Failed to fetch ${currentTab === 'active' ? 'active' : 'archived'} users`,
          description: error.message || "Could not fetch user data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [toast, currentTab, dataVersion, token, router]);
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArchive = async () => {
    if (!token || !userToArchive) return;
    try {
      await softDeleteAdminUser(token, userToArchive.id);
      toast({ title: "User Archived", description: "The user has been moved to the archived list." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setUserToArchive(null);
    }
  };

  const handleRestore = async () => {
    if (!token || !userToRestore) return;
    try {
      await restoreAdminUser(token, userToRestore.id);
      toast({ title: "User Restored", description: "The user has been successfully restored." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setUserToRestore(null);
    }
  };

  const handleForceDelete = async () => {
    if (!token || !userToForceDelete) return;
    try {
      await forceDeleteAdminUser(token, userToForceDelete.id);
      toast({ title: "User Permanently Deleted", description: "The user and their data have been removed." });
      refetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setUserToForceDelete(null);
    }
  };

  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;
  
  const renderContent = (isArchived: boolean) => {
    if (isLoading) {
      return <LoadingSkeleton view={viewMode} />;
    }
    if (filteredUsers.length === 0) {
      const message = isArchived ? "No archived users found." : "No active users found.";
      const action = !isArchived ? <Button asChild className="mt-4"><Link href="/admin/dashboard/users/new">Create a User</Link></Button> : null;
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{message}</p>
          {action}
        </div>
      );
    }
    const viewProps = {
      users: filteredUsers,
      isArchived,
      onArchive: setUserToArchive,
      onRestore: setUserToRestore,
      onForceDelete: setUserToForceDelete,
    };
    return viewMode === 'grid' ? <UsersGrid {...viewProps} /> : <UsersTable {...viewProps} />;
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
                      <Input
                        placeholder="Search users..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
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
                  <Button asChild>
                      <Link href="/admin/dashboard/users/new">
                          <PlusCircle className="mr-2 h-4 w-4"/> Add User
                      </Link>
                  </Button>
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

      <AlertDialog open={!!userToArchive} onOpenChange={(open) => !open && setUserToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the user's account and move it to the archived list. They will not be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToRestore} onOpenChange={(open) => !open && setUserToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the user's account, allowing them to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!userToForceDelete} onOpenChange={(open) => !open && setUserToForceDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and all their associated data.
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

interface UsersViewProps {
  users: UserType[];
  isArchived: boolean;
  onArchive: (user: UserType) => void;
  onRestore: (user: UserType) => void;
  onForceDelete: (user: UserType) => void;
}

function UsersGrid({ users, isArchived, onArchive, onRestore, onForceDelete }: UsersViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {users.map(user => (
        <Card key={user.id} className="relative">
          <CardHeader className="flex flex-col items-center text-center p-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isArchived ? (
                  <>
                    <DropdownMenuItem onSelect={() => onRestore(user)}>Restore User</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={() => onForceDelete(user)}>
                      Delete Permanently
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/dashboard/users/${user.id}`}>View User</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/dashboard/users/${user.id}/edit`}>Edit User</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onArchive(user)}>
                      Archive User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
             <Avatar className="h-16 w-16 mb-2">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
            {isArchived ? (
              <Badge variant="destructive">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            ) : (
               <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
             {user.email_verified_at ? (
              <Badge variant="secondary" className="text-blue-700 bg-blue-100 border-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                Not Verified
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
      {!isArchived && (
        <Link href="/admin/dashboard/users/new">
          <Card className="flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[260px] h-full">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
              <UserPlus className="h-8 w-8 text-slate-400" />
            </div>
            <Button variant="secondary" className="pointer-events-none bg-primary/10 text-primary hover:bg-primary/20">
              ADD NEW USER
            </Button>
          </Card>
        </Link>
      )}
    </div>
  )
}

function UsersTable({ users, isArchived, onArchive, onRestore, onForceDelete }: UsersViewProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>{isArchived ? "Date Archived" : "Date Registered"}</TableHead>
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
                {isArchived ? (
                    <Badge variant="destructive">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Archived
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-green-700 bg-green-100 border-green-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.email_verified_at ? (
                  <Badge variant="secondary" className="text-blue-700 bg-blue-100 border-blue-200">
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
                {isArchived 
                  ? (user.deleted_at ? format(parseISO(user.deleted_at), 'PPP') : 'N/A')
                  : (user.created_at ? format(parseISO(user.created_at), 'PPP') : 'N/A')
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
                        <DropdownMenuItem onSelect={() => onRestore(user)}>Restore User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={() => onForceDelete(user)}>
                          Delete Permanently
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/users/${user.id}`}>View User</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/users/${user.id}/edit`}>Edit User</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onArchive(user)}>
                          Archive User
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {!isArchived && (
            <TableRow>
              <TableCell colSpan={6} className="py-4">
                <Link href="/admin/dashboard/users/new" className="text-primary hover:underline text-sm font-medium">
                  Add a user...
                </Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

function LoadingSkeleton({ view }: { view: 'grid' | 'list' }) {
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="flex flex-col items-center p-6 gap-3"><Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      )
    }
    return (
      <Card>
        <Table>
          <TableHeader><TableRow>{[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
          <TableBody>{[...Array(10)].map((_, i) => (<TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
        </Table>
      </Card>
    );
}
