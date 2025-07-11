
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSingleSubmissionForRequest, getRequest, type Submission, type Request as RequestType, type Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const renderAnswer = (answer: any) => {
  if (answer === null || answer === undefined || answer === '') {
    return <p className="text-muted-foreground italic">No answer provided.</p>;
  }
  if (Array.isArray(answer)) {
    if (answer.length === 0) {
       return <p className="text-muted-foreground italic">No selection made.</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {answer.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof answer === 'object' && answer.start && answer.end) {
      return <p>{format(parseISO(answer.start), 'PPP')} to {format(parseISO(answer.end), 'PPP')}</p>;
  }
  if (typeof answer === 'object') {
    return <pre className="p-2 bg-muted rounded-md overflow-x-auto text-xs font-mono">{JSON.stringify(answer, null, 2)}</pre>;
  }
  if (typeof answer === 'string' && (answer.startsWith('http') || answer.startsWith('/'))) {
      return <a href={answer} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{answer}</a>
  }

  return <p className="break-words whitespace-pre-wrap">{String(answer)}</p>;
};

interface RenderableSection {
  title: string;
  answers: { label: string; answer: any }[];
}

interface RenderablePage {
  title: string;
  sections: RenderableSection[];
}


export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<{form_data: any, status: string} | null>(null);
  const [request, setRequest] = useState<RequestType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const submissionId = Number(params.submissionId);
  const requestId = Number(params.id);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || !submissionId || !requestId) {
      router.back();
      return;
    }

    async function fetchSubmissionData() {
      try {
        const [submissionData, requestData] = await Promise.all([
          getSingleSubmissionForRequest(token, requestId, submissionId),
          getRequest(token, requestId),
        ]);
        setSubmission(submissionData);
        setRequest(requestData);
      } catch (error: any) {
        toast({
          title: 'Error fetching data',
          description: error.message || 'Could not load submission or request details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubmissionData();
  }, [submissionId, requestId, router, toast]);

 const processedData = useMemo(() => {
    if (!submission || !request || !submission.form_data) return [];

    const questionLabelMap = new Map<string, string>();
    request.form_data.forEach(page => {
        page.sections.forEach(section => {
            section.questions.forEach(question => {
                if (question.apiId) {
                    questionLabelMap.set(question.apiId, question.label);
                }
            });
        });
    });

    return Object.keys(submission.form_data).sort().map(stepKey => {
        // Handle the extra nesting: data is at submission.form_data[stepKey][stepKey]
        const stepContainer = submission.form_data[stepKey];
        if (!stepContainer || !stepContainer[stepKey]) return null;
        const pageData = stepContainer[stepKey];

        if (!pageData || !pageData.page_title || !Array.isArray(pageData.sections)) {
            return null;
        }

        const renderablePage: RenderablePage = {
            title: pageData.page_title,
            sections: pageData.sections.map((section: any) => {
                if (!section || !section.section_title || !section.questions) {
                    return null;
                }
                const renderableSection: RenderableSection = {
                    title: section.section_title,
                    answers: Object.entries(section.questions).map(([apiId, answer]) => ({
                        label: questionLabelMap.get(apiId) || apiId,
                        answer: answer
                    })).filter(a => a.answer !== undefined)
                };
                return renderableSection.answers.length > 0 ? renderableSection : null;
            }).filter((s): s is RenderableSection => s !== null)
        };
        return renderablePage.sections.length > 0 ? renderablePage : null;
    }).filter((p): p is RenderablePage => p !== null);
  }, [submission, request]);


  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-white">
        <Skeleton className="h-8 w-40" />
        <Card>
            <CardHeader><Skeleton className="h-10 w-64" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission || !request) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-white">
        <h1 className="text-xl font-bold">Submission data could not be loaded.</h1>
         <Button variant="outline" asChild className="mt-4">
            <Link href={`/dashboard/requests/${requestId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Request
            </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-full">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/requests/${requestId}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-2xl font-bold">Submission Details</h1>
        </div>
        <Card className="bg-card shadow-sm w-full">
            <CardHeader>
                <div className="space-y-2">
                    <CardTitle className="text-2xl">Submission for "{request.title}"</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={submission.status === 'completed' ? 'default' : 'secondary'}
                            className={cn(
                                submission.status === 'completed' && "border-green-200 bg-green-100 text-green-800",
                                "capitalize"
                            )}
                        >
                            {submission.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {submission.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {processedData.length > 0 ? (
                    <Accordion type="multiple" defaultValue={processedData.map(p => p.title)} className="w-full">
                    {processedData.map((page, pageIndex) => (
                        <AccordionItem key={pageIndex} value={page.title}>
                            <AccordionTrigger className="text-xl font-semibold hover:no-underline">{page.title}</AccordionTrigger>
                            <AccordionContent className="pt-4 px-2">
                                <div className="space-y-6">
                                    {page.sections.map((section, sectionIndex) => (
                                        <div key={sectionIndex}>
                                        <h4 className="font-semibold text-lg text-foreground mb-4 border-b pb-2">{section.title}</h4>
                                        <dl className="space-y-6">
                                            {section.answers.map((item, itemIndex) => (
                                            <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <dt className="font-medium text-sm text-muted-foreground md:col-span-1">{item.label}</dt>
                                                <dd className="text-sm text-foreground md:col-span-3">{renderAnswer(item.answer)}</dd>
                                            </div>
                                            ))}
                                        </dl>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-16 text-muted-foreground bg-background rounded-lg border-2 border-dashed">
                        <FileText className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-xl font-semibold">No submission data found to display.</h3>
                        <p className="text-sm">It seems this submission is empty.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
