
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
    Home, MoreHorizontal, Filter, Search, LayoutGrid, DollarSign, Building2, Receipt, FileText, 
    Book, Briefcase, Palette, GraduationCap, PartyPopper, Landmark, Shield, UserCheck, 
    Handshake, Mail, Users, Scale, Monitor, Code, Star, MessageSquare, Utensils, Mic,
    ThumbsUp, Video, Wrench, Link2, CalendarDays, Target, Plus, FolderOpen, type LucideIcon
} from "lucide-react";
import { getTemplateCategories, getTemplates, type TemplateCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';

const TemplateCard = ({ template, onSelect }: { template: any; onSelect: () => void; }) => {
    const IconComponent = iconList.find(i => i.name.toLowerCase() === template.icon?.toLowerCase())?.icon || FileText;
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group flex flex-col bg-card" onClick={onSelect}>
        <CardContent className="p-4 flex gap-4 items-start flex-grow">
          <div className={`p-3 rounded-lg bg-muted flex-shrink-0`}>
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
          </div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onSelect}>Use Template</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    );
};

export default function TemplatesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    useEffect(() => {
        if (!token) return;

        async function fetchData() {
            setIsLoading(true);
            try {
                const [cats, tpls] = await Promise.all([
                    getTemplateCategories(token),
                    getTemplates(token, activeCategorySlug || undefined, searchTerm || undefined)
                ]);
                setCategories(cats);
                setTemplates(tpls);
            } catch (err: any) {
                toast({ title: 'Error fetching templates', description: err.message, variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }

        const timer = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search

        return () => clearTimeout(timer);

    }, [token, toast, activeCategorySlug, searchTerm]);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
        e.preventDefault();
        setActiveCategorySlug(slug === activeCategorySlug ? null : slug);
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const groupedTemplates = templates.reduce((acc, tpl) => {
        const categoryName = tpl.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = { ...tpl.category, items: [] };
        }
        acc[categoryName].items.push(tpl);
        return acc;
    }, {} as Record<string, {items: any[]} & TemplateCategory>);

    return (
        <div className="flex flex-1 overflow-hidden h-full bg-muted/40">
            {/* Left Sidebar */}
            <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0 flex flex-col">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">TEMPLATE GALLERY</h3>
                <ul className="space-y-1 flex-grow">
                    {isLoading ? (
                         [...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)
                    ) : (
                        categories.map((cat) => (
                            <li key={cat.id}>
                                <a
                                    href="#"
                                    onClick={(e) => handleCategoryClick(e, cat.slug)}
                                    className={`flex items-center justify-between p-2 rounded-md font-semibold text-sm transition-colors ${activeCategorySlug === cat.slug ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon iconName={cat.icon} />
                                        <span>{cat.title}</span>
                                    </div>
                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{cat.template_count}</span>
                                </a>
                            </li>
                        ))
                    )}
                </ul>
                <div className="mt-auto pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/requests/new">
                        <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                    </Link>
                  </Button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                 <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button className="bg-primary hover:bg-primary/90" asChild>
                            <Link href="/dashboard/requests/new">
                                <Plus className="mr-2 h-4 w-4" /> START FROM SCRATCH
                            </Link>
                        </Button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search for a template..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-8">
                    {isLoading ? (
                        [...Array(2)].map((_, i) => (
                            <section key={i}>
                                <Skeleton className="h-8 w-48 mb-4 rounded-md" />
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {[...Array(4)].map((_, j) => (
                                        <Card key={j}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                       Object.entries(groupedTemplates).length > 0 ? (
                            Object.entries(groupedTemplates).map(([categoryName, data]) => (
                                <section key={categoryName}>
                                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
                                        <CategoryIcon iconName={data.icon} /> {categoryName}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {data.items.map((template) => (
                                            <TemplateCard key={template.id} template={template} onSelect={() => {}} />
                                        ))}
                                    </div>
                                </section>
                            ))
                       ) : (
                         <div className="text-center py-20">
                            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Templates Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
                         </div>
                       )
                    )}
                </div>
            </main>
        </div>
    );
}
