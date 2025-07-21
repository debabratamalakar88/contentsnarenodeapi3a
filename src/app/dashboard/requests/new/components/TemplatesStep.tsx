

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
    MoreHorizontal, Search, Plus, FolderOpen
} from "lucide-react";
import { getTemplates, getTemplateCategories, type Template, type PaginatedResponse, type TemplateCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';


const TemplateIconDisplay = ({ iconName, categoryColor }: { iconName?: string | null, categoryColor?: string | null }) => {
    const IconComponent = useMemo(() => {
        if (!iconName) return FolderOpen;
        const foundIcon = iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase());
        return foundIcon ? foundIcon.icon : FolderOpen;
    }, [iconName]);

    return (
        <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: categoryColor ? `${categoryColor}20` : 'hsl(var(--muted))' }}>
            <IconComponent className="h-6 w-6" style={{ color: categoryColor || 'hsl(var(--muted-foreground))' }} />
        </div>
    );
};

const TemplateCard = ({ template, onSelect }: { template: Template; onSelect: () => void; }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer group flex flex-col bg-card" onClick={onSelect}>
    <CardContent className="p-4 flex gap-4 items-start flex-grow">
      <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
      <div className="flex-grow">
        <h3 className="font-semibold">{template.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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

interface TemplatesStepProps {
    onProceed: (isFromScratch: boolean, selectedTemplate?: Template) => void;
}

export default function TemplatesStep({ onProceed }: TemplatesStepProps) {
    const { toast } = useToast();
    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    useEffect(() => {
        if (!token) {
            toast({ title: 'Authentication Error', description: 'Please log in again.', variant: 'destructive' });
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const [catsResponse, tplsResponse] = await Promise.all([
                    getTemplateCategories(token),
                    getTemplates(token, searchTerm || undefined)
                ]);

                const categoriesData = Array.isArray(catsResponse) ? catsResponse : (catsResponse as any)?.data || [];
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                
                const templatesData = Array.isArray(tplsResponse) ? tplsResponse : (tplsResponse as PaginatedResponse<Template>)?.data || [];
                setTemplates(Array.isArray(templatesData) ? templatesData : []);

            } catch (err: any) {
                toast({ title: 'Error fetching data', description: err.message, variant: 'destructive' });
                setCategories([]);
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        }

        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);

    }, [token, toast, searchTerm]);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null) => {
        e.preventDefault();
        setActiveCategorySlug(slug);
        const targetId = slug ? `category-${slug}` : 'category-uncategorized';
        const section = document.getElementById(targetId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    const groupedTemplates = useMemo(() => {
        if (!Array.isArray(templates)) return {};
        
        const filtered = templates.filter(tpl => 
            tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (tpl.description && tpl.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return filtered.reduce((acc, tpl) => {
            const categoryName = tpl.category?.title || 'Uncategorized';
            if (!acc[categoryName]) {
                 acc[categoryName] = { 
                    ...tpl.category, 
                    title: categoryName,
                    slug: tpl.category?.slug || 'uncategorized',
                    items: [] 
                };
            }
            acc[categoryName].items.push(tpl);
            return acc;
        }, {} as Record<string, {items: Template[]; slug: string; color?: string; title: string}>);
    }, [templates, searchTerm]);

    const visibleCategories = useMemo(() => {
      const categorySlugsInTemplates = new Set(Object.values(groupedTemplates).map(g => g.slug));
      return categories.filter(cat => categorySlugsInTemplates.has(cat.slug));
    }, [groupedTemplates, categories]);
    
    return (
        <div className="flex flex-1 overflow-hidden h-full bg-muted/40">
            <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0 flex flex-col">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">TEMPLATE GALLERY</h3>
                <ul className="space-y-1 flex-grow">
                     {isLoading ? (
                         [...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)
                    ) : (
                        <>
                            <a
                                href="#"
                                onClick={(e) => handleCategoryClick(e, null)}
                                className={`flex items-center justify-between p-2 rounded-md font-semibold text-sm transition-colors ${activeCategorySlug === null ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                            >
                                All Templates
                            </a>
                            {visibleCategories.map((cat) => (
                                <li key={cat.slug}>
                                    <a
                                        href={`#category-${cat.slug}`}
                                        onClick={(e) => handleCategoryClick(e, cat.slug)}
                                        className={`flex items-center justify-between p-2 rounded-md font-semibold text-sm transition-colors ${activeCategorySlug === cat.slug ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || 'hsl(var(--muted-foreground))' }}/>
                                            <span>{cat.title}</span>
                                        </div>
                                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{cat.template_count}</span>
                                    </a>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
                <div className="mt-auto pt-4">
                  <Button variant="outline" className="w-full" onClick={() => onProceed(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                  </Button>
                </div>
            </aside>
            
            <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                 <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button className="bg-primary hover:bg-primary/90" onClick={() => onProceed(true)}>
                            <Plus className="mr-2 h-4 w-4" /> START FROM SCRATCH
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
                       Object.keys(groupedTemplates).length > 0 ? (
                            Object.entries(groupedTemplates).sort(([a], [b]) => a.localeCompare(b)).map(([categoryName, data]) => {
                                if (activeCategorySlug && activeCategorySlug !== data.slug) return null;
                                return (
                                    <section key={categoryName} id={`category-${data.slug}`}>
                                        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
                                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: data.color || 'hsl(var(--muted-foreground))' }} />
                                            {data.title}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                            {data.items.map((template) => (
                                                <TemplateCard key={template.id} template={template} onSelect={() => onProceed(false, template)} />
                                            ))}
                                        </div>
                                    </section>
                                )
                            })
                       ) : (
                         <div className="text-center py-20">
                            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Templates Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or create one from scratch.</p>
                         </div>
                       )
                    )}
                </div>
            </main>
        </div>
    );
}
