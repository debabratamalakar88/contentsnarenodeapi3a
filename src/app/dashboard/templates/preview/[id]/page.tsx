

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTemplate, getMyTemplate, type Question, type Page, type Template, type MyTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, CheckCircle2, FolderOpen, Eye, User } from 'lucide-react';
import Link from 'next/link';
import { iconList } from '@/components/ui/icon-selector';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const TemplateIconDisplay = ({ iconName, categoryColor, isMyTemplate }: { iconName?: string | null, categoryColor?: string | null, isMyTemplate?: boolean }) => {
    const IconComponent = useMemo(() => {
        if (isMyTemplate) return User;
        if (!iconName) return FolderOpen;
        const foundIcon = iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase());
        return foundIcon ? foundIcon.icon : FolderOpen;
    }, [iconName, isMyTemplate]);

    const bgColor = isMyTemplate ? '#e0f2fe' : (categoryColor ? `${categoryColor}20` : 'hsl(var(--muted))');
    const iconColor = isMyTemplate ? '#0284c7' : (categoryColor || 'hsl(var(--muted-foreground))');


    return (
        <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: bgColor }}>
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


export default function PreviewTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [template, setTemplate] = useState<Template | MyTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePageIndex, setActivePageIndex] = useState(0);

    
    useEffect(() => {
        if (!id) { router.push('/dashboard/templates'); return; }
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        async function fetchTemplateData() {
            try {
                // Try fetching from public templates first, then from my templates
                try {
                    const templateData = await getTemplate(token!, id);
                    setTemplate(templateData);
                } catch (publicError: any) {
                    if (publicError.status === 404 || publicError.error === "Unauthorized") {
                         const myTemplateData = await getMyTemplate(token!, id);
                         setTemplate(myTemplateData);
                    } else {
                        throw publicError;
                    }
                }
            } catch (err: any) {
                const message = err.message || 'Failed to load template data.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }
        fetchTemplateData();
    }, [id, router, toast]);
    
    const isMyTemplate = template && 'created_by' in template;
    const templateCategory = template && 'category' in template ? template.category : undefined;
    const formPages = template && 'form_data' in template ? template.form_data : [];

    const activePage = formPages?.[activePageIndex];

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col bg-muted/40">
                <header className="flex items-center gap-4 mb-6 pb-4 border-b">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-8 w-48" />
                </header>
                <div className="flex-1 space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/40 p-4 text-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Template Not Found</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                           <Link href="/dashboard/templates">Back to Templates</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!template) {
        return <div className="p-6 text-center text-muted-foreground">Template data is not available.</div>;
    }

    return (
        <div className="flex flex-1 flex-col bg-muted/40 overflow-hidden h-full">
            <header className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-background flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                       <Link href="/dashboard/templates"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                     <div className="flex items-center gap-3">
                        <TemplateIconDisplay 
                            iconName={'icon' in template ? template.icon : undefined} 
                            categoryColor={templateCategory?.color}
                            isMyTemplate={isMyTemplate}
                        />
                        <div>
                            <h1 className="text-lg font-bold">{template.title}</h1>
                            <p className="text-sm text-muted-foreground">{isMyTemplate ? 'My Template' : (templateCategory?.title || 'Uncategorized')}</p>
                        </div>
                    </div>
                </div>
                <Button size="lg" asChild>
                    <Link href={`/dashboard/requests/new/essentials?templateId=${template.id}`}>Use this template</Link>
                </Button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-60 flex-shrink-0 bg-white border-r p-4">
                     <h3 className="text-xs font-semibold text-muted-foreground mb-4 px-2 tracking-widest">PAGES</h3>
                     <ul className="space-y-1">
                        {formPages && formPages.map((page, index) => (
                             <li key={page.id}>
                                <button
                                    onClick={() => setActivePageIndex(index)}
                                    className={cn(
                                        "w-full text-left p-2 rounded-md font-semibold text-sm transition-colors text-foreground",
                                        activePageIndex === index ? 'bg-pink-100 text-pink-700' : 'hover:bg-muted'
                                    )}
                                >
                                    {page.title}
                                </button>
                             </li>
                        ))}
                     </ul>
                </aside>
                 <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold">{template.title}</h2>
                        <p className="text-muted-foreground mb-8">{template.description}</p>
                        
                        {activePage && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold border-b pb-2 mb-4">{activePage.title}</h3>
                                {activePage.sections.map(section => (
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
                         {!activePage && formPages && formPages.length > 0 && (
                            <p className="text-muted-foreground text-center py-10">Select a page to preview its content.</p>
                        )}
                        {(!formPages || formPages.length === 0) && (
                            <p className="text-muted-foreground text-center py-10">This template is empty.</p>
                        )}
                    </div>
                 </main>
            </div>
        </div>
    );
}
