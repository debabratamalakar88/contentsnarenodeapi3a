
'use client'

import { 
    Users, 
    MoreHorizontal, 
    ChevronDown, 
    LayoutGrid, 
    Search,
    Layers,
    List,
    User,
    Mail
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
    client: { name: "dfdsffs", initial: "D" },
    clientCompany: "sdfdf",
    dueDate: "21/07/2025",
    status: "Draft",
    approved: 0,
    complete: 0,
    toDo: 1,
  },
  {
    id: "REQ-002",
    title: "New Request",
    client: { name: "(No Client)", initial: "" },
    clientCompany: "",
    dueDate: "21/07/2025",
    status: "Draft",
    approved: 0,
    complete: 0,
    toDo: 1,
  },
  {
    id: "REQ-003",
    title: "Reqq 1",
    client: { name: "(No Client)", initial: "" },
    clientCompany: "",
    dueDate: "21/07/2025",
    status: "Draft",
    approved: 0,
    complete: 0,
    toDo: 1,
  },
  {
    id: "REQ-004",
    title: "nn1",
    client: { name: "(No Client)", initial: "" },
    clientCompany: "",
    dueDate: "21/07/2025",
    status: "Draft",
    approved: 0,
    complete: 3,
    toDo: 3,
  },
]

const ownerData = {
    name: "Dev Test",
    email: "debabrata@narayanidigital.com",
    avatarInitial: "DT",
    requests: requests
}

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
    const totalTasks = request.complete + request.toDo;
    const progress = totalTasks > 0 ? (request.complete / totalTasks) * 100 : 0;
    
    return (
        <Card className="bg-white hover:shadow-md transition-shadow flex flex-col group">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-2">
                     {request.client.name === "(No Client)" ? (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                     ) : (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-800">{request.client.initial}</AvatarFallback>
                        </Avatar>
                     )}
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
            <CardContent className="p-4 pt-0 flex-grow flex flex-col relative min-h-[120px]">
                <div className="transition-opacity duration-200 group-hover:opacity-0">
                    <h3 className="font-bold mb-1 mt-4">{request.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">Due: {request.dueDate}</p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                            <Progress value={progress} className="h-1" />
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
                </div>
                {/* Hover state: Buttons */}
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <Button variant="outline" size="sm" className="rounded-full px-8 bg-white">PREVIEW</Button>
                     <Button size="sm" className="rounded-full px-8">PUBLISH</Button>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <Badge variant="outline" className="font-semibold text-gray-600 bg-gray-100">{request.status.toUpperCase()}</Badge>
            </CardFooter>
        </Card>
    )
}

const RequestRow = ({ request }: { request: (typeof requests)[0] }) => (
     <TableRow>
        <TableCell className="font-medium">{request.title}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
            {request.client.name === "(No Client)" ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            ) : (
                <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-800">{request.client.initial}</AvatarFallback>
                </Avatar>
            )}
            <span>{request.client.name}</span>
            </div>
        </TableCell>
        <TableCell>{request.clientCompany}</TableCell>
        <TableCell>{request.dueDate}</TableCell>
        <TableCell>
            <Badge variant="outline">{request.status.toUpperCase()}</Badge>
        </TableCell>
        <TableCell>{request.approved}</TableCell>
        <TableCell>{request.complete}</TableCell>
        <TableCell>{request.toDo}</TableCell>
        <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
)

const RequestsTable = ({ requests }: { requests: any[] }) => {
    return (
        <div>
            <div className="flex items-center gap-4 p-4 bg-background rounded-t-lg border-x border-t">
                <Avatar className="h-10 w-10 bg-muted">
                     <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">Dev Test</p>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">YOU</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">debabrata@narayanidigital.com</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Collapse</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <Card className="rounded-t-none">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Request Name</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Client Name</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Client Company</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Due Date</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Approved</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Completed</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase">To Do</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                           <RequestRow key={request.id} request={request} />
                        ))}
                        <TableRow>
                            <TableCell colSpan={9} className="py-2">
                                <Link href="/dashboard/requests/new" className="text-primary hover:underline text-sm font-medium">
                                    Add new request...
                                </Link>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}

const RequestsGrid = ({ owner }: { owner: typeof ownerData }) => {
    return (
        <div>
             <div className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 bg-muted">
                     <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{owner.name}</p>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">YOU</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{owner.email}</span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Collapse</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {owner.requests.map(request => (
                    <RequestCard key={request.id} request={request} />
                ))}
                <Link href="/dashboard/requests/new">
                    <div className="flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer border-2 border-dashed hover:border-primary/50 rounded-lg min-h-[290px] h-full text-muted-foreground">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                            <Layers className="h-8 w-8 text-slate-400" />
                        </div>
                        <Button variant="ghost" className="text-primary font-semibold bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-lg">
                            ADD NEW REQUEST
                        </Button>
                    </div>
                </Link>
            </div>
        </div>
    )
}


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
                                <User className="h-4 w-4" />
                                Owner
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="start">
                            <DropdownMenuItem>Owner</DropdownMenuItem>
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
                {viewMode === 'grid' ? (
                     <RequestsGrid owner={ownerData} />
                ) : (
                    <RequestsTable requests={requests} />
                )}
            </main>
        </div>
    )
}
