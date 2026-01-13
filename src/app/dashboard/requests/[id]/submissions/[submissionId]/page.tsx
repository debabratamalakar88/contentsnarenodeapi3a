
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSingleSubmissionForRequest, getRequest, type Submission, type Request as RequestType, type Question, getClients, type Client } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, FileText, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, parseISO, isValid } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { iconList } from '@/components/ui/icon-selector';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const isImageFile = (filename: string) => {
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

const renderAnswer = (question: Question, answer: any) => {
    if (answer === null || answer === undefined || answer === '') {
        return <p className="text-muted-foreground italic">No answer provided.</p>;
    }
    
    const API_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_API_ASSETS_BASE_URL || '';

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
             if (Array.isArray(answer)) {
                if (answer.length === 0) return <p className="text-muted-foreground italic">No selection made.</p>;
                return <p>{answer.join(', ')}</p>;
            }
            break;
        
        case 'dropdown':
             return <p>{answer}</p>;

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
            
            const rows: any[][] = [];
            for (let i = 0; i < files.length; i += 3) {
                rows.push(files.slice(i, i + 3));
            }

            return (
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '1rem' }}>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((file, fileIndex) => {
                                    const fileUrl = file.url && API_ASSETS_BASE_URL ? `${API_ASSETS_BASE_URL}${file.url.startsWith('/') ? '' : '/'}${file.url}` : '#';
                                    if (question.type === 'image-upload' && isImageFile(file.filename)) {
                                        return (
                                            <td key={fileIndex} style={{ width: '33.33%', verticalAlign: 'top' }}>
                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden group">
                                                   <div className="relative aspect-square bg-muted">
                                                     <img src={fileUrl} alt={file.filename || 'Uploaded image'} className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
                                                   </div>
                                                    <div className="text-xs p-2 bg-muted flex items-center justify-center min-h-[40px]">
                                                        <span className="break-words">{file.filename || 'View Image'}</span>
                                                    </div>
                                                </a>
                                            </td>
                                        );
                                     }
                                     return (
                                        <td key={fileIndex} style={{ width: '33.33%', verticalAlign: 'top' }}>
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 border rounded-lg hover:bg-muted text-center">
                                                <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                                                <span className="text-primary hover:underline block text-sm flex items-center justify-center min-h-[40px]">
                                                    <span className="break-words">{file.filename || 'Download File'}</span>
                                                </span>
                                            </a>
                                        </td>
                                     );
                                })}
                                {Array(3 - row.length).fill(0).map((_, i) => <td key={`empty-${i}`} />)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
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
  const [isExporting, setIsExporting] = useState(false);
  const submissionContentRef = useRef<HTMLDivElement>(null);

  const submissionId = params.submissionId as string;
  const requestId = params.id as string;

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
    if (!submission || !request || !request.form_data) return [];

    let submissionData = submission.form_data;
    if (typeof submissionData === 'string') {
        try {
            submissionData = JSON.parse(submissionData);
        } catch (e) {
            console.error("Failed to parse submission form_data:", e);
            return [];
        }
    }
    if (typeof submissionData !== 'object' || submissionData === null) return [];
    
    const allAnswers = Object.values(submissionData).reduce((acc, stepData) => {
        if (stepData && typeof stepData === 'object' && !Array.isArray(stepData)) {
            const isNested = Object.values(stepData).some((val: any) => val && val.page_title);
            if (isNested) {
                 Object.values(stepData).forEach((pageData: any) => {
                     if(pageData && Array.isArray(pageData.sections)) {
                        pageData.sections.forEach((section: any) => {
                           if(section && typeof section.questions === 'object') {
                             Object.assign(acc, section.questions);
                           }
                        });
                     }
                 });
            } else {
              Object.assign(acc, stepData);
            }
        }
        return acc;
    }, {});


    return request.form_data.map(pageDef => ({
      title: pageDef.title,
      sections: pageDef.sections.map(sectionDef => ({
        title: sectionDef.title,
        answers: sectionDef.questions
          .map(question => ({
            question,
            answer: allAnswers[question.apiId || '']
          }))
          .filter(item => item.answer !== undefined),
      })).filter(section => section.answers.length > 0),
    })).filter(page => page.sections.length > 0);

  }, [submission, request]);

  const handleExportPdf = async () => {
    if (!submissionContentRef.current) return;
    setIsExporting(true);
    toast({ title: "Generating PDF...", description: "Please wait, this may take a moment." });

    const clonedContent = submissionContentRef.current.cloneNode(true) as HTMLElement;
    document.body.appendChild(clonedContent);
    clonedContent.style.position = 'absolute';
    clonedContent.style.left = '-9999px';
    clonedContent.style.width = submissionContentRef.current.offsetWidth + 'px';

    try {
        const imageToDataUri = async (url: string) => {
            try {
                const response = await fetch(`/api/cors-proxy?url=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error(`Proxy fetch failed with status ${response.status}`);
                const blob = await response.blob();
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => typeof reader.result === 'string' ? resolve(reader.result) : reject('Failed to convert blob to Data URI');
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error(`Failed to convert image to Data URI: ${url}`, error);
                return null;
            }
        };

        const images = Array.from(clonedContent.getElementsByTagName('img'));
        await Promise.all(images.map(async (img) => {
            if (img.src && !img.src.startsWith('data:')) {
                const dataUri = await imageToDataUri(img.src);
                if (dataUri) {
                    return new Promise<void>((resolve) => {
                        img.onload = () => resolve();
                        img.onerror = () => { console.warn(`Failed to load image from data URI: ${img.src}`); resolve(); };
                        img.src = dataUri;
                    });
                }
            }
        }));

        await new Promise((r) => setTimeout(r, 500));
        
        const links = Array.from(clonedContent.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        const contentTop = clonedContent.getBoundingClientRect().top;
        
        const canvas = await html2canvas(clonedContent, {
            scale: 2,
            useCORS: true,
            logging: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        const addLinksToPage = (pageNumber: number) => {
            const pageTopOffset = (pageNumber - 1) * pdfHeight;
            const scaleFactor = pdfWidth / canvas.width * 2; 
            const linkVerticalOffset = 36 / (96 / 25.4);
            
            links.forEach(link => {
                const linkRect = link.getBoundingClientRect();
                const linkTopRelativeToContainer = linkRect.top - contentTop;
                const linkTop = linkTopRelativeToContainer * scaleFactor;

                if(linkTop >= pageTopOffset && linkTop < pageTopOffset + pdfHeight) {
                    const linkLeftOnPage = linkRect.left * scaleFactor;
                    const linkTopOnPage = (linkTop - pageTopOffset) + linkVerticalOffset;
                    const linkWidth = linkRect.width * scaleFactor;
                    const linkHeight = linkRect.height * scaleFactor;
                    
                    pdf.link(linkLeftOnPage, linkTopOnPage, linkWidth, linkHeight, { url: link.href });
                }
            });
        };
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        addLinksToPage(1);
        heightLeft -= pdfHeight;

        let pageCount = 1;
        while (heightLeft > 0) {
            position -= pdfHeight;
            pageCount++;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            addLinksToPage(pageCount);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`submission-${submission?.submission_code}.pdf`);
        toast({ title: 'PDF Exported Successfully' });
    } catch (error) {
        console.error("PDF Export Error: ", error);
        toast({ title: 'Error', description: `Failed to export PDF.`, variant: 'destructive' });
    } finally {
        document.body.removeChild(clonedContent);
        setIsExporting(false);
    }
};


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
        <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/requests/${requestId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Submission Details</h1>
            </div>
            <Button onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Export as PDF
            </Button>
        </div>
        <Card className="bg-card shadow-sm w-full" ref={submissionContentRef}>
           <div className="p-8">
                <header className="mb-8 pb-4 border-b">
                     <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="align-middle">
                                    <h2 className="text-2xl font-bold">Submission for "{request.title}"</h2>
                                    <table className="text-sm mt-4">
                                        <tbody>
                                            <tr className="bg-transparent hover:bg-transparent">
                                                <td className="font-semibold text-gray-700 pr-4 py-1 align-top">Submission Code:</td>
                                                <td className="align-top">
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-600 inline-block">{submission.submission_code}</span>
                                                </td>
                                            </tr>
                                            {submission.client_name && submission.client_email && (
                                                <tr className="bg-transparent hover:bg-transparent">
                                                    <td className="font-semibold text-gray-700 pr-4 py-1 align-top">Submitted by:</td>
                                                    <td className="text-gray-600 align-top">{submission.client_name} ({submission.client_email})</td>
                                                </tr>
                                            )}
                                            <tr className="bg-transparent hover:bg-transparent">
                                                <td className="font-semibold text-gray-700 pr-4 py-1 align-top">Submitted On:</td>
                                                <td className="text-gray-600 align-top">{submission.updated_at ? format(parseISO(submission.updated_at), 'PPP p') : 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td className="w-px px-4 align-middle" style={{verticalAlign: 'middle'}}>
                                    <Badge
                                        variant={'outline'}
                                        className={cn(
                                            "capitalize text-base px-4 py-1 flex items-center justify-center",
                                            submission.status === 'completed' && "border-green-300 bg-green-100 text-green-800"
                                        )}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        <span>Completed</span>
                                    </Badge>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </header>
                <div>
                    {processedData.length > 0 ? (
                        <Accordion type="multiple" defaultValue={processedData.map(p => p.title)} className="w-full">
                        {processedData.map((page, pageIndex) => (
                            <AccordionItem key={pageIndex} value={page.title}>
                                <AccordionTrigger className="text-xl font-semibold hover:no-underline">{page.title}</AccordionTrigger>
                                <AccordionContent className="pt-4 px-2">
                                    <div className="space-y-6">
                                        {page.sections.map((section, sectionIndex) => (
                                            <div key={sectionIndex}>
                                                <h4 className="font-semibold text-lg text-foreground mb-4 border-b pb-2 py-2">{section.title}</h4>
                                                <div className="space-y-6">
                                                    {section.answers.map((item, itemIndex) => (
                                                        <table key={itemIndex} className="w-full">
                                                            <tbody>
                                                                <tr className="bg-transparent even:bg-transparent hover:bg-transparent">
                                                                    <td className="font-medium text-sm text-muted-foreground align-top w-1/3 pr-4">{item.question.label}</td>
                                                                    <td className="text-sm text-foreground align-top w-2/3">{renderAnswer(item.question, item.answer)}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    ))}
                                                </div>
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
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
