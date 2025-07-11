
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSingleSubmissionForRequest, getRequest, type Submission, type Request as RequestType } from '@/lib/api';
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
  if (typeof answer === 'object') {
    if (answer.start && answer.end) {
      return <p>{format(parseISO(answer.start), 'PPP')} to {format(parseISO(answer.end), 'PPP')}</p>;
    }
    return <pre className="p-2 bg-muted rounded-md overflow-x-auto text-xs">{JSON.stringify(answer, null, 2)}</pre>;
  }
  // For file uploads, which might be stored as a string path
  if (typeof answer === 'string' && (answer.startsWith('http') || answer.startsWith('/'))) {
      return <a href={answer} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{answer}</a>
  }

  return <p className="break-words whitespace-pre-wrap">{String(answer)}</p>;
};

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

  const getQuestionLabel = (apiId: string): string => {
    if (!request) return apiId;
    for (const page of request.form_data) {
        for (const section of page.sections) {
            const question = section.questions.find(q => q.apiId === apiId);
            if (question) return question.label;
        }
    }
    return apiId;
  };
  
  const submittedData = submission.form_data || {};
  const pageKeys = Object.keys(submittedData).sort();

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
          {pageKeys.map((pageKey, pageIndex) => {
            const page = submittedData[pageKey];
            if (!page || !page.page_title) return null;

            return (
              <Card key={pageIndex} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-xl">{page.page_title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(page.sections) && page.sections.map((section: any, sectionIndex: number) => (
                    <div key={sectionIndex}>
                      <h4 className="font-semibold text-lg">{section.section_title}</h4>
                      <div className="mt-2 pl-4 border-l-2 space-y-4">
                        {Object.keys(section.questions || {}).length > 0 ? (
                           Object.entries(section.questions).map(([apiId, answer]) => (
                            <div key={apiId} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-border/50 last:border-b-0">
                              <dt className="font-medium text-sm md:col-span-1">{getQuestionLabel(apiId)}</dt>
                              <dd className="text-sm text-foreground md:col-span-2">{renderAnswer(answer)}</dd>
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
            )
          })}
        </CardContent>
      </Card>
    </div>
  );
}
