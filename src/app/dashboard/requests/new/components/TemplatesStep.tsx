
'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Search, Plus, FolderOpen, LayoutGrid, List, ChevronDown, Rocket, X, FileQuestion, ChevronRight, Eye, MoreHorizontal, User, Edit, Copy, Trash2, Rocket as RocketIcon, PlusCircle, Loader2, ArrowLeft
} from "lucide-react";
import { getTemplates, getTemplateCategories, getTemplate, getMyTemplates, getMyTemplate, type Template, type TemplateCategory, type Question, type Page, type MyTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { iconList } from '@/components/ui/icon-selector';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const TemplateIconDisplay = ({ iconName, categoryColor, isMyTemplate, className }: { iconName?: string | null, categoryColor?: string | null, isMyTemplate?: boolean, className?: string }) => {
    const IconComponent = useMemo(() => {
        if (isMyTemplate) return User;
        if (!iconName) return FolderOpen;
        const foundIcon = iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase());
        return foundIcon ? foundIcon.icon : FolderOpen;
    }, [iconName, isMyTemplate]);

    const bgColor = isMyTemplate ? '#e0f2fe' : (categoryColor ? `${categoryColor}20` : 'hsl(var(--muted))');
    const iconColor = isMyTemplate ? '#0284c7' : (categoryColor || 'hsl(var(--muted-foreground))');


    return (
        <div className={cn("p-3 rounded-lg flex-shrink-0", className)} style={{ backgroundColor: bgColor }}>
            <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
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
                            <Checkbox id={`preview-${question.id}-${i}`} value={opt.value} />
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
        case 'formatted-text':
            return <div className="prose prose-sm max-w-none p-2 border rounded-md min-h-[60px]" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        default:
            return <Input id={questionId} type="text" placeholder={question.label} />;
    }
}


const MyTemplateCard = ({ template, onSelect, onPreview }: { template: MyTemplate; onSelect: () => void; onPreview: () => void; }) => (
    <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
      <div className="flex flex-col flex-grow cursor-pointer" onClick={onSelect}>
        <CardContent className="p-4 flex gap-4 items-start flex-grow">
           <TemplateIconDisplay isMyTemplate={true} />
          <div className="flex-grow">
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description || "No description."}</p>
          </div>
        </CardContent>
      </div>
      <div className="p-2 border-t flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onPreview}><Eye className="mr-2 h-4 w-4"/>Preview</Button>
          <Button size="sm" onClick={onSelect}>Use Template</Button>
      </div>
    </Card>
);

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
    onProceed: (isFromScratch: boolean, selectedTemplate?: Template | MyTemplate) => void;
}

export default function TemplatesStep({ onProceed }: TemplatesStepProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [myTemplates, setMyTemplates] = useState<MyTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);

    const [previewTemplate, setPreviewTemplate] = useState<Template | MyTemplate | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    
    const [activePageIndex, setActivePageIndex] = useState(0);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeAccordionItem, setActiveAccordionItem] = useState<string>('');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);


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

    }, [token, toast, router]);
    
    useEffect(() => {
      const currentObserver = observer.current;
      if (currentObserver) {
          currentObserver.disconnect();
      }
  
      const options = {
          root: scrollContainerRef.current,
          rootMargin: '0px 0px -60% 0px',
          threshold: 0.5, 
      };
  
      observer.current = new IntersectionObserver((entries) => {
          for (const entry of entries) {
              if (entry.isIntersecting) {
                  const id = entry.target.id;
                  if (id.startsWith('section-')) {
                      setActiveSectionId(id);
                  } else if (id.startsWith('question-')) {
                      const sectionId = entry.target.closest('[id^="section-"]')?.id;
                      if (sectionId) setActiveSectionId(sectionId);
                      setActiveQuestionId(id);
                  }
                  return; 
              }
          }
      }, options);
  
      const elements = scrollContainerRef.current?.querySelectorAll('[id^="section-"], [id^="question-"]');
      elements?.forEach(el => observer.current!.observe(el));
  
      return () => {
          currentObserver?.disconnect();
      };
  }, [previewTemplate, activePageIndex]);

    const handlePreviewClick = useCallback(async (template: Template | MyTemplate) => {
        if (!token) return;
        setIsPreviewLoading(true);
        setPreviewTemplate(template);
        setActivePageIndex(0);
        setActiveAccordionItem('');
    
        try {
            const fetchFunction = 'created_by' in template ? getMyTemplate : getTemplate;
            const fullTemplate = await fetchFunction(token, template.id);
            setPreviewTemplate(fullTemplate);
            if (fullTemplate.form_data?.length) {
                setActivePageIndex(0);
                setActiveAccordionItem(`page-${fullTemplate.form_data[0].id}`);
            }
        } catch (error: any) {
            toast({ title: 'Error fetching preview', description: error.message, variant: 'destructive' });
            setPreviewTemplate(null);
        } finally {
            setIsPreviewLoading(false);
        }
    }, [token, toast]);
    
    const handleScrollToElement = (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element && scrollContainerRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

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

    const isMyTemplate = previewTemplate && 'created_by' in previewTemplate;
    const templateCategory = previewTemplate && 'category' in previewTemplate ? previewTemplate.category : undefined;
    const totalPages = previewTemplate?.form_data?.length || 0;
    const totalQuestions = useMemo(() => {
        return previewTemplate?.form_data?.reduce((acc, page) => 
            acc + page.sections.reduce((sAcc, section) => sAcc + section.questions.length, 0), 0) || 0;
    }, [previewTemplate]);
    
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
                        <Button onClick={() => onProceed(true)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                        </Button>
                    </div>
                </aside>
                
                <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
                    <header className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b">
                        <div className="flex items-center gap-4">
                            <Button onClick={() => onProceed(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Start From Scratch
                            </Button>
                            <div className="relative flex-1 max-w-sm">
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
                        <>
                        {(activeCategorySlug === 'my-templates' || activeCategorySlug === null) && (
                            <section id="category-my-templates">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">My Templates</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                    {filteredMyTemplatesBySearch.map((template) => (
                                        <MyTemplateCard 
                                            key={template.id} 
                                            template={template} 
                                            onSelect={() => onProceed(false, template)} 
                                            onPreview={() => handlePreviewClick(template)} 
                                        />
                                    ))}
                                </div>
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                                {data.items.map((template) => (
                                                    <TemplateCard key={template.id} template={template} onSelect={() => onProceed(false, template)} onPreview={() => handlePreviewClick(template)} />
                                                ))}
                                            </div>
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
            <Dialog open={!!previewTemplate} onOpenChange={(isOpen) => { if (!isOpen) setPreviewTemplate(null); }}>
                <DialogContent className="max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b flex-row items-center justify-between">
                        <DialogTitle className="text-base truncate">Template Preview: {previewTemplate?.title}</DialogTitle>
                         <DialogClose asChild><Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button></DialogClose>
                    </DialogHeader>
                    {isPreviewLoading || !previewTemplate?.form_data ? (
                         <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="flex flex-1 overflow-hidden">
                             <aside className="w-64 flex-shrink-0 bg-white border-r p-6 flex flex-col gap-4">
                                <TemplateIconDisplay 
                                    iconName={'icon' in previewTemplate ? previewTemplate.icon : undefined} 
                                    categoryColor={templateCategory?.color}
                                    isMyTemplate={isMyTemplate}
                                    className="h-16 w-16 text-3xl"
                                />
                                <div className="space-y-1">
                                    <h3 className="font-bold">{previewTemplate.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-4">{previewTemplate.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
                                    <div>
                                        <p className="text-2xl font-bold">{totalPages}</p>
                                        <p className="text-xs text-muted-foreground">Pages</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{totalQuestions}</p>
                                        <p className="text-xs text-muted-foreground">Questions</p>
                                    </div>
                                </div>
                             </aside>
                             
                             <div className="flex flex-1 overflow-hidden gap-2 p-6 bg-muted/40">
                                <aside className="w-72 flex-shrink-0 bg-white border rounded-lg p-6 flex flex-col gap-6">
                                <Button variant="link" className="text-primary p-0 h-auto justify-start" onClick={() => setPreviewTemplate(null)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to templates
                                </Button>
                                <ScrollArea className="flex-1 -mx-6">
                                        <Accordion type="single" collapsible className="w-full px-6" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
                                            {previewTemplate.form_data.map((page, index) => (
                                                <AccordionItem value={`page-${page.id}`} key={page.id}>
                                                    <AccordionTrigger className={cn("font-semibold hover:no-underline", activePageIndex === index && 'text-blue-600')} onClick={() => setActivePageIndex(index)}>
                                                        <span className="truncate">{page.title}</span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pl-4 border-l">
                                                        {page.sections.map(section => (
                                                            <div key={section.id} className="mt-2">
                                                                <button 
                                                                    onClick={() => handleScrollToElement(`section-${section.id}`)} 
                                                                    className={cn("font-medium text-sm block py-1 truncate text-left hover:text-primary w-full", `section-${section.id}` === activeSectionId ? 'text-blue-600' : '')}
                                                                >
                                                                    {section.title}
                                                                </button>
                                                                <div className="pl-4 border-l mt-1 space-y-1">
                                                                    {section.questions.map(question => (
                                                                        <button 
                                                                            onClick={() => handleScrollToElement(`question-${question.id}`)} 
                                                                            key={question.id} 
                                                                            className={cn("text-xs text-muted-foreground block py-0.5 truncate text-left hover:text-primary w-full", `question-${question.id}` === activeQuestionId ? 'text-blue-600' : '')}
                                                                            title={question.label}
                                                                        >
                                                                            {question.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                </ScrollArea>
                                </aside>
                                <main className="flex-1 flex overflow-hidden">
                                    <ScrollArea className="flex-1" ref={scrollContainerRef}>
                                        <div className="p-8">
                                            <div className="bg-white p-8 rounded-lg shadow-sm">
                                                {previewTemplate.form_data && previewTemplate.form_data[activePageIndex] ? (() => {
                                                    const page = previewTemplate.form_data[activePageIndex];
                                                    return (
                                                        <div key={page.id}>
                                                            <div className="mb-12">
                                                                <h2 className="text-2xl font-bold mb-2">{page.title}</h2>
                                                                {page.instructions && <p className="text-muted-foreground mb-6">{page.instructions}</p>}
                                                                {page.sections.map(section => (
                                                                    <div key={section.id} id={`section-${section.id}`} className="mb-8">
                                                                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">{section.title}</h3>
                                                                        <div className="space-y-6">
                                                                            {section.questions.map(q => (
                                                                                <div key={q.id} id={`question-${q.id}`} className="grid gap-2">
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
                                                        </div>
                                                    )
                                                })() : null}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </main>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="p-4 border-t bg-background">
                        <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
                        <Button onClick={() => previewTemplate && onProceed(false, previewTemplate)}>Use This Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
