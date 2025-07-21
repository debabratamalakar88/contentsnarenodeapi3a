
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTemplate, type Request, type Question, type Page, type Template } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, CheckCircle2, FolderOpen, Eye } from 'lucide-react';
import Link from 'next/link';
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

export default function PreviewTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [template, setTemplate] = useState<Template | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!id) { router.push('/dashboard/templates'); return; }
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        async function fetchTemplateData() {
            try {
                const templateData = await getTemplate(token!, id);
                setTemplate(templateData);
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
        <div className="flex flex-1 flex-col bg-muted/40 overflow-hidden">
            <header className="flex items-center justify-between gap-4 px-6 py-3 border-b bg-background flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                       <Link href="/dashboard/templates"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                     <div className="flex items-center gap-3">
                        <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
                        <div>
                            <h1 className="text-lg font-bold">{template.title}</h1>
                             {template.category && <p className="text-sm text-muted-foreground">{template.category.title}</p>}
                        </div>
                    </div>
                </div>
                <Button size="lg" asChild>
                    <Link href={`/dashboard/requests/new?templateId=${template.id}`}>Use this template</Link>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {template.description && (
                        <Card>
                            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">{template.description}</p></CardContent>
                        </Card>
                    )}

                    {template.form_data.map((page) => (
                        <Card key={page.id}>
                            <CardHeader>
                                <CardTitle>{page.title.replace(/^[0-9\.]+\s*/, '')}</CardTitle>
                                {page.instructions && <CardDescription>{page.instructions}</CardDescription>}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {page.sections.map((section) => (
                                    <div key={section.id}>
                                        <h4 className="font-semibold text-base border-b pb-2 mb-4">{section.title.replace(/^[0-9\.]+\s*/, '')}</h4>
                                        {section.instructions && <p className="text-sm text-muted-foreground mb-4">{section.instructions}</p>}
                                        <div className="space-y-4">
                                            {section.questions.map((q) => (
                                                <div key={q.id} className="text-sm">
                                                    <span className="font-medium">{q.label}</span>
                                                    {q.required && <span className="text-destructive ml-1">*</span>}
                                                    {q.instructions && <p className="text-xs text-muted-foreground">{q.instructions}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}

    