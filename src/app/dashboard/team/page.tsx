
'use client';

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Search, Edit, Trash2, ArchiveRestore, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getTeamMembers, getArchivedTeamMembers, createTeamMember, updateTeamMember, softDeleteTeamMember, restoreTeamMember, forceDeleteTeamMember, type TeamMember } from "@/lib/api";
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
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [currentTab, setCurrentTab] = useState("active");
    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

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
                const members = await fetchFunction(token);
                setTeamMembers(members);
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

    const renderContent = () => {
        if (isLoading) {
            return (
                <Card>
                    <Table>
                        <TableHeader><TableRow>{[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
                        <TableBody>{[...Array(5)].map((_, i) => <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>)}</TableBody>
                    </Table>
                </Card>
            )
        }
        if (filteredMembers.length === 0) {
            return (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No {currentTab === "archived" ? "archived" : ""} members found.</p>
                </div>
            )
        }

        return (
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                        </Avatar>
                                        {member.name}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">{member.email}</TableCell>
                                <TableCell>
                                    <Badge variant={roleVariantMap[member.role]}>{member.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {currentTab === 'active' ? (
                                                <>
                                                    <DropdownMenuItem onSelect={() => handleEditClick(member)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setMemberToArchive(member)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem onSelect={() => setMemberToRestore(member)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setMemberToForceDelete(member)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Team Management</h1>
                        <p className="text-muted-foreground">Invite and manage your team members.</p>
                    </div>
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                </div>

                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <div className="flex justify-between items-center mb-4">
                        <TabsList>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search members..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <TabsContent value="active">{renderContent()}</TabsContent>
                    <TabsContent value="archived">{renderContent()}</TabsContent>
                </Tabs>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
