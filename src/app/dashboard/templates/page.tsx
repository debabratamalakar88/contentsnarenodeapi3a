
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    Search, Plus, FolderOpen, LayoutGrid, List, ChevronDown, Rocket
} from "lucide-react";
import { getTemplates, getTemplateCategories, getMyTemplates, deleteMyTemplate, duplicateMyTemplate, type Template, type TemplateCategory, type MyTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  MyTemplateCard, 
  TemplateCard, 
  MyTemplatesTable, 
  TemplatesTable 
} from './TemplateComponents';


export default function TemplatesPage() {
    const { toast } = useToast();
    const router = useRouter();

    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [myTemplates, setMyTemplates] = useState<MyTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);
    const [dataVersion, setDataVersion] = useState(0);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [templateToDelete, setTemplateToDelete] = useState<MyTemplate | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        if (!token) {
            toast({ title: 'Authentication Error', description: 'Please log in again.', variant: 'destructive' });
            router.push('/login');
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const [catsResponse, tplsResponse, myTplsResponse] = await Promise.all([
                    getTemplateCategories(token!),
                    getTemplates(token!),
                    getMyTemplates(token!)
                ]);
                
                setCategories(Array.isArray(catsResponse) ? catsResponse : []);
                setTemplates(tplsResponse?.data || []);
                setMyTemplates(myTplsResponse?.data || []);

            } catch (err: any) {
                toast({ title: 'Error fetching data', description: err.message, variant: 'destructive' });
                setCategories([]);
                setTemplates([]);
                setMyTemplates([]);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchData();

    }, [token, toast, router, dataVersion]);

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null) => {
        e.preventDefault();
        setActiveCategorySlug(slug);
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDuplicateMyTemplate = async (templateId: number) => {
        if (!token) return;
        toast({ title: 'Duplicating template...', description: 'Please wait.' });
        try {
            await duplicateMyTemplate(token, templateId);
            toast({ title: 'Success', description: 'Template duplicated successfully.' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error duplicating template', description: err.message });
        }
    };

    const handleUseMyTemplate = (templateId: number) => {
      router.push(`/dashboard/requests/new/essentials?myTemplateId=${templateId}`);
    };

    const handleUsePublicTemplate = (template: Template) => {
        router.push(`/dashboard/requests/new/essentials?templateId=${template.id}`);
    };
    
    const handlePreviewPublicTemplate = (template: Template) => {
      router.push(`/dashboard/templates/preview/${template.id}`);
    };

    const handleDelete = async () => {
        if (!token || !templateToDelete) return;
        try {
            await deleteMyTemplate(token, templateToDelete.id);
            toast({ title: 'Template deleted', description: `"${templateToDelete.title}" has been deleted.` });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting template', description: err.message });
        } finally {
            setTemplateToDelete(null);
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

     const filteredMyTemplatesBySearch = useMemo(() => {
        if (!Array.isArray(myTemplates)) return [];
        const searchLower = searchTerm.toLowerCase();
        if (!searchLower) return myTemplates;
        
        return myTemplates.filter(tpl => 
            tpl.title.toLowerCase().includes(searchLower) || 
            (tpl.description && tpl.description.toLowerCase().includes(searchLower))
        );
    }, [myTemplates, searchTerm]);
    
    const visibleCategories = useMemo(() => {
        if (!Array.isArray(categories) || !Array.isArray(filteredTemplatesBySearch)) return [];
        
        const templateCategorySlugs = new Set(
            filteredTemplatesBySearch.map(tpl => tpl.category?.slug).filter(Boolean)
        );

        return categories.filter(cat => templateCategorySlugs.has(cat.slug));
    }, [categories, filteredTemplatesBySearch]);

    const groupedAndFilteredTemplates = useMemo(() => {
        let filteredByCategory = filteredTemplatesBySearch;
        if (activeCategorySlug && activeCategorySlug !== 'my-templates') {
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
    
    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    return (
        <>
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
                                        className={cn('flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors',
                                        activeCategorySlug === null ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                                        )}
                                    >
                                        All Templates
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#category-my-templates"
                                        onClick={(e) => handleCategoryClick(e, 'my-templates')}
                                        className={cn(
                                            'flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:bg-muted',
                                            activeCategorySlug === 'my-templates' && 'bg-primary/10 text-primary'
                                        )}
                                    >
                                        <div className="h-2 w-2 rounded-full bg-blue-500"/>
                                        <span>My Templates</span>
                                    </a>
                                </li>
                                {visibleCategories.map((cat) => (
                                    <li key={cat.slug}>
                                        <a
                                            href={`#category-${cat.slug}`}
                                            onClick={(e) => handleCategoryClick(e, cat.slug)}
                                            className={cn(
                                                'flex items-center gap-3 p-2 rounded-md font-semibold text-sm transition-colors text-foreground hover:bg-muted',
                                                activeCategorySlug === cat.slug && 'bg-primary/10 text-primary'
                                            )}
                                        >
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color || 'hsl(var(--muted-foreground))' }}/>
                                            <span>{cat.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                     <div className="mt-4">
                        <Button onClick={() => router.push('/dashboard/requests/new/essentials')} className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                        </Button>
                    </div>
                </aside>
                
                <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                    <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                        <div className="flex items-center gap-4">
                             <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a template..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2 font-semibold h-10 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary">
                                        <ViewIcon className="h-4 w-4" />
                                        <span>View: {viewMode === 'grid' ? 'Grid' : 'List'}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button asChild>
                                <Link href="/dashboard/templates/new">
                                    <Plus className="mr-2 h-4 w-4" /> Create New
                                </Link>
                            </Button>
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
                        <>
                        {(activeCategorySlug === 'my-templates' || activeCategorySlug === null) && (
                            <section id="category-my-templates">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">My Templates</h2>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {filteredMyTemplatesBySearch.map((template) => (
                                            <MyTemplateCard 
                                                key={template.id} 
                                                template={template} 
                                                onDuplicate={() => handleDuplicateMyTemplate(template.id)}
                                                onDelete={() => setTemplateToDelete(template)}
                                                onPreview={() => router.push(`/dashboard/templates/edit/${template.id}/preview`)}
                                                onSelect={() => handleUseMyTemplate(template.id)}
                                            />
                                        ))}
                                        <Link href="/dashboard/templates/new">
                                            <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[178px] h-full">
                                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                                                    <Plus className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <span className="font-semibold text-primary">Create New Template</span>
                                            </Card>
                                        </Link>
                                    </div>
                                ) : (
                                    <MyTemplatesTable 
                                        templates={filteredMyTemplatesBySearch} 
                                        onDuplicate={handleDuplicateMyTemplate} 
                                        onDelete={setTemplateToDelete}
                                        onPreview={(template) => router.push(`/dashboard/templates/edit/${template.id}/preview`)}
                                        onSelect={handleUseMyTemplate}
                                    />
                                )}
                            </section>
                        )}


                        {Object.keys(groupedAndFilteredTemplates).length > 0 ? (
                                Object.entries(groupedAndFilteredTemplates).sort(([a], [b]) => a.localeCompare(b)).map(([categoryName, data]) => {
                                    if (activeCategorySlug && activeCategorySlug !== data.slug) return null;
                                    return (
                                        <section key={categoryName} id={`category-${data.slug}`}>
                                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
                                                {data.title}
                                            </h2>
                                            {viewMode === 'grid' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                                    {data.items.map((template) => (
                                                        <TemplateCard 
                                                          key={template.id} 
                                                          template={template} 
                                                          onSelect={() => handleUsePublicTemplate(template)}
                                                          onPreview={() => handlePreviewPublicTemplate(template)}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <TemplatesTable 
                                                  templates={data.items} 
                                                  onSelect={(template) => handleUsePublicTemplate(template)}
                                                  onPreview={(template) => handlePreviewPublicTemplate(template)}
                                                />
                                            )}
                                        </section>
                                    )
                                })
                        ) : (
                            !activeCategorySlug && filteredMyTemplatesBySearch.length === 0 && (
                                <div className="text-center py-20">
                                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Templates Found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter.</p>
                                </div>
                            )
                        )
                        }
                        </>
                        )}
                    </div>
                </main>
            </div>
            <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the template "{templateToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
