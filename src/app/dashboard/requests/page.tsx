import { PlusCircle, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const requests = [
  {
    id: "REQ-001",
    title: "New Client Onboarding",
    client: "Acme Inc.",
    status: "Published",
    dueDate: "2024-08-15",
  },
  {
    id: "REQ-002",
    title: "Website Content Update",
    client: "Stark Industries",
    status: "In Progress",
    dueDate: "2024-08-20",
  },
  {
    id: "REQ-003",
    title: "Marketing Campaign Assets",
    client: "Wayne Enterprises",
    status: "Draft",
    dueDate: "2024-09-01",
  },
  {
    id: "REQ-004",
    title: "Q3 Report Data",
    client: "Cyberdyne Systems",
    status: "Completed",
    dueDate: "2024-07-30",
  },
  {
    id: "REQ-005",
    title: "Product Launch Info",
    client: "Ollivanders Wand Shop",
    status: "Published",
    dueDate: "2024-08-10",
  },
]

const statusVariant = {
  Published: "secondary",
  'In Progress': "default",
  Draft: "outline",
  Completed: "destructive", // Just for variety
} as const

export default function RequestsPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed" className="hidden sm:flex">
            Completed
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline">
            Export
          </Button>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/dashboard/requests/new">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Request
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>
              Manage your content requests and view their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    ID
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Due Date
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="hidden sm:table-cell font-medium">
                      {request.id}
                    </TableCell>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.client}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={statusVariant[request.status as keyof typeof statusVariant]}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {request.dueDate}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Preview</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
