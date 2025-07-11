
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSingleSubmissionForRequest, getRequest, type Submission, type Request as RequestType, type Page, type Section as SectionType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

const renderAnswer = (answer: any) => {
  if (answer === null || answer === undefined) {
    return <p className="text-muted-foreground italic">No answer provided.</p>;
  }
  if (Array.isArray(answer)) {
    return (
      <ul className="list-disc list-inside">
        {answer.map((item, index) => (
          <li key={index}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof answer === 'object') {
     // Handle date range object
    if (answer.start && answer.end) {
      return <p>{format(parseISO(answer.start), 'PPP')} to {format(parseISO(answer.end), 'PPP')}</p>;
    }
    return <pre className="p-2 bg-muted rounded-md overflow-x-auto text-xs">{JSON.stringify(answer, null, 2)}</pre>;
  }
  return <p>{String(answer)}</p>;
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

  // Helper to find the original question label from the request structure using apiId
  const getQuestionLabel = (pageIndex: number, sectionIndex: number, questionApiId: string): string => {
    try {
      const question = request.form_data[pageIndex]?.sections[sectionIndex]?.questions.find(q => q.apiId === questionApiId);
      return question?.label || questionApiId;
    } catch {
      return questionApiId;
    }
  };

  const submittedPages = submission.form_data ? Object.values(submission.form_data) : [];

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
          {submittedPages.map((page: any, pageIndex: number) => (
            <Card key={pageIndex} className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-xl">{page.page_title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {page.sections.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex}>
                    <h4 className="font-semibold text-lg">{section.section_title}</h4>
                    <div className="mt-2 pl-4 border-l-2 space-y-4">
                      {Object.entries(section.questions).map(([apiId, answer]) => (
                        <div key={apiId} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <dt className="font-medium text-sm md:col-span-1">{getQuestionLabel(pageIndex, sectionIndex, apiId)}</dt>
                          <dd className="text-sm text-foreground md:col-span-2">{renderAnswer(answer)}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
