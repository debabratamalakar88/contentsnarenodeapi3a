
'use client'

import { 
    Users, 
    MoreHorizontal, 
    Folder, 
    ChevronDown, 
    LayoutGrid, 
    Search,
    Layers,
    List
} from "lucide-react"
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const requests = [
  {
    id: "REQ-001",
    title: "New Request",
    client: { name: "(No client)", initial: "NC" },
    dueDate: "21/07/2025",
    progress: 0,
    approved: 0,
    complete: 0,
    toDo: 1,
    status: "Draft",
    ownerInitial: "A"
  },
  {
    id: "REQ-002",
    title: "Reqq 1",
    client: { name: "(No client)", initial: "NC" },
    dueDate: "21/07/2025",
    progress: 0,
    approved: 0,
    complete: 0,
    toDo: 1,
    status: "Draft",
    ownerInitial: "B"
  },
  {
    id: "REQ-003",
    title: "New Request",
    client: { name: "(No client)", initial: "NC" },
    dueDate: "21/07/2025",
    progress: 0,
    approved: 0,
    complete: 0,
    toDo: 1,
    status: "Draft",
    ownerInitial: "C"
  },
  {
    id: "REQ-004",
    title: "nn1",
    client: { name: "(No client)", initial: "NC" },
    dueDate: "21/07/2025",
    progress: 0,
    approved: 0,
    complete: 3,
    toDo: 3,
    status: "Draft",
    ownerInitial: "D"
  },
]

const FilterButton = ({ label, value }: { label: string; value: string }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 font-normal h-9">
                {label}: <span className="font-semibold">{value}</span> <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            <DropdownMenuItem>{value}</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)

const RequestCard = ({ request }: { request: typeof requests[0] }) => {
    return (
        <Card className="bg-white hover:shadow-md transition-shadow flex flex-col group">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{request.client.name}</p>
                        <p className="text-xs text-muted-foreground">Client</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem>Edit</DropdownMenuItem>
                         <DropdownMenuItem>Duplicate</DropdownMenuItem>
                         <DropdownMenuItem>Archive</DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow flex flex-col">
                <h3 className="font-bold text-lg mb-1">{request.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">Due: {request.dueDate}</p>
                
                <div className="relative flex-grow flex flex-col justify-center min-h-[90px]">
                    {/* Normal view */}
                    <div className="space-y-3 transition-opacity duration-200 group-hover:opacity-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{request.progress}%</span>
                            <Progress value={request.progress} className="h-1" />
                        </div>
                        <div className="flex justify-between text-center">
                            <div>
                                <p className="font-bold">{request.approved}</p>
                                <p className="text-xs text-muted-foreground">Approved</p>
                            </div>
                            <div>
                                <p className="font-bold">{request.complete}</p>
                                <p className="text-xs text-muted-foreground">Complete</p>
                            </div>
                            <div>
                                <p className="font-bold">{request.toDo}</p>
                                <p className="text-xs text-muted-foreground">To Do</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Hover view */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="flex flex-col gap-2 w-full px-4">
                            <Button variant="outline" size="sm" className="rounded-full">PREVIEW</Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-full">PUBLISH</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
                 <Badge variant="outline" className="font-semibold">{request.status.toUpperCase()}</Badge>
                 <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{request.ownerInitial}</AvatarFallback>
                 </Avatar>
            </CardFooter>
        </Card>
    )
}

const RequestRow = ({ request }: { request: typeof requests[0] }) => (
     <TableRow>
        <TableCell className="font-medium">{request.title}</TableCell>
        <TableCell>{request.client.name}</TableCell>
        <TableCell>
            <Badge variant="outline">{request.status}</Badge>
        </TableCell>
        <TableCell>{request.dueDate}</TableCell>
        <TableCell className="text-right">{request.progress}%</TableCell>
         <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
)


export default function RequestsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Group By:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 h-9">
                                <Folder className="h-4 w-4" />
                                Folder
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="start">
                            <DropdownMenuItem>Folder</DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Filter By:</span>
                    <FilterButton label="Status" value="All" />
                    <FilterButton label="Owner" value="Anyone" />
                    <FilterButton label="Client" value="All" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 h-9">
                                <ViewIcon className="h-4 w-4" />
                                {viewMode === 'grid' ? 'Grid' : 'List'}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search requests..." className="pl-9 h-9" />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold">Default Folder</h2>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                             <DropdownMenuItem>Rename</DropdownMenuItem>
                             <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {viewMode === 'grid' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {requests.map(request => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                        <Link href="/dashboard/requests/new">
                            <div className="flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer border-2 border-dashed hover:border-primary/50 rounded-lg min-h-[265px] h-full text-muted-foreground">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                                    <Layers className="h-8 w-8 text-slate-400" />
                                </div>
                                <div className="text-purple-700 font-semibold bg-purple-200/80 px-4 py-2 rounded-md">
                                    ADD NEW REQUEST
                                </div>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Progress</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(request => (
                                    <RequestRow key={request.id} request={request} />
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </main>
        </div>
    )
}
