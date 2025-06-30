
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, LayoutGrid, MoreHorizontal, ChevronDown, List, ArrowUpDown } from "lucide-react";

const clients = [
  {
    name: "Dev Test",
    company: "ASD",
    email: "ss@ss.com",
    phone: "+91 1211213244",
    initials: "DT",
  },
  {
    name: "Stark Industries",
    company: "Stark Industries",
    email: "tony@stark.com",
    phone: "555-0102",
    initials: "SI",
  },
  {
    name: "Wayne Enterprises",
    company: "Wayne Enterprises",
    email: "bruce@wayne.com",
    phone: "555-0103",
    initials: "WE",
  },
  {
    name: "Cyberdyne Systems",
    company: "Cyberdyne Systems",
    email: "info@cyberdyne.com",
    phone: "555-0104",
    initials: "CS",
  },
];

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

  return (
    <Dialog>
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
                <Button variant="outline">IMPORT</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1 text-primary border-primary hover:bg-primary/5 hover:text-primary">
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
                    <Input placeholder="Search clients..." className="pl-9" />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/40">
            <TabsContent value="active">
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {clients.map((client) => (
                        <Card key={client.email} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex-row items-center justify-between p-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                        {client.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Client</DropdownMenuItem>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Archive</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="font-semibold text-base">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.company}</p>
                                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                    <p>{client.email}</p>
                                    <p>{client.phone}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                     <DialogTrigger asChild>
                        <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow min-h-[220px] cursor-pointer border-dashed hover:border-primary">
                                <p className="text-primary font-semibold">Add a client...</p>
                        </Card>
                    </DialogTrigger>
                </div>
              )}
              {viewMode === 'list' && (
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
                            {clients.map((client) => (
                                <TableRow key={client.email}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.company}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Client</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Archive</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                             <TableRow>
                                <TableCell colSpan={5} className="py-4">
                                    <DialogTrigger asChild>
                                        <button className="text-primary hover:underline text-sm font-medium">Add a client...</button>
                                    </DialogTrigger>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="archived">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Archived clients will be shown here.</p>
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
     <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
                Enter the details for the new client. Click save when you're done.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    Name
                </Label>
                <Input id="name" placeholder="Acme Inc." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                    Company
                </Label>
                <Input id="company" placeholder="Acme Corporation" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input id="email" type="email" placeholder="contact@acme.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                    Phone
                </Label>
                <Input id="phone" type="tel" placeholder="555-0101" className="col-span-3" />
            </div>
        </div>
        <DialogFooter>
            <Button type="submit">Save Client</Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
  );
}
