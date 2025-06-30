
'use client'

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, LayoutGrid, MoreHorizontal, Layers, ChevronDown } from "lucide-react";

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
                <Button variant="outline">IMPORT</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                            <LayoutGrid className="h-4 w-4" />
                            <span>View: Grid</span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Grid</DropdownMenuItem>
                        <DropdownMenuItem>List</DropdownMenuItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {clients.map((client) => (
                        <Card key={client.email} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex-row items-center justify-between p-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-green-100 text-green-700 font-bold text-lg">
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

                    <Card className="border-dashed border-2 bg-muted/20 hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center min-h-[220px] cursor-pointer">
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4">
                                <Layers className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <Button variant="ghost" className="text-primary hover:text-primary font-semibold text-sm">
                                ADD NEW CLIENT
                            </Button>
                        </div>
                    </Card>
                </div>
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
