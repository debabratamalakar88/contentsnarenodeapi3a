
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Search, Plus, FolderOpen, Eye
} from "lucide-react";
import { getTemplates, getTemplateCategories, type Template, type TemplateCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const TemplateCard = ({ template }: { template: Template; }) => (
  <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
    <Link href={`/dashboard/templates/preview/${template.id}`} className="flex flex-col flex-grow">
      <CardContent className="p-4 flex gap-4 items-start flex-grow">
        <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
        <div className="flex-grow">
          <h3 className="font-semibold">{template.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
        </div>
      </CardContent>
    </Link>
     <div className="p-2 border-t flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/templates/preview/${template.id}`}><Eye className="mr-2 h-4 w-4"/>Preview</Link>
        </Button>
        <Button size="sm" asChild>
            <Link href={`/dashboard/requests/new/essentials?templateId=${template.id}`}>Use Template</Link>
        </Button>
    </div>
  </Card>
);

export default function TemplatesPage() {
    const { toast } = useToast();
    const router = useRouter();

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
            router.push('/login');
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const [catsResponse, tplsResponse] = await Promise.all([
                    getTemplateCategories(token),
                    getTemplates(token)
                ]);
                
                setCategories(Array.isArray(catsResponse) ? catsResponse : []);
                setTemplates(tplsResponse?.data || []);

            } catch (err: any) {
                toast({ title: 'Error fetching data', description: err.message, variant: 'destructive' });
                setCategories([]);
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchData();

    }, [token, toast, router]);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null) => {
        e.preventDefault();
        setActiveCategorySlug(slug);
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const filteredTemplatesBySearch = useMemo(() => {
        if (!Array.isArray(templates)) return [];
        const searchLower = searchTerm.toLowerCase();
        if (!searchLower) return templates;
        
        return templates.filter(tpl => 
            tpl.title.toLowerCase().includes(searchLower) || 
            (tpl.description && tpl.description.toLowerCase().includes(searchLower))
        );
    }, [templates, searchTerm]);
    
    const visibleCategories = useMemo(() => {
        if (!Array.isArray(categories) || !Array.isArray(filteredTemplatesBySearch)) return [];
        
        const templateCategorySlugs = new Set(
            filteredTemplatesBySearch.map(tpl => tpl.category?.slug).filter(Boolean)
        );

        return categories.filter(cat => templateCategorySlugs.has(cat.slug));
    }, [categories, filteredTemplatesBySearch]);

    const groupedAndFilteredTemplates = useMemo(() => {
        let filteredByCategory = filteredTemplatesBySearch;
        if (activeCategorySlug) {
            filteredByCategory = filteredTemplatesBySearch.filter(tpl => tpl.category?.slug === activeCategorySlug);
        }
        
        return filteredByCategory.reduce((acc, tpl) => {
            const categoryTitle = tpl.category?.title || 'Uncategorized';
            if (!acc[categoryTitle]) {
                 acc[categoryTitle] = { 
                    ...(tpl.category || {}),
                    title: categoryTitle,
                    slug: tpl.category?.slug || 'uncategorized',
                    items: [] 
                };
            }
            acc[categoryTitle].items.push(tpl);
            return acc;
        }, {} as Record<string, {items: Template[]; slug: string; color?: string | null; title?: string}>);
    }, [filteredTemplatesBySearch, activeCategorySlug]);
    
    return (
        <div className="flex flex-1 overflow-hidden h-full bg-muted/40">
            <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0 flex flex-col">
                <h3 className="text-xs font-semibold text-muted-foreground mb-4 px-2 tracking-widest">TEMPLATE GALLERY</h3>
                <ul className="space-y-1 flex-grow">
                     {isLoading ? (
                         [...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)
                    ) : (
                        <>
                            <li>
                                <a
                                    href="#"
                                    onClick={(e) => handleCategoryClick(e, null)}
                                    className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:text-primary ${activeCategorySlug === null ? 'text-primary' : ''}`}
                                >
                                    All Templates
                                </a>
                            </li>
                            {visibleCategories.map((cat) => (
                                <li key={cat.slug}>
                                    <a
                                        href={`#category-${cat.slug}`}
                                        onClick={(e) => handleCategoryClick(e, cat.slug)}
                                        className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:text-primary ${activeCategorySlug === cat.slug ? 'text-primary' : ''}`}
                                    >
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color || 'hsl(var(--muted-foreground))' }}/>
                                        <span>{cat.title}</span>
                                    </a>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            </aside>
            
            <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                 <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button className="bg-primary hover:bg-primary/90" asChild>
                            <Link href="/dashboard/requests/new/templates"><Plus className="mr-2 h-4 w-4" /> START FROM SCRATCH</Link>
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
                       Object.keys(groupedAndFilteredTemplates).length > 0 ? (
                            Object.entries(groupedAndFilteredTemplates).sort(([a], [b]) => a.localeCompare(b)).map(([categoryName, data]) => {
                                return (
                                    <section key={categoryName} id={`category-${data.slug}`}>
                                        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
                                            {data.title}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                            {data.items.map((template) => (
                                                <TemplateCard key={template.id} template={template} />
                                            ))}
                                        </div>
                                    </section>
                                )
                            })
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

