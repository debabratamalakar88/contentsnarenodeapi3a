

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Search, Plus, FolderOpen, LayoutGrid, List, ChevronDown, Rocket, X
} from "lucide-react";
import { getTemplates, getTemplateCategories, getMyTemplates, deleteMyTemplate, duplicateMyTemplate, getProfile, type User, type Template, type TemplateCategory, type MyTemplate } from '@/lib/api';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const renderQuestionPreview = (question: any) => {
    const questionId = `preview-${question.id}`;
    
    switch (question.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'number':
        case 'date':
        case 'currency':
             return <Input id={questionId} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'textarea':
             return <Textarea id={questionId} placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'radio':
            return (
                <RadioGroup defaultValue={question.defaultValue}>
                    {question.options?.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt: any, i: number) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`${questionId}-${i}`} value={opt.value} />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </div>
            )
        case 'dropdown':
            return (
                <Select defaultValue={question.defaultValue}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt: any, i: number) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )
        case 'formatted-text':
            return <div className="prose prose-sm max-w-none p-2 border rounded-md min-h-[60px]" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        default:
            return <Input id={questionId} type="text" placeholder={question.label} />;
    }
}


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
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [templateToDelete, setTemplateToDelete] = useState<MyTemplate | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const [previewTemplate, setPreviewTemplate] = useState<Template | MyTemplate | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [activePreviewPageIndex, setActivePreviewPageIndex] = useState(0);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        if (!token) {
            toast({ title: 'Authentication Error', description: 'Please log in again.', variant: 'destructive' });
            router.push('/login');
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            try {
                const [catsResponse, tplsResponse, myTplsResponse, profileResponse] = await Promise.all([
                    getTemplateCategories(token!),
                    getTemplates(token!),
                    getMyTemplates(token!),
                    getProfile(token!)
                ]);
                
                setCategories(Array.isArray(catsResponse) ? catsResponse : []);
                setTemplates(tplsResponse?.data || []);
                setMyTemplates(myTplsResponse?.data || []);
                setCurrentUser(profileResponse.user || profileResponse.data || profileResponse);

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

    const canManageTemplates = userRole === 'Administrator' || userRole === 'Editor';

    const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string | null) => {
        e.preventDefault();
        setActiveCategorySlug(slug);
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const handlePreviewClick = async (template: Template | MyTemplate) => {
        if (!token) return;
        setIsPreviewLoading(true);
        setActivePreviewPageIndex(0);
        setPreviewTemplate(template);
    }
    
    const handleDuplicateTemplate = async (templateId: number) => {
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

        const filtered = myTemplates.filter(tpl => {
            const searchLower = searchTerm.toLowerCase();
            if (!searchLower) return true;
            return tpl.title.toLowerCase().includes(searchLower) || 
                   (tpl.description && tpl.description.toLowerCase().includes(searchLower));
        });

        return filtered.sort((a, b) => b.id - a.id);
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
    const activePreviewPage = (previewTemplate && 'form_data' in previewTemplate) ? previewTemplate.form_data?.[activePreviewPageIndex] : undefined;
    const templateIcon = previewTemplate ? ('icon' in previewTemplate ? previewTemplate.icon : undefined) : undefined;
    const templateCategory = previewTemplate && 'category' in previewTemplate ? previewTemplate.category : undefined;
    const isMyTemplate = previewTemplate && 'created_by' in previewTemplate;
    const totalPages = previewTemplate?.form_data?.length || 0;
    const totalQuestions = previewTemplate?.form_data?.reduce((acc: number, page: any) => acc + page.sections.reduce((sAcc: number, sec: any) => sAcc + sec.questions.length, 0), 0) || 0;

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
                     {canManageTemplates && (
                         <div className="mt-4">
                            <Button onClick={() => router.push('/dashboard/requests/new/essentials')} className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                            </Button>
                        </div>
                     )}
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
                            {canManageTemplates && (
                                <Button asChild>
                                    <Link href="/dashboard/templates/new">
                                        <Plus className="mr-2 h-4 w-4" /> Create New
                                    </Link>
                                </Button>
                            )}
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
                                                currentUser={currentUser}
                                                onDuplicate={() => handleDuplicateTemplate(template.id)}
                                                onDelete={() => setTemplateToDelete(template)}
                                                onPreview={() => handlePreviewClick(template)}
                                                onSelect={() => handleUseMyTemplate(template.id)}
                                                canManage={canManageTemplates}
                                            />
                                        ))}
                                        {canManageTemplates && (
                                            <Link href="/dashboard/templates/new">
                                                <Card className="flex flex-col items-center justify-center bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[178px] h-full">
                                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                                                        <Plus className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <span className="font-semibold text-primary">Create New Template</span>
                                                </Card>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <MyTemplatesTable 
                                        templates={filteredMyTemplatesBySearch} 
                                        currentUser={currentUser}
                                        onDuplicate={handleDuplicateTemplate} 
                                        onDelete={setTemplateToDelete}
                                        onPreview={(template) => handlePreviewClick(template)}
                                        onSelect={handleUseMyTemplate}
                                        canManage={canManageTemplates}
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
                                                          onPreview={() => handlePreviewClick(template)}
                                                          onDuplicate={() => handleDuplicateTemplate(template.id)}
                                                          canManage={canManageTemplates}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <TemplatesTable 
                                                  templates={data.items} 
                                                  onSelect={(template) => handleUsePublicTemplate(template)}
                                                  onPreview={(template) => handlePreviewPublicTemplate(template)}
                                                  onDuplicate={handleDuplicateTemplate}
                                                  canManage={canManageTemplates}
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
             <Dialog open={!!previewTemplate} onOpenChange={(isOpen) => !isOpen && setPreviewTemplate(null)}>
                <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b flex-row items-center justify-between">
                        <DialogTitle className="text-base">Template: {previewTemplate?.title}</DialogTitle>
                    </DialogHeader>
                    {isPreviewLoading || !previewTemplate?.title ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : (
                        <div className="flex flex-1 overflow-hidden bg-muted/40">
                             <aside className="w-80 flex-shrink-0 bg-background border-r p-6 flex flex-col gap-6">
                               <Button variant="link" className="text-primary p-0 h-auto justify-start" onClick={() => setPreviewTemplate(null)}>
                                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to templates
                               </Button>
                               <Card>
                                  <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                                      <TemplateIconDisplay 
                                        iconName={templateIcon} 
                                        categoryColor={isMyTemplate ? '#3b82f6' : templateCategory?.color}
                                        isMyTemplate={isMyTemplate}
                                      />
                                      <div>
                                          <h3 className="font-semibold text-lg">{previewTemplate.title}</h3>
                                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{previewTemplate.description}</p>
                                      </div>
                                      <div className="flex gap-8 text-center pt-2">
                                          <div>
                                              <p className="text-2xl font-bold">{totalPages}</p>
                                              <p className="text-xs text-muted-foreground uppercase">Pages</p>
                                          </div>
                                           <div>
                                              <p className="text-2xl font-bold">{totalQuestions}</p>
                                              <p className="text-xs text-muted-foreground uppercase">Questions</p>
                                          </div>
                                      </div>
                                  </CardContent>
                               </Card>
                            </aside>
                            <main className="flex-1 flex overflow-hidden bg-white">
                                <ScrollArea className="flex-1">
                                    <div className="p-8">
                                    <div className="bg-white p-8 rounded-lg shadow-sm border">
                                      <div className="flex items-center gap-2 mb-6">
                                          <span className="h-3 w-3 rounded-full bg-red-400"></span>
                                          <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                                          <span className="h-3 w-3 rounded-full bg-green-400"></span>
                                      </div>
                                      <div className="flex gap-6">
                                          <div className="w-1/3 border-r pr-6">
                                            <h2 className="text-xl font-bold mb-4">{previewTemplate.title}</h2>
                                             <nav className="space-y-1">
                                                {previewTemplate.form_data?.map((page: any, pIndex: number) => (
                                                   <button
                                                        key={page.id}
                                                        onClick={() => setActivePreviewPageIndex(pIndex)}
                                                        className={cn(
                                                            "w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-medium",
                                                            activePreviewPageIndex === pIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                                                        )}
                                                   >
                                                      <span className="truncate">{page.title}</span>
                                                      <ChevronRight className="h-4 w-4 shrink-0" />
                                                  </button>
                                                ))}
                                             </nav>
                                          </div>
                                          <div className="w-2/3">
                                            {activePreviewPage ? (
                                                <div key={activePreviewPage.id}>
                                                    <div className="space-y-4">
                                                        {activePreviewPage.sections.map((section: any) => (
                                                            <div key={section.id}>
                                                                <div className="prose prose-sm max-w-none mb-4">
                                                                    <h3 className="text-lg font-bold">{section.title}</h3>
                                                                    {section.instructions && <p className="text-muted-foreground">{section.instructions}</p>}
                                                                </div>
                                                                 <div className="space-y-6">
                                                                    {section.questions.map((q: any) => (
                                                                        <div key={q.id} className="grid gap-2">
                                                                            <Label htmlFor={`preview-${q.id}`}>
                                                                                {q.label}
                                                                                {q.required && <span className="text-destructive ml-1">*</span>}
                                                                            </Label>
                                                                            {q.instructions && <p className="text-sm text-muted-foreground">{q.instructions}</p>}
                                                                            {renderQuestionPreview(q)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-center py-10">Select a page to preview.</p>
                                            )}
                                          </div>
                                      </div>
                                    </div>
                                    </div>
                                </ScrollArea>
                            </main>
                        </div>
                    )}
                    <DialogFooter className="p-4 border-t bg-background">
                        <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
                        <Button onClick={() => previewTemplate && (isMyTemplate ? handleUseMyTemplate(previewTemplate.id) : handleUsePublicTemplate(previewTemplate as Template))}>Use This Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
