

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
import { format, parseISO, isValid } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { iconList } from '@/components/ui/icon-selector';
import Image from 'next/image';

const isImageFile = (filename: string) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

const renderAnswer = (question: Question, answer: any) => {
    if (answer === null || answer === undefined || answer === '') {
        return <p className="text-muted-foreground italic">No answer provided.</p>;
    }
    
    const API_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_API_ASSETS_BASE_URL;

    switch (question.type) {
        case 'date':
            const parsedDate = parseISO(answer);
            return <p>{isValid(parsedDate) ? format(parsedDate, 'PPP') : answer}</p>;

        case 'date-range':
            if (typeof answer === 'object' && answer.start && answer.end) {
                const startDate = parseISO(answer.start);
                const endDate = parseISO(answer.end);
                return <p>{isValid(startDate) ? format(startDate, 'PPP') : answer.start} to {isValid(endDate) ? format(endDate, 'PPP') : answer.end}</p>;
            }
            break;

        case 'checkbox':
        case 'dropdown':
             if (Array.isArray(answer)) {
                if (answer.length === 0) return <p className="text-muted-foreground italic">No selection made.</p>;
                return <p>{answer.join(', ')}</p>;
            }
            break;

        case 'country':
            const country = countries.find(c => c.code === answer);
            return country ? <div className="flex items-center gap-2"><span>{country.flag}</span><span>{country.name}</span></div> : <p>{answer}</p>;

        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: answer }} />
                    <p>{answer}</p>
                </div>
            );

        case 'icon-selector':
            const IconComponent = iconList.find(i => i.name.toLowerCase() === String(answer).toLowerCase())?.icon;
            return (
                <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    <p>{answer}</p>
                </div>
            );
        
        case 'formatted-text':
            return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: answer }} />;

        case 'file':
        case 'image-upload':
            const files = Array.isArray(answer) ? answer : [];
            if (files.length === 0) return <p className="text-muted-foreground italic">No files uploaded.</p>;
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file, index) => {
                         const fileUrl = file.url ? `${API_ASSETS_BASE_URL}${file.url}` : '#';
                         if (question.type === 'image-upload' && isImageFile(file.filename)) {
                            return (
                                <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden group">
                                   <div className="relative aspect-square">
                                     <Image src={fileUrl} alt={file.filename || 'Uploaded image'} fill objectFit="cover" className="group-hover:opacity-75 transition-opacity" />
                                   </div>
                                    <div className="text-xs text-center p-2 bg-muted truncate" title={file.filename}>
                                        {file.filename || 'View Image'}
                                    </div>
                                </a>
                            )
                         }
                         return (
                            <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted">
                                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <span className="text-primary hover:underline break-all block text-sm truncate" title={file.filename}>
                                    {file.filename || 'Download File'}
                                </span>
                            </a>
                         )
                    })}
                </div>
            )
        case 'url':
            if (typeof answer === 'string' && (answer.startsWith('http') || answer.startsWith('/'))) {
                return <a href={answer} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{answer}</a>
            }
            break;
    }
    
    if (Array.isArray(answer)) {
        return <p>{answer.join(', ')}</p>;
    }
    if (typeof answer === 'object') {
        return <pre className="p-2 bg-muted rounded-md overflow-x-auto text-xs font-mono">{JSON.stringify(answer, null, 2)}</pre>;
    }

    return <p className="break-words whitespace-pre-wrap">{String(answer)}</p>;
};

interface RenderableSection {
  title: string;
  answers: { question: Question; answer: any }[];
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
    if (!submission || !request) return [];
  
    let formDataObject = submission.form_data;
    if (typeof formDataObject === 'string') {
      try {
        formDataObject = JSON.parse(formDataObject);
      } catch (e) {
        console.error("Failed to parse form_data JSON string:", e);
        return [];
      }
    }
  
    if (typeof formDataObject !== 'object' || formDataObject === null) {
      return [];
    }
  
    const questionMap = new Map<string, Question>();
    request.form_data.forEach(pageDef => {
      pageDef.sections.forEach(sectionDef => {
        sectionDef.questions.forEach(questionDef => {
          if (questionDef.apiId) {
            questionMap.set(questionDef.apiId, questionDef);
          }
        });
      });
    });
  
    const pages: RenderablePage[] = [];
  
    for (const stepKey in formDataObject) {
      if (Object.prototype.hasOwnProperty.call(formDataObject, stepKey)) {
        const stepData = formDataObject[stepKey];
        const pageDef = request.form_data[parseInt(stepKey.split('_')[1]) - 1];
  
        if (!pageDef) continue;
  
        const renderablePage: RenderablePage = { title: pageDef.title, sections: [] };
  
        pageDef.sections.forEach(sectionDef => {
          const renderableSection: RenderableSection = { title: sectionDef.title, answers: [] };
  
          for (const answerKey in stepData) {
            if (Object.prototype.hasOwnProperty.call(stepData, answerKey)) {
              const questionDef = questionMap.get(answerKey);
              if (questionDef && sectionDef.questions.some(q => q.apiId === answerKey)) {
                renderableSection.answers.push({
                  question: questionDef,
                  answer: stepData[answerKey],
                });
              } else {
                 // Handle files that are not mapped directly via apiId, but by a generic key
                 const fileQuestion = sectionDef.questions.find(q => q.type === 'file' && answerKey === 'docs') || sectionDef.questions.find(q => q.type === 'image-upload' && answerKey === 'images');
                 if(fileQuestion) {
                    renderableSection.answers.push({
                      question: fileQuestion,
                      answer: stepData[answerKey],
                    });
                 }
              }
            }
          }
          if (renderableSection.answers.length > 0) {
            renderablePage.sections.push(renderableSection);
          }
        });
  
        if (renderablePage.sections.length > 0) {
          pages.push(renderablePage);
        }
      }
    }
    return pages;
  }, [submission, request]);


  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-white w-full">
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
      <div className="p-6 text-center text-muted-foreground bg-white w-full">
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
    <div className="bg-white min-h-full w-full">
      <div className="p-6">
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
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">Submission for "{request.title}"</CardTitle>
                         <div className="flex flex-col md:flex-row md:items-center md:gap-6 text-sm mt-2">
                            {submission.submission_code && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Submission Code:</span>
                                    <Badge variant="secondary">{submission.submission_code}</Badge>
                                </div>
                            )}
                            {submission.updated_at && (
                                <div className="flex items-center gap-2 mt-1 md:mt-0">
                                    <span className="font-semibold text-foreground">Submitted On:</span>
                                    <span className="text-muted-foreground">{format(parseISO(submission.updated_at), 'PPP p')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Badge
                        variant={'outline'}
                        className={cn(
                            "capitalize h-fit text-base px-4 py-1",
                            submission.status === 'completed' && "border-green-200 bg-green-100 text-green-800"
                        )}
                    >
                        {submission.status === 'completed' && <CheckCircle className="mr-2 h-4 w-4" />}
                        {submission.status}
                    </Badge>
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
                                                <dt className="font-medium text-sm text-muted-foreground md:col-span-1">{item.question.label}</dt>
                                                <dd className="text-sm text-foreground md:col-span-3">{renderAnswer(item.question, item.answer)}</dd>
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
                        <p className="text-sm">It seems this submission is empty or could not be parsed.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

