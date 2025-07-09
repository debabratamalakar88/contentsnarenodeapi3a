
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRequest, type Request, type Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const renderQuestionView = (question: Question) => {
    const commonClasses = "p-2 border rounded-md bg-muted/50 text-muted-foreground text-sm flex items-center";

    const questionContent = () => {
        switch (question.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
            case 'number':
            case 'currency':
                return <div className={cn(commonClasses, "h-10")}>{question.placeholder || `User will enter ${question.type} here...`}</div>;
            
            case 'textarea':
                return <div className={cn(commonClasses, "min-h-[80px] items-start")}>{question.placeholder || 'User will enter text here...'}</div>;
            
            case 'file':
            case 'image-upload':
                return <div className={cn(commonClasses, "h-10")}>File upload area</div>;

            case 'date':
            case 'date-range':
                return <div className={cn(commonClasses, "h-10")}>Date selector</div>

            case 'checkbox':
            case 'radio':
            case 'dropdown':
                 return (
                    <div className="space-y-2 pt-2">
                        {question.options?.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="mr-2">{opt.label}</Badge>
                        ))}
                    </div>
                )
            
            case 'formatted-text':
                return <div className="prose-preview p-2 border rounded-md" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;

            case 'button':
                return <Button type="button" variant={question.buttonVariant || 'default'} disabled>{question.label}</Button>;

            case 'address':
                return <div className={cn(commonClasses, "h-10")}>{question.placeholder || 'User will enter an address...'}</div>

            case 'country':
                return <div className={cn(commonClasses, "h-10")}>Country selector</div>

            case 'icon-selector':
                return <div className={cn(commonClasses, "h-10")}>Icon selector</div>

            case 'color-picker':
                return <div className={cn(commonClasses, "h-10")}>Color picker</div>

            default:
                return <div className={cn(commonClasses, "h-10 text-destructive")}>Unknown question type</div>;
        }
    };

    return (
        <div className="grid gap-2 mb-4">
            {question.type !== 'button' && question.type !== 'formatted-text' && (
                <Label>
                    {question.label}
                    {question.required && <span className="text-destructive"> *</span>}
                </Label>
            )}
            {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
            {questionContent()}
        </div>
    );
};


export default function ViewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [request, setRequest] = useState<Request | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            router.push('/dashboard/requests');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        async function fetchRequest() {
            try {
                const data = await getRequest(token, id);
                setRequest(data);
            } catch (err: any) {
                const message = err.message || 'Failed to load request.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }

        fetchRequest();
    }, [id, router, toast]);

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col">
                <header className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9" />
                        <div>
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-32 mt-2" />
                        </div>
                    </div>
                </header>
                 <div className="flex-grow overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/40 p-4 text-center">
                 <Card className="w-full max-w-md">
                     <CardHeader>
                         <CardTitle className="text-destructive">Request Not Found</CardTitle>
                         <CardDescription>{error}</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <Button asChild>
                            <Link href="/dashboard/requests">Back to Requests</Link>
                         </Button>
                     </CardContent>
                 </Card>
            </div>
        );
    }

    if (!request) {
        return <div className="p-6 text-center text-muted-foreground">Request data is not available.</div>;
    }

    return (
        <div className="p-6 h-full flex flex-col bg-muted/40">
            <header className="flex items-center justify-between mb-6 pb-4 border-b bg-muted/40 sticky top-0">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/requests">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{request.title}</h1>
                        <p className="text-muted-foreground">Viewing request details</p>
                    </div>
                </div>
            </header>
            
            <div className="flex-grow overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>{request.title}</CardTitle>
                            <CardDescription>{request.description}</CardDescription>
                        </CardHeader>
                    </Card>

                    {request.form_data?.map(page => (
                        <Card key={page.id} className="bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl">{page.title}</CardTitle>
                                {page.instructions && <CardDescription>{page.instructions}</CardDescription>}
                            </CardHeader>
                            <CardContent>
                                {page.sections.map((section, sectionIndex) => (
                                    <div key={section.id}>
                                        {sectionIndex > 0 && <Separator className="my-6" />}
                                        <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                                        {section.instructions && <p className="text-sm text-muted-foreground mb-4">{section.instructions}</p>}
                                        <div className="space-y-4">
                                            {section.questions.map(question => (
                                               <div key={question.id}>
                                                    {renderQuestionView(question)}
                                               </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

