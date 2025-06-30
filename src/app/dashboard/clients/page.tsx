
'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, LayoutGrid, MoreHorizontal, ChevronDown, List, ArrowUpDown, Layers } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

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
            <TabsContent value="active">
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {clients.map((client) => (
                        <Card key={client.email} className="bg-card shadow-sm hover:shadow-md transition-shadow relative">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground">
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
                            <CardContent className="flex flex-col items-center text-center p-6 pt-8">
                                <Avatar className="h-16 w-16 mb-4">
                                    <AvatarFallback className="bg-green-100 text-green-800 font-bold text-xl">
                                        {client.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-lg">{client.name}</p>
                                <p className="text-sm text-muted-foreground mt-2">{client.company}</p>
                                <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                    <p>{client.email}</p>
                                    <p>{client.phone}</p>
                                </div>
                            </CardContent>
                        </Card>
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
                                    <Link href="/dashboard/clients/new" className="text-primary hover:underline text-sm font-medium">Add a client...</Link>
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
  );
}
