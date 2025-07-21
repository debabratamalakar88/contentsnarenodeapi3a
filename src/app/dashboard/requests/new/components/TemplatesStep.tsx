

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Search, Plus, FolderOpen, Eye, Loader2
} from "lucide-react";
import { getTemplates, getTemplateCategories, getTemplate, type Template, type TemplateCategory, type Question, type Page } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

const renderQuestionPreview = (question: Question) => {
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
                    {question.options?.map((opt, i) => (
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
                    {question.options?.map((opt, i) => (
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
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )
        default:
            return <Input id={questionId} type="text" placeholder={question.label} />;
    }
}


const TemplateCard = ({ template, onSelect, onPreview }: { template: Template; onSelect: () => void; onPreview: () => void; }) => (
  <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
    <div className="flex flex-col flex-grow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4 flex gap-4 items-start flex-grow">
        <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
        <div className="flex-grow">
          <h3 className="font-semibold">{template.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
        </div>
      </CardContent>
    </div>
    <div className="p-2 border-t flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onPreview}><Eye className="mr-2 h-4 w-4"/>Preview</Button>
        <Button size="sm" onClick={onSelect}>Use Template</Button>
    </div>
  </Card>
);

interface TemplatesStepProps {
    onProceed: (isFromScratch: boolean, selectedTemplate?: Template) => void;
}

export default function TemplatesStep({ onProceed }: TemplatesStepProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);

    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [activePreviewPageIndex, setActivePreviewPageIndex] = useState(0);

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
                    getTemplateCategories(token!),
                    getTemplates(token!)
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

    const handlePreviewClick = async (templateId: number) => {
        if (!token) return;
        setIsPreviewLoading(true);
        setActivePreviewPageIndex(0);
        setPreviewTemplate({ id: templateId } as Template);
        try {
            const fullTemplate = await getTemplate(token, templateId);
            setPreviewTemplate(fullTemplate);
        } catch (error: any) {
            toast({ title: 'Error fetching preview', description: error.message, variant: 'destructive' });
            setPreviewTemplate(null);
        } finally {
            setIsPreviewLoading(false);
        }
    }


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
        if (!categories.length || !filteredTemplatesBySearch.length) return [];
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

    const activePreviewPage = previewTemplate?.form_data?.[activePreviewPageIndex];
    
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
                </aside>
                
                <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                    <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                        <div className="flex items-center gap-4">
                             <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search for a template..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                             <Button variant="outline" onClick={() => onProceed(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Start From Scratch
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
                        Object.keys(groupedAndFilteredTemplates).length > 0 ? (
                                Object.entries(groupedAndFilteredTemplates).sort(([a], [b]) => a.localeCompare(b)).map(([categoryName, data]) => {
                                    return (
                                        <section key={categoryName} id={`category-${data.slug}`}>
                                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2`}>
                                                {data.title}
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                                {data.items.map((template) => (
                                                    <TemplateCard key={template.id} template={template} onSelect={() => onProceed(false, template)} onPreview={() => handlePreviewClick(template.id)} />
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
             <Dialog open={!!previewTemplate} onOpenChange={(isOpen) => !isOpen && setPreviewTemplate(null)}>
                <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Template Preview</DialogTitle>
                        {previewTemplate && <DialogDescription>{previewTemplate.title}</DialogDescription>}
                    </DialogHeader>
                    {isPreviewLoading || !previewTemplate?.title ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : (
                        <div className="flex flex-1 overflow-hidden">
                            <aside className="w-60 flex-shrink-0 bg-background border-r p-4">
                                <h3 className="text-xs font-semibold text-muted-foreground mb-4 px-2 tracking-widest">PAGES</h3>
                                <ul className="space-y-1">
                                    {previewTemplate.form_data.map((page, index) => (
                                        <li key={page.id}>
                                            <button
                                                onClick={() => setActivePreviewPageIndex(index)}
                                                className={cn(
                                                    "w-full text-left p-2 rounded-md font-semibold text-sm transition-colors text-foreground",
                                                    activePreviewPageIndex === index ? 'bg-pink-100 text-pink-700' : 'hover:bg-muted'
                                                )}
                                            >
                                                {page.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </aside>
                            <main className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-2xl font-bold">{previewTemplate.title}</h2>
                                    <p className="text-muted-foreground mb-8">{previewTemplate.description}</p>
                                    
                                    {activePreviewPage && (
                                        <div className="space-y-8">
                                            <h3 className="text-xl font-bold border-b pb-2 mb-4">{activePreviewPage.title}</h3>
                                            {activePreviewPage.sections.map(section => (
                                                <div key={section.id}>
                                                    <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                                                    <div className="space-y-6">
                                                        {section.questions.map(q => (
                                                            <div key={q.id} className="grid gap-2">
                                                                <Label htmlFor={`preview-${q.id}`}>
                                                                    {q.label}
                                                                    {q.required && <span className="text-destructive ml-1">*</span>}
                                                                </Label>
                                                                {renderQuestionPreview(q)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </main>
                        </div>
                    )}
                    <DialogFooter className="p-4 border-t bg-background">
                        <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
                        <Button onClick={() => previewTemplate && onProceed(false, previewTemplate)}>Use Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
