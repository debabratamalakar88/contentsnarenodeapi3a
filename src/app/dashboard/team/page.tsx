
'use client';

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Search, Edit, Trash2, ArchiveRestore, Archive, LayoutGrid, List, ChevronDown, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getTeamMembers, getArchivedTeamMembers, createTeamMember, updateTeamMember, softDeleteTeamMember, restoreTeamMember, forceDeleteTeamMember, type TeamMember, getProfile, type User } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const roleVariantMap = {
  Administrator: "destructive",
  Editor: "default",
  Reviewer: "secondary",
  Viewer: "outline",
} as const;

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  role: z.enum(["Administrator", "Editor", "Reviewer", "Viewer"]),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [currentTab, setCurrentTab] = useState("active");
    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [memberToArchive, setMemberToArchive] = useState<TeamMember | null>(null);
    const [memberToRestore, setMemberToRestore] = useState<TeamMember | null>(null);
    const [memberToForceDelete, setMemberToForceDelete] = useState<TeamMember | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const router = useRouter();

    const refetchData = () => setDataVersion(v => v + 1);

    const form = useForm<TeamMemberFormValues>({
        resolver: zodResolver(teamMemberSchema),
    });

    useEffect(() => {
        if (editingMember) {
            form.reset({
                name: editingMember.name,
                email: editingMember.email,
                phone: editingMember.phone || '',
                role: editingMember.role,
            });
        } else {
            form.reset({ name: '', email: '', phone: '', role: 'Viewer' });
        }
    }, [editingMember, form]);

    useEffect(() => {
        async function fetchMembers() {
            if (!token) {
                toast({ title: "Authentication Error", variant: "destructive" });
                setIsLoading(false);
                router.push('/login');
                return;
            }

            setIsLoading(true);
            try {
                const fetchFunction = currentTab === 'active' ? getTeamMembers : getArchivedTeamMembers;
                const [members, profileResponse] = await Promise.all([
                    fetchFunction(token),
                    getProfile(token)
                ]);
                setTeamMembers(members);
                setCurrentUser(profileResponse.user || profileResponse.data || profileResponse);
            } catch (error: any) {
                toast({
                    title: `Failed to fetch team`,
                    description: error.message || "Could not fetch team data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchMembers();
    }, [toast, currentTab, dataVersion, token, router]);

    const handleFormSubmit = async (values: TeamMemberFormValues) => {
        if (!token) return;

        try {
            if (editingMember) {
                await updateTeamMember(token, editingMember.id, values);
                toast({ title: "Team member updated" });
            } else {
                await createTeamMember(token, values);
                toast({ title: "Team member added" });
            }
            refetchData();
            setDialogOpen(false);
            setEditingMember(null);
        } catch (error: any) {
            const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "An unexpected error occurred.";
            toast({
                title: editingMember ? 'Update Failed' : 'Creation Failed',
                description: description,
                variant: "destructive",
            });
        }
    };

    const handleEditClick = (member: TeamMember) => {
        setEditingMember(member);
        setDialogOpen(true);
    };
    
    const handleAddClick = () => {
        setEditingMember(null);
        setDialogOpen(true);
    }
    
    const handleArchive = async () => {
        if (!token || !memberToArchive) return;
        try {
            await softDeleteTeamMember(token, memberToArchive.id);
            toast({ title: "Member Archived" });
            refetchData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error archiving member', description: error.message });
        } finally {
            setMemberToArchive(null);
        }
    };
    
    const handleRestore = async () => {
        if (!token || !memberToRestore) return;
        try {
            await restoreTeamMember(token, memberToRestore.id);
            toast({ title: "Member Restored" });
            refetchData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error restoring member', description: error.message });
        } finally {
            setMemberToRestore(null);
        }
    };

    const handleForceDelete = async () => {
        if (!token || !memberToForceDelete) return;
        try {
            await forceDeleteTeamMember(token, memberToForceDelete.id);
            toast({ title: "Member Permanently Deleted" });
            refetchData();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error deleting member', description: error.message });
        } finally {
            setMemberToForceDelete(null);
        }
    };

    const filteredMembers = useMemo(() => teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [teamMembers, searchQuery]);
    
    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    const renderContent = (isArchived: boolean) => {
        if (isLoading) {
            return <LoadingSkeleton view={viewMode} />;
        }
        if (filteredMembers.length === 0) {
            return (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No {isArchived ? "archived" : ""} members found.</p>
                </div>
            )
        }
        const viewProps = {
            members: filteredMembers,
            isArchived,
            onEdit: handleEditClick,
            onArchive: setMemberToArchive,
            onRestore: setMemberToRestore,
            onForceDelete: setMemberToForceDelete,
            onAdd: handleAddClick,
            currentUser,
        };
        return viewMode === 'grid' ? <UsersGrid {...viewProps} /> : <UsersTable {...viewProps} />;
    }

    return (
        <>
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
                                <Button variant="outline" className="flex items-center gap-1 text-primary border-primary bg-primary/10 hover:bg-primary/10 hover:text-primary">
                                    <ViewIcon className="h-4 w-4" />
                                    <span>View: {viewMode === 'grid' ? 'Grid' : 'List'}</span>
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
                            <Input placeholder="Search members..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </header>
                 <main className="flex-1 p-6 overflow-y-auto">
                    <Tabs value={currentTab}>
                        <TabsContent value="active" className="mt-0">{renderContent(false)}</TabsContent>
                        <TabsContent value="archived" className="mt-0">{renderContent(true)}</TabsContent>
                    </Tabs>
                </main>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if(!isOpen) setEditingMember(null); }}>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                    <DialogHeader>
                      <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
                      <DialogDescription>
                        {editingMember ? 'Update the details for this team member.' : 'Invite a new member to collaborate with your team.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><Label>Name</Label><FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label>Email</Label><FormControl><Input type="email" placeholder="ada@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Phone (Optional)</Label><FormControl><Input type="tel" placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="role" render={({ field }) => (<FormItem><Label>Role</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Administrator">Administrator</SelectItem><SelectItem value="Editor">Editor</SelectItem><SelectItem value="Reviewer">Reviewer</SelectItem><SelectItem value="Viewer">Viewer</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <PlusCircle className="mr-2 h-4 w-4 animate-spin" />}{editingMember ? 'Save Changes' : 'Send Invitation'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

             <AlertDialog open={!!memberToArchive} onOpenChange={(open) => !open && setMemberToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Archive Member?</AlertDialogTitle><AlertDialogDescription>This will move the member to the archived list. They will lose access.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!memberToRestore} onOpenChange={(open) => !open && setMemberToRestore(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Restore Member?</AlertDialogTitle><AlertDialogDescription>This will restore the member to your active list and grant them access again.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!memberToForceDelete} onOpenChange={(open) => !open && setMemberToForceDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone and will permanently remove this team member.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleForceDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

interface UsersViewProps {
  members: TeamMember[];
  isArchived: boolean;
  onEdit: (member: TeamMember) => void;
  onArchive: (member: TeamMember) => void;
  onRestore: (member: TeamMember) => void;
  onForceDelete: (member: TeamMember) => void;
  onAdd: () => void;
  currentUser: User | null;
}

function UsersGrid({ members, isArchived, onEdit, onArchive, onRestore, onForceDelete, onAdd, currentUser }: UsersViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {members.map(member => (
        <Card key={member.id} className="bg-card shadow-sm hover:shadow-md transition-shadow relative">
           <CardHeader className="flex flex-col items-center text-center p-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                        {isArchived ? (
                            <>
                                <DropdownMenuItem onSelect={() => onRestore(member)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onForceDelete(member)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem onSelect={() => onEdit(member)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onArchive(member)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Avatar className="h-16 w-16 mb-2"><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>
                <CardTitle className="text-lg flex items-center gap-2">
                    {member.name}
                    {currentUser?.id === member.id && <Badge variant="secondary">You</Badge>}
                </CardTitle>
                <CardDescription>{member.email}</CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col items-center gap-2 p-4 pt-0">
             <Badge variant={roleVariantMap[member.role]}>{member.role}</Badge>
           </CardContent>
        </Card>
      ))}
      {!isArchived && (
          <Card 
            onClick={onAdd}
            className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[224px] h-full"
          >
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
              <UserPlus className="h-8 w-8 text-slate-400" />
            </div>
            <Button variant="ghost" className="pointer-events-none text-primary bg-primary/10 hover:bg-primary/20">
                ADD TEAM MEMBER
            </Button>
          </Card>
      )}
    </div>
  )
}

function UsersTable({ members, isArchived, onEdit, onArchive, onRestore, onForceDelete, onAdd, currentUser }: UsersViewProps) {
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead>Role</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>
                  <span>{member.name}</span>
                  {currentUser?.id === member.id && <Badge variant="secondary">You</Badge>}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{member.email}</TableCell>
              <TableCell><Badge variant={roleVariantMap[member.role]}>{member.role}</Badge></TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                    {isArchived ? (
                        <>
                            <DropdownMenuItem onSelect={() => onRestore(member)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onForceDelete(member)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuItem onSelect={() => onEdit(member)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onArchive(member)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
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
                  <button onClick={onAdd} className="text-primary hover:underline text-sm font-medium flex items-center gap-2">
                    <PlusCircle className="h-4 w-4"/> Add new member...
                  </button>
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
    </Card>
  );
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
          <TableHeader><TableRow>{[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
          <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
        </Table>
      </Card>
    );
}
