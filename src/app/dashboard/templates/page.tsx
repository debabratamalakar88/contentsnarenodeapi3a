
'use client';

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, MoreHorizontal, Filter, Search, LayoutGrid, DollarSign, Building2, Receipt, FileText } from "lucide-react";

// Mock Data
const categories = [
  { name: "My Templates", color: "text-pink-500", href: "#my-templates" },
  { name: "Accounting", color: "text-red-500", href: "#accounting" },
  { name: "Bookkeeping", color: "text-orange-500", href: "#bookkeeping" },
  { name: "Coaching/Consulting", color: "text-amber-500", href: "#coaching-consulting" },
  { name: "Design", color: "text-cyan-500", href: "#design" },
  { name: "Education", color: "text-blue-500", href: "#education" },
  { name: "Events", color: "text-purple-500", href: "#events" },
  { name: "Financial Planning", color: "text-emerald-500", href: "#financial-planning" },
  { name: "General", color: "text-gray-500", href: "#general" },
  { name: "Human Resources", color: "text-rose-500", href: "#human-resources" },
  { name: "Insurance", color: "text-sky-500", href: "#insurance" },
  { name: "Legal", color: "text-indigo-500", href: "#legal" },
  { name: "Marketing", color: "text-yellow-500", href: "#marketing" },
  { name: "Mortgage & Financing", color: "text-lime-500", href: "#mortgage-financing" },
  { name: "Real Estate", color: "text-green-500", href: "#real-estate" },
];

const myTemplates = [
  {
    id: 'temp-1',
    title: "Temp 1",
    description: "No description provided.",
    icon: <FileText className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
  {
    id: 'temp-2',
    title: "Temp 2",
    description: "No description provided.",
    icon: <FileText className="h-6 w-6 text-teal-600" />,
    bgColor: "bg-teal-100",
  },
];

const galleryTemplates = [
  {
    category: "Accounting",
    categoryColor: "text-red-500",
    items: [
      {
        id: 'gallery-1',
        title: "ATO Client-agent Linking",
        description: "This template walks clients through the steps to link you as their authorised agent using myID...",
        icon: <Building2 className="h-6 w-6 text-orange-600" />,
        bgColor: "bg-orange-100",
      },
      {
        id: 'gallery-2',
        title: "Accounting Client Onboarding (UK)",
        description: "Gather key financial and business Information from new accounting clients in the UK with this structured...",
        icon: <Home className="h-6 w-6 text-orange-600" />,
        bgColor: "bg-orange-100",
      },
      {
        id: 'gallery-3',
        title: "Accounting Client Onboarding - Business (AUS)",
        description: "Geared towards Australian accountants, this form will help facilitate an easy onboarding process...",
        icon: <DollarSign className="h-6 w-6 text-red-600" />,
        bgColor: "bg-red-100",
      },
       {
        id: 'gallery-4',
        title: "Accounting Client Onboarding - Business (NZ)",
        description: "Focusing on New Zealand accountants, this form will help facilitate an easy onboarding process...",
        icon: <Home className="h-6 w-6 text-red-600" />,
        bgColor: "bg-red-100",
      },
      {
        id: 'gallery-5',
        title: "Accounting Client Onboarding - Individual (AUS)",
        description: "Geared towards Australian accountants, this form will help facilitate an easy onboarding process...",
        icon: <Receipt className="h-6 w-6 text-amber-600" />,
        bgColor: "bg-amber-100",
      },
      {
        id: 'gallery-6',
        title: "Accounting Client Onboarding - Individual (NZ)",
        description: "Geared towards New Zealand accountants, this form will help facilitate an easy onboarding process...",
        icon: <Home className="h-6 w-6 text-amber-600" />,
        bgColor: "bg-amber-100",
      },
       {
        id: 'gallery-7',
        title: "Accounting Client Onboarding - Business (USA)",
        description: "Geared towards accountants in the USA, this form will help facilitate an easy onboarding process...",
        icon: <DollarSign className="h-6 w-6 text-red-600" />,
        bgColor: "bg-red-100",
      },
      {
        id: 'gallery-8',
        title: "Accounting Client Onboarding - Individual (USA)",
        description: "Geared towards accountants in the USA, this form will help facilitate an easy onboarding process...",
        icon: <Receipt className="h-6 w-6 text-amber-600" />,
        bgColor: "bg-amber-100",
      },
    ],
  },
];


const TemplateCard = ({ template }: { template: typeof myTemplates[0] }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer group flex flex-col">
    <CardContent className="p-4 flex gap-4 items-start flex-grow">
      <div className={`p-3 rounded-lg ${template.bgColor} flex-shrink-0`}>
        {template.icon}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{template.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Preview</DropdownMenuItem>
          <DropdownMenuItem>Use Template</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardContent>
  </Card>
);

export default function TemplatesPage() {
    const [activeCategory, setActiveCategory] = useState("My Templates");

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">TEMPLATE GALLERY</h3>
                    <ul className="space-y-1">
                        {categories.map((cat) => (
                            <li key={cat.name}>
                                <a
                                    href={cat.href}
                                    onClick={(e) => { e.preventDefault(); setActiveCategory(cat.name); }}
                                    className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors ${activeCategory === cat.name ? 'text-primary' : 'text-foreground hover:bg-muted'}`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${cat.color.replace('text-', 'bg-')}`}></span>
                                    {cat.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {/* Header */}
                     <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                        <div className="flex items-center justify-end gap-2">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="outline" className="flex items-center gap-1">
                                      <Filter className="h-4 w-4" />
                                      <span>Filter</span>
                                  </Button>
                              </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                  <DropdownMenuItem>All</DropdownMenuItem>
                                  <DropdownMenuItem>My Templates</DropdownMenuItem>
                                  <DropdownMenuItem>Narlax Templates</DropdownMenuItem>
                               </DropdownMenuContent>
                           </DropdownMenu>

                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-1 text-primary border-primary bg-primary/10">
                                        <LayoutGrid className="h-4 w-4" />
                                        <span>View: Grid</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                      <DropdownMenuItem>Grid</DropdownMenuItem>
                                      <DropdownMenuItem>List</DropdownMenuItem>
                                  </DropdownMenuContent>
                           </DropdownMenu>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search templates..." className="pl-9 w-64" />
                            </div>
                        </div>
                    </header>

                    {/* Content Body */}
                    <div className="p-6 space-y-8">
                        {/* My Templates Section */}
                        <section id="my-templates">
                            <h2 className="text-xl font-bold mb-4">My Templates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {myTemplates.map((template) => (
                                    <TemplateCard key={template.id} template={template} />
                                ))}
                                <Link href="/dashboard/requests/new">
                                  <div className="flex flex-col items-center justify-center bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed hover:border-primary/50 rounded-lg min-h-[120px] h-full">
                                    <Button variant="ghost" className="text-primary hover:bg-primary/10">CREATE NEW TEMPLATE</Button>
                                  </div>
                                </Link>
                            </div>
                        </section>

                        {/* Gallery Templates */}
                        {galleryTemplates.map((category) => (
                            <section key={category.category} id={category.category.toLowerCase().replace(/[\s&]+/g, '-')}>
                                <h2 className={`text-xl font-bold mb-4 ${category.categoryColor}`}>{category.category}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {category.items.map((template) => (
                                        <TemplateCard key={template.id} template={template as any} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
