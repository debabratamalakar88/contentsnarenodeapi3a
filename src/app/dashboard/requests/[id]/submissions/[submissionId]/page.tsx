
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSubmission } from '@/lib/api'; // Assuming a function to get a single submission
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const submissionId = params.submissionId as string;
  const requestId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || !submissionId) {
      router.back();
      return;
    }

    async function fetchSubmission() {
      try {
        // We use the submission code to fetch, which is what the API uses.
        // Assuming submissionId from URL is the code.
        const data = await getSubmission(submissionId);
        setSubmission(data);
      } catch (error: any) {
        toast({
          title: 'Error fetching submission',
          description: error.message || 'Could not load submission details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubmission();
  }, [submissionId, router, toast]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Submission not found.</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="outline" asChild className="mb-4">
        <Link href={`/dashboard/requests/${requestId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Request
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
          <CardDescription>
            Viewing submission from {submission.updated_at ? new Date(submission.updated_at).toLocaleString() : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
            {JSON.stringify(submission.form_data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

