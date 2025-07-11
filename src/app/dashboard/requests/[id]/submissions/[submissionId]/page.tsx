
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSingleSubmissionForRequest, getRequest, type Submission, type Request as RequestType, type Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

const renderAnswer = (answer: any) => {
  if (answer === null || answer === undefined || answer === '') {
    return <p className="text-muted-foreground italic">No answer provided.</p>;
  }
  if (Array.isArray(answer)) {
    if (answer.length === 0) {
       return <p className="text-muted-foreground italic">No selection made.</p>;
    }
    return (
      <ul className="list-disc list-inside">
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
    return <pre className="p-2 bg-muted rounded-md overflow-x-auto text-xs">{JSON.stringify(answer, null, 2)}</pre>;
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

  const [submission, setSubmission] = useState<Submission | null>(null);
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

    const submittedPages: RenderablePage[] = [];

    // The form_data is an object with keys like "step_1", "step_2"
    Object.keys(submission.form_data).sort().forEach(stepKey => {
        const pageData = submission.form_data[stepKey];

        if (pageData && pageData.page_title && Array.isArray(pageData.sections)) {
            const renderablePage: RenderablePage = {
                title: pageData.page_title,
                sections: []
            };

            pageData.sections.forEach((section: any) => {
                if (section && section.section_title && section.questions) {
                    const renderableSection: RenderableSection = {
                        title: section.section_title,
                        answers: []
                    };
                    Object.entries(section.questions).forEach(([apiId, answer]) => {
                        renderableSection.answers.push({
                            label: questionLabelMap.get(apiId) || apiId,
                            answer: answer
                        });
                    });
                    if(renderableSection.answers.length > 0) {
                      renderablePage.sections.push(renderableSection);
                    }
                }
            });
            if(renderablePage.sections.length > 0){
              submittedPages.push(renderablePage);
            }
        }
    });
    
    return submittedPages;
  }, [submission, request]);


  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission || !request) {
    return (
      <div className="p-6 text-center text-muted-foreground">
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
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" asChild className="mb-4">
        <Link href={`/dashboard/requests/${requestId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Request
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Viewing Submission for "{request.title}"</CardTitle>
          <CardDescription>
            Submitted by client ID {submission.client_id} on {submission.updated_at ? format(parseISO(submission.updated_at), 'PPP p') : 'N/A'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {processedData.length > 0 ? (
            processedData.map((page, pageIndex) => (
              <Card key={pageIndex} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-xl">{page.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {page.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="font-semibold text-lg">{section.title}</h4>
                      <div className="mt-2 pl-4 border-l-2 space-y-4">
                        {section.answers.length > 0 ? (
                          section.answers.map((item, itemIndex) => (
                            <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-border/50 last:border-b-0">
                              <dt className="font-medium text-sm md:col-span-1">{item.label}</dt>
                              <dd className="text-sm text-foreground md:col-span-2">{renderAnswer(item.answer)}</dd>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm italic">No questions answered in this section.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <p>No submission data found to display.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
