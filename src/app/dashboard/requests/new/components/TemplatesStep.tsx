
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Search, Plus, FolderOpen
} from "lucide-react";
import { getTemplates, getTemplateCategories, type Template, type TemplateCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';
import Link from 'next/link';

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
                    getTemplates(token)
                ]);

                setCategories(catsResponse || []);
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

    }, [token, toast]);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null) => {
        e.preventDefault();
        setActiveCategorySlug(slug);
        const targetId = slug ? `category-${slug}` : 'my-templates';
        const section = document.getElementById(targetId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
     const filteredTemplates = useMemo(() => {
        if (!Array.isArray(templates)) return [];
        let filtered = templates;

        if (activeCategorySlug) {
            filtered = filtered.filter(tpl => tpl.category?.slug === activeCategorySlug);
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(tpl => 
                tpl.title.toLowerCase().includes(searchLower) || 
                (tpl.description && tpl.description.toLowerCase().includes(searchLower))
            );
        }
        
        return filtered;
    }, [templates, activeCategorySlug, searchTerm]);

    const groupedTemplates = useMemo(() => {
        return filteredTemplates.reduce((acc, tpl) => {
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
    }, [filteredTemplates]);

    const visibleCategories = useMemo(() => {
        if (!Array.isArray(categories) || !Array.isArray(templates)) return [];
        const templateCategoryIds = new Set(templates.map(tpl => tpl.category?.id).filter(id => id !== undefined));
        return categories.filter(cat => templateCategoryIds.has(cat.id));
    }, [categories, templates]);
    
    return (
        <div className="flex flex-1 overflow-hidden h-full bg-muted/40">
            <aside className="w-64 bg-background border-r p-4 overflow-y-auto shrink-0 flex flex-col">
                <h3 className="text-xs font-semibold text-muted-foreground mb-4 px-2 tracking-widest">TEMPLATE GALLERY</h3>
                <ul className="space-y-2 flex-grow">
                     {isLoading ? (
                         [...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)
                    ) : (
                        <>
                            <li>
                                <a
                                    href="#"
                                    onClick={(e) => handleCategoryClick(e, null)}
                                    className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:text-primary ${activeCategorySlug === null ? 'text-primary bg-primary/10' : ''}`}
                                >
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#64748b' }}/>
                                    <span>My Templates</span>
                                </a>
                            </li>
                            {visibleCategories.map((cat) => (
                                <li key={cat.slug}>
                                    <a
                                        href={`#category-${cat.slug}`}
                                        onClick={(e) => handleCategoryClick(e, cat.slug)}
                                        className={`flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:text-primary ${activeCategorySlug === cat.slug ? 'text-primary bg-primary/10' : ''}`}
                                    >
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color || 'hsl(var(--muted-foreground))' }}/>
                                        <span>{cat.title}</span>
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
                                return (
                                    <section key={categoryName} id={`category-${data.slug}`}>
                                        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
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
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
                         </div>
                       )
                    )}
                </div>
            </main>
        </div>
    );
}
