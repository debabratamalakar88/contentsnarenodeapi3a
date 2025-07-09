
'use client'

import {
  Activity,
  ArrowUpRight,
  ClipboardList,
  Users,
  FileText,
  PlusCircle,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getRequests, getClients, type Request, type Client } from "@/lib/api"


const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}


export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadDashboardData() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const [requestsResponse, clientsResponse] = await Promise.all([
            getRequests(token),
            getClients(token)
        ]);
        setRequests(requestsResponse.data || []);
        setClients(clientsResponse || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load dashboard",
          description: error.message || "Could not fetch necessary data."
        })
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [router, toast])

  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c.full_name]));
  }, [clients]);

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>An overview of your most recent content requests.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        {[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            {[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm m-6">
        <div className="flex flex-col items-center gap-1 text-center p-10">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no requests yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first content request.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/requests/new"><PlusCircle className="mr-2 h-4 w-4"/>Create Request</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.filter(r => r.status === 'published' || r.status === 'draft').length}</div>
            <p className="text-xs text-muted-foreground">
              Total active requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total clients managed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +1 new template this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              New submissions today
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                An overview of your most recent content requests.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/requests">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Request
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.slice(0, 5).map((request) => {
                   const clientName = request.client_id && request.client_id.length > 0 ? clientMap.get(request.client_id[0]) || "(No Client)" : "(No Client)";
                   return (
                    <TableRow key={request.id}>
                      <TableCell>
                         <div className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
                           </Avatar>
                           <div>
                            <div className="font-medium">{clientName}</div>
                            {/* You can add client email here if available */}
                           </div>
                         </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {request.title}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge className="text-xs capitalize" variant="outline">
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {request.due_date ? format(parseISO(request.due_date), 'PPP') : 'N/A'}
                      </TableCell>
                    </TableRow>
                   )
                })}
                 {requests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No recent requests.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
