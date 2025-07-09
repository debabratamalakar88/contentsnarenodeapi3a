
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRequest, type Request, type Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Type, CheckSquare, ListOrdered, FileUp, CalendarDays, Mail, Phone, Link2, Sparkles, Palette, MousePointerClick, MapPin, Hash, DollarSign, Globe, CalendarClock, CalendarRange, CircleDot, MenuSquare, ImageUp, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const getQuestionIcon = (type: Question['type']) => {
    const icons: { [key: string]: React.ElementType } = {
        'text': Type,
        'textarea': PenSquare,
        'file': FileUp,
        'checkbox': CheckSquare,
        'dropdown': MenuSquare,
        'date': CalendarClock,
        'email': Mail,
        'tel': Phone,
        'url': Link2,
        'radio': CircleDot,
        'formatted-text': Type,
        'image-upload': ImageUp,
        'address': MapPin,
        'number': Hash,
        'currency': DollarSign,
        'country': Globe,
        'date-range': CalendarRange,
        'icon-selector': Sparkles,
        'color-picker': Palette,
        'button': MousePointerClick,
    };
    return icons[type] || Type;
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
                    <Skeleton className="h-9 w-32" />
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
        <div className="p-6 h-full flex flex-col">
            <header className="flex items-center justify-between mb-6 pb-4 border-b">
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
                 <Button asChild>
                    <Link href={`/dashboard/requests/edit/${request.id}/builder`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Request
                    </Link>
                </Button>
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
                                            {section.questions.map(question => {
                                                const Icon = getQuestionIcon(question.type);
                                                return (
                                                    <div key={question.id} className="flex items-start gap-4 p-3 border rounded-md bg-muted/50">
                                                        <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                                                        <div className="flex-1">
                                                            <p className="font-medium">
                                                                {question.label}
                                                                {question.required && <span className="text-destructive"> *</span>}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground capitalize">{question.type.replace(/-/g, ' ')}</p>
                                                            {question.instructions && <p className="text-xs text-muted-foreground mt-1">{question.instructions}</p>}
                                                            {(question.type === 'radio' || question.type === 'dropdown' || question.type === 'checkbox') && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {question.options?.map((opt, i) => (
                                                                        <Badge key={i} variant="secondary">{opt.label}</Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
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
