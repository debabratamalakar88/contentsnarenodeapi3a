import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Search } from "lucide-react"

const clients = [
  {
    name: "Acme Inc.",
    email: "contact@acme.com",
    phone: "555-0101",
    company: "Acme Inc.",
    addedOn: "2023-10-25",
  },
  {
    name: "Stark Industries",
    email: "tony@stark.com",
    phone: "555-0102",
    company: "Stark Industries",
    addedOn: "2023-11-12",
  },
  {
    name: "Wayne Enterprises",
    email: "bruce@wayne.com",
    phone: "555-0103",
    company: "Wayne Enterprises",
    addedOn: "2023-11-15",
  },
  {
    name: "Cyberdyne Systems",
    email: "info@cyberdyne.com",
    phone: "555-0104",
    company: "Cyberdyne Systems",
    addedOn: "2023-12-01",
  },
  {
    name: "Ollivanders Wand Shop",
    email: "sales@ollivanders.co.uk",
    phone: "555-0105",
    company: "Ollivanders",
    addedOn: "2024-01-20",
  },
]

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client list.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Import</Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Client
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client List</CardTitle>
              <CardDescription>
                A list of all clients in your account.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search clients..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Added On</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.email}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{client.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{client.addedOn}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Client</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Create Request</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete Client</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
