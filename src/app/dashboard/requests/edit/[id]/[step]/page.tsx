

'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import StepNavigation from '../../../new/components/StepNavigation';
import EssentialsStep from '../../../new/components/EssentialsStep';
import BuilderStep from '@/app/dashboard/templates/new/components/BuilderStep';
import FinalizeStep from '../../../new/components/FinalizeStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Type, Pilcrow, CheckSquare, ChevronDown as ChevronDownIcon, ListOrdered, UploadCloud, CalendarDays, AtSign, Phone, Link2, Plus, X, Loader2, Search, PenSquare, ImageUp, FileUp, Mail, MapPin, Hash, DollarSign, Globe, CalendarClock, CalendarRange, CircleDot, MenuSquare, GalleryVertical, Table, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick, MoreHorizontal, Settings, GripVertical, Folder, ChevronDown, Pencil, MessageSquare, History, Info, Edit, Archive, Trash2, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getRequest, updateRequest, type Request, type Page, type Section, type Question, type QuestionOption, type QuestionType, getClients, type Client } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from "@/lib/countries";
import { IconSelector } from "@/components/ui/icon-selector";
import PreviewStep from "../../../new/components/PreviewStep";
import { Switch } from "@/components/ui/switch";
import { format, parseISO } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const steps = [
    { name: "Templates", slug: "templates" },
    { name: "Essentials", slug: "essentials" },
    { name: "Builder", slug: "builder" },
    { name: "Preview", slug: "preview" },
    { name: "Finalize", slug: "finalize" }
];

const questionCategories: {
    name: string;
    fields: {
        type: QuestionType;
        label: string;
        icon: React.ElementType;
        isNew?: boolean;
        isHighlighted?: boolean;
    }[];
}[] = [
    {
        name: "Common Fields",
        fields: [
            { type: 'text', label: 'Single Line Text', icon: Type },
            { type: 'textarea', label: 'Multiline Text', icon: Pilcrow },
            { type: 'formatted-text', label: 'Formatted Text', icon: PenSquare },
            { type: 'image-upload', label: 'Image(s) Upload', icon: ImageUp },
            { type: 'file', label: 'File(s) Upload', icon: FileUp },
        ],
    },
    {
        name: "Validation Fields",
        fields: [
            { type: 'email', label: 'Email', icon: Mail },
            { type: 'address', label: 'Address', icon: MapPin },
            { type: 'url', label: 'URL', icon: Link2 },
            { type: 'number', label: 'Number', icon: Hash },
            { type: 'tel', label: 'Phone', icon: Phone },
            { type: 'currency', label: 'Currency', icon: DollarSign },
            { type: 'country', label: 'Country', icon: Globe, isNew: true, isHighlighted: true },
            { type: 'date', label: 'Date/Time', icon: CalendarClock },
            { type: 'date-range', label: 'Date Range', icon: CalendarRange },
        ],
    },
    {
        name: "Selection Fields",
        fields: [
            { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
            { type: 'radio', label: 'Single Choice', icon: CircleDot },
            { type: 'dropdown', label: 'Dropdown', icon: MenuSquare },
        ],
    },
    {
        name: "UI Fields",
        fields: [
            { type: 'icon-selector', label: 'Icon Selector', icon: Sparkles },
            { type: 'color-picker', label: 'Color Picker', icon: Pipette },
            { type: 'button', label: 'Button', icon: MousePointerClick },
        ],
    },
];

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

const renderQuestionPreview = (question: Question) => {
    const questionId = `preview-${question.id}`;
    
    switch (question.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'number':
        case 'date':
        case 'currency':
             return <Input id={questionId} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'textarea':
             return <Textarea id={questionId} placeholder={question.placeholder} defaultValue={question.defaultValue} disabled />;
        case 'radio':
            return (
                <RadioGroup defaultValue={question.defaultValue} disabled>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`preview-${question.id}-${i}`} value={opt.value} disabled />
                            <Label htmlFor={`${questionId}-${i}`}>{opt.label}</Label>
                        </div>
                    ))}
                </div>
            )
        case 'dropdown':
            return (
                <Select defaultValue={question.defaultValue} disabled>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )
        case 'formatted-text':
            return <div className="prose prose-sm max-w-none p-2 border rounded-md min-h-[60px]" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
        default:
            return <Input id={questionId} type="text" placeholder={question.label} disabled />;
    }
}


const RequestPreview = ({ initialRequestData, clients, activeIds, setActiveIds, navigatePage, handleContinue, isLastQuestion, setRequestToArchive, setRequestToForceDelete, nextStep, isSubmitting, id }: any) => {
    const isFinalizeStep = useMemo(() => window.location.pathname.endsWith('/finalize'), []);
    
    const assignedClient = useMemo(() => clients.find((c: Client) => initialRequestData.client_id?.includes(c.id)), [clients, initialRequestData.client_id]);

    const { activeQuestion, activeSection, activePage, activePageIndex } = useMemo(() => {
        if (!initialRequestData || !activeIds) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };

        const page = initialRequestData.form_data.find((p: Page) => p.id === activeIds.pageId);
        if (!page) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };
        
        const section = page.sections.find((s: Section) => s.id === activeIds.sectionId);
        if (!section) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };

        const question = section.questions.find((q: Question) => q.id === activeIds.questionId);
        if(!question) return { activeQuestion: null, activeSection: null, activePage: null, activePageIndex: -1 };
        
        const pageIndex = initialRequestData.form_data.findIndex((p: Page) => p.id === page.id);

        return { activeQuestion: question, activeSection: section, activePage: page, activePageIndex: pageIndex };
    }, [initialRequestData, activeIds]);

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            <aside 
                 style={{
                    display: 'flex',
                    width: '20vw',
                    flexDirection: 'column',
                    maxWidth: '26rem',
                    minWidth: 'min(22rem, 100vw)',
                }}
                className="bg-card h-screen"
            >
                <div className="p-6">
                    <h1 className="text-xl font-bold">{initialRequestData.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        {initialRequestData.due_date && <Badge variant="outline"><CalendarDays className="h-3 w-3 mr-1.5" />Due: {format(parseISO(initialRequestData.due_date), 'dd/MM/yyyy')}</Badge>}
                        <Badge variant="secondary" className="capitalize">{initialRequestData.status}</Badge>
                    </div>
                     {assignedClient && (
                        <div className="mt-4 flex items-center gap-3">
                            <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(assignedClient.full_name)}</AvatarFallback></Avatar>
                            <div>
                                <p className="text-sm font-semibold">{assignedClient.full_name}</p>
                                <p className="text-xs text-muted-foreground">{assignedClient.email}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-h-0">
                    <nav className="h-full overflow-y-auto" style={{borderTop: "1px solid #ddd", padding: '10px'}}>
                        <Accordion type="single" collapsible className="w-full" value={`page-${activeIds?.pageId}`} onValueChange={(value) => {
                            const pageId = Number(value.replace('page-', ''));
                            const page = initialRequestData.form_data.find((p: Page) => p.id === pageId);
                            if(page && page.sections.length > 0 && page.sections[0].questions.length > 0) {
                                setActiveIds({ pageId: page.id, sectionId: page.sections[0].id, questionId: page.sections[0].questions[0].id });
                            }
                        }}>
                            {initialRequestData.form_data.map((page: Page) => (
                                <AccordionItem value={`page-${page.id}`} key={page.id} className="border-none">
                                    <AccordionTrigger 
                                        className={cn("w-full text-left p-3 font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer hover:no-underline", page.id === activeIds?.pageId ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                                    >
                                        <span className="truncate">{page.title}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-4 mt-1 pb-0">
                                        {page.sections.map((section: Section) => (
                                            <div key={section.id} className="border-l">
                                                <div className={cn("w-full text-left p-2 rounded-md font-semibold transition-colors text-sm flex items-center justify-between cursor-pointer pl-2", section.id === activeIds?.sectionId && "bg-primary/10 text-primary")} onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: section.questions[0].id })}>
                                                    <span className="truncate">{section.title}</span>
                                                </div>
                                                <div className="pl-6 border-l ml-2">
                                                    {section.questions.map((question: Question) => (
                                                        <div key={question.id} className={cn("pl-2 border-l -ml-4", question.id === activeIds?.questionId && section.id === activeIds.sectionId ? "border-primary" : "border-transparent")}>
                                                            <TooltipProvider delayDuration={100}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="w-full text-left py-1.5 text-sm rounded-r-md pl-4 transition-colors" onClick={() => setActiveIds({ pageId: page.id, sectionId: section.id, questionId: question.id })}>
                                                                            <p className={cn("truncate", question.id === activeIds?.questionId && section.id === activeIds.sectionId ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>{question.label}</p>
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="right" align="start"><p className="max-w-xs">{question.label}</p></TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </nav>
                </div>
                 <div className="p-6">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">GETTING STARTED</Button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                 <header className="sticky z-10 flex flex-col gap-4 p-4 border-b bg-card">
                     <div className="flex items-center justify-between">
                        <div />
                        <div className="flex items-center gap-4">
                            
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('prev')} disabled={activePageIndex === 0}><ChevronLeft className="h-5 w-5" /></Button>
                            <span className="text-sm font-medium text-muted-foreground">{activePageIndex > 0 && initialRequestData.form_data[activePageIndex - 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                           <span className="text-sm font-medium text-muted-foreground">{activePageIndex < initialRequestData.form_data.length - 1 && initialRequestData.form_data[activePageIndex + 1].title.replace(/^[0-9\.]+\s*/, '')}</span>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigatePage('next')} disabled={activePageIndex === initialRequestData.form_data.length - 1}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8 max-w-4xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{activeSection?.title.replace(/^[0-9\.]+\s*/, '')}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><MessageSquare className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><History className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-200/80">
                            {activeQuestion ? (
                                <>
                                    <h3 className="font-semibold text-lg">{activeQuestion.label}</h3>
                                    {activeQuestion.instructions && <p className="text-muted-foreground mt-2">{activeQuestion.instructions}</p>}
                                    <div className="mt-6">
                                        {renderQuestionPreview(activeQuestion)}
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <Button variant="link" className="p-0 h-auto text-primary font-semibold" onClick={handleContinue} disabled={isLastQuestion}>
                                            {isLastQuestion ? "End of Form" : "Continue to next question"}
                                        </Button>
                                        <Button variant="outline" className="rounded-full">COMMENTS</Button>
                                    </div>
                                </>
                            ) : <p>Select a question to see the preview.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};


export default function EditRequestWizardPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    
    const id = Number(params.id);
    const stepSlug = Array.isArray(params.step) ? params.step[0] : (params.step || 'essentials');

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.slug === stepSlug);
        return index === -1 ? 1 : index; // Default to essentials index
    }, [stepSlug]);
    const currentStep = steps[currentStepIndex]?.name;
    
    // State for the whole wizard
    const [requestTitle, setRequestTitle] = useState("");
    const [requestDescription, setRequestDescription] = useState("");
    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialRequestData, setInitialRequestData] = useState<Request | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);

    // State to track wizard progress
    const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(steps.length - 1); // Allow all steps in edit mode

    // Question Type Dialog State
    const [isQuestionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ pageId: number, sectionId: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Question Settings Dialog State
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Question | null>(null);

    // Preview Step State
    const [activeIds, setActiveIds] = useState<{ pageId: number, sectionId: number, questionId: number } | null>(null);
    const [requestToArchive, setRequestToArchive] = useState<Request | null>(null);
    const [requestToForceDelete, setRequestToForceDelete] = useState<Request | null>(null);


    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        
        const token = localStorage.getItem('authToken');
        const requestId = id;
        if (!token || !requestId) {
            toast({ title: "Error", description: "Invalid request or not logged in.", variant: "destructive" });
            router.push('/dashboard/requests');
            return;
        }

        async function fetchRequestData() {
            try {
                const [data, clientData] = await Promise.all([
                    getRequest(token, requestId),
                    getClients(token),
                ]);

                setRequestTitle(data.title);
                setRequestDescription(data.description);
                setPages(data.form_data || []);
                if (data.form_data?.length > 0) {
                    setActivePageId(data.form_data[0].id);
                    setActiveIds({
                        pageId: data.form_data[0].id,
                        sectionId: data.form_data[0].sections[0].id,
                        questionId: data.form_data[0].sections[0].questions[0].id
                    });
                }
                setInitialRequestData(data);
                setClients(clientData);

            } catch (error: any) {
                toast({ title: "Failed to load request", description: error.message || "Could not fetch request data.", variant: "destructive" });
                router.push('/dashboard/requests');
            } finally {
                setIsLoading(false);
            }
        }

        fetchRequestData();
    }, [id, router, toast]);
    
    const isViewerRole = userRole === 'Reviewer' || userRole === 'Viewer';

    const handleFinalSave = async (settings: any, status: 'published' | 'draft' | 'scheduled') => {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      if (!token || !id) {
        toast({ title: "Error", description: "Invalid request or not logged in.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    
      let finalStatus = initialRequestData?.status === 'published' ? 'published' : status;

      if (settings.send_option === 'scheduled' && status === 'published') {
          finalStatus = 'scheduled';
      }

      const payload = {
        title: requestTitle,
        description: requestDescription,
        form_data: pages,
        ...settings,
        status: finalStatus,
      };
    
      try {
        await updateRequest(token, id, payload);
        let successMessage = '';
        if (initialRequestData?.status === 'published') {
            successMessage = 'Request settings have been updated.';
        } else {
            switch(finalStatus) {
                case 'published':
                    successMessage = 'Request has been successfully published and sent.';
                    break;
                case 'scheduled':
                    successMessage = 'Request has been successfully scheduled.';
                    break;
                case 'draft':
                    successMessage = 'Request has been successfully saved as a draft.';
                    break;
            }
        }
        
        toast({
          title: "Success",
          description: successMessage,
        });
        router.push('/dashboard/requests');
        router.refresh();
      } catch (error: any) {
        const errorDescription = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "An unexpected error occurred.";
        toast({ title: "Save Failed", description: errorDescription, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    const nextStep = async () => {
        if (currentStepIndex >= steps.length - 1) return;
    
        setIsSubmitting(true);
        const token = localStorage.getItem('authToken');
        const requestId = id;
        if (!token || !requestId) {
            toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
        
        try {
            const payload: Partial<Request> = {
                title: requestTitle,
                description: requestDescription,
                form_data: pages,
            };
    
            if (initialRequestData?.status === 'published' && initialRequestData.client_id) {
                payload.client_id = initialRequestData.client_id;
            }
    
            await updateRequest(token, requestId, payload);
            const isPublished = initialRequestData?.status === 'published';
            toast({ title: isPublished ? "Request updated" : "Request draft updated" });
    
            const nextStepSlug = steps[currentStepIndex + 1].slug;
            router.push(`/dashboard/requests/edit/${requestId}/${nextStepSlug}`);
    
        } catch (error: any) {
            const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "An unexpected error occurred.";
            toast({ title: "Save Failed", description, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBack = () => {
        if (isViewerRole) {
            router.push('/dashboard/requests');
            return;
        }
        if (currentStepIndex > 1) { // If on builder or later, go back one step
            const prevStepSlug = steps[currentStepIndex - 1].slug;
            router.push(`/dashboard/requests/edit/${id}/${prevStepSlug}`);
        } else { // If on essentials, go back to template selection (or dashboard if direct edit)
             router.push('/dashboard/requests');
        }
    };

    const handleStepClick = (slug: string) => {
        const targetIndex = steps.findIndex(s => s.slug === slug);
        const isStepDisabled = disabledSteps.includes(slug);
        if (!isStepDisabled && targetIndex <= maxVisitedStepIndex) {
            router.push(`/dashboard/requests/edit/${id}/${slug}`);
        }
    };
    
    const disabledSteps = ['templates'];

    const renumberItems = (pagesToRenumber: Page[]): Page[] => {
      return pagesToRenumber.map((page, pageIndex) => {
          const newPageNumber = pageIndex + 1;
          const pageTitleText = page.title.replace(/^[0-9\.]+\s*/, '');
  
          const renumberedSections = page.sections.map((section, sectionIndex) => {
              const newSectionNumber = sectionIndex + 1;
              const sectionTitleText = section.title.replace(/^[0-9\.]+\s*/, '');
              return {
                  ...section,
                  title: `${newPageNumber}.${newSectionNumber} ${sectionTitleText}`,
              };
          });
  
          return {
              ...page,
              title: `${newPageNumber}. ${pageTitleText}`,
              sections: renumberedSections,
          };
      });
    };

    const addPage = () => {
        const newPageId = Date.now();
        const newQuestion: Question = {
            id: Date.now() + 2, 
            type: 'text',
            label: 'Single Line Text',
            instructions: "",
            placeholder: "",
            required: false,
            apiId: slugify(`single_line_text_${Date.now() + 2}`),
        };
        const newPage: Page = {
            id: newPageId,
            title: `New Page`,
            instructions: "",
            sections: [{
                id: Date.now() + 1,
                title: `New Section`,
                instructions: '',
                questions: [newQuestion]
            }]
        };
        const newPages = renumberItems([...pages, newPage]);
        setPages(newPages);
        setActivePageId(newPageId);
    };

    const deletePage = (pageId: number) => {
        setPages(prevPages => {
            if (prevPages.length <= 1) {
                toast({ title: "Action Forbidden", description: "You cannot delete the only page.", variant: "destructive" });
                return prevPages;
            }
            const pageIndexToDelete = prevPages.findIndex(p => p.id === pageId);
            const newPages = prevPages.filter(p => p.id !== pageId);
            if (activePageId === pageId) {
                const newActiveIndex = Math.max(0, pageIndexToDelete - 1);
                setActivePageId(newPages[newActiveIndex]?.id || null);
            }
            return renumberItems(newPages);
        });
    };

    const duplicatePage = (pageId: number) => {
      setPages(prevPages => {
          const pageToDuplicate = prevPages.find(p => p.id === pageId);
          if (!pageToDuplicate) return prevPages;
          const pageIndex = prevPages.findIndex(p => p.id === pageId);
          const newPage: Page = JSON.parse(JSON.stringify(pageToDuplicate));
          newPage.id = Date.now();
          const originalTitle = newPage.title.replace(/^[0-9\.]+\s*/, '');
          newPage.title = `${originalTitle.replace(/\s*\(Copy\)/gi, '').trim()} (Copy)`;
          newPage.sections.forEach(section => {
              section.id = Date.now() + Math.random();
              section.questions.forEach(question => {
                  question.id = Date.now() + Math.random();
                  question.apiId = slugify(`${question.label}_${Date.now()}`);
              });
          });
          const newPages = [...prevPages];
          newPages.splice(pageIndex + 1, 0, newPage);
          setActivePageId(newPage.id);
          return renumberItems(newPages);
      });
    };

    const addSection = (pageId: number) => {
        setPages(prevPages => {
            const newPages = prevPages.map(page => {
                if (page.id === pageId) {
                     const newQuestion: Question = {
                        id: Date.now() + 1,
                        type: 'text',
                        label: 'Single Line Text',
                        instructions: "",
                        placeholder: "",
                        required: false,
                        apiId: slugify(`single_line_text_${Date.now()}`),
                    };
                    const newSection: Section = { id: Date.now(), title: `New Section`, instructions: '', questions: [newQuestion] };
                    return { ...page, sections: [...page.sections, newSection] };
                }
                return page;
            });
            return renumberItems(newPages);
        });
    };
    
    const duplicateSection = (pageId: number, sectionId: number) => {
        setPages(prevPages => {
            const newPages = [...prevPages];
            const page = newPages.find(p => p.id === pageId);
            if (!page) return prevPages;

            const sectionIndex = page.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return prevPages;

            const sectionToDuplicate = page.sections[sectionIndex];
            const newSection: Section = JSON.parse(JSON.stringify(sectionToDuplicate));
            
            newSection.id = Date.now();
            const originalTitle = newSection.title.replace(/^[0-9\.]+\s*/, '');
            newSection.title = `${originalTitle.replace(/\s*\(Copy\)/gi, '').trim()} (Copy)`;
            newSection.questions.forEach(q => {
                q.id = Date.now() + Math.random();
                q.apiId = slugify(`${q.label}_${Date.now()}`);
            });
            
            page.sections.splice(sectionIndex + 1, 0, newSection);
            return renumberItems(newPages);
        });
    };

    const deleteSection = (pageId: number, sectionId: number) => {
        setPages(prevPages => {
            const newPages = prevPages.map(page => {
                if (page.id === pageId) {
                    if (page.sections.length <= 1) {
                         toast({ title: "Action Forbidden", description: "You cannot delete the only section on a page.", variant: "destructive" });
                         return page;
                    }
                    const updatedSections = page.sections.filter(s => s.id !== sectionId);
                    return { ...page, sections: updatedSections };
                }
                return page;
            });
            return renumberItems(newPages);
        });
    };


    const updatePageTitle = (pageId: number, newTitle: string) => {
        setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, title: newTitle } : page));
    };

    const updateSectionTitle = (pageId: number, sectionId: number, newTitle: string) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.id === pageId) {
                return {
                    ...page,
                    sections: page.sections.map(section => {
                        if (section.id === sectionId) {
                            return { ...section, title: newTitle };
                        }
                        return section;
                    })
                };
            }
            return page;
        }));
    };
    
    const handleAddFieldClick = (pageId: number, sectionId: number) => {
        setCurrentLocation({ pageId, sectionId });
        setSearchTerm("");
        setQuestionTypeDialogOpen(true);
    };
    
    const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const addQuestion = (type: QuestionType) => {
        if (!currentLocation) return;
        const { pageId, sectionId } = currentLocation;
        setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, sections: page.sections.map(section => {
            if (section.id === sectionId) {
                const fieldConfig = questionCategories.flatMap(c => c.fields).find(f => f.type === type) || { label: 'New Field' };
                const baseLabel = fieldConfig.label;
                const newQuestion: Question = {
                    id: Date.now(), type: type, label: baseLabel, instructions: "", placeholder: "",
                    options: (type === 'radio' || type === 'dropdown' || type === 'checkbox') ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] : undefined,
                    required: false, apiId: slugify(`${baseLabel}_${Date.now()}`),
                };
                if (type === 'button') {
                    newQuestion.buttonVariant = 'default';
                    newQuestion.buttonType = 'button';
                }
                return { ...section, questions: [...section.questions, newQuestion] };
            }
            return section;
        })} : page));
        setQuestionTypeDialogOpen(false);
        setCurrentLocation(null);
    };

    const openQuestionSettings = (question: Question) => {
        setEditingQuestion(question);
        setTempQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
    };
    
    const updateQuestion = () => {
        if (!tempQuestion) return;
        setPages(prevPages => prevPages.map(page => ({
            ...page,
            sections: page.sections.map(section => ({
                ...section,
                questions: section.questions.map(q =>
                    q.id === tempQuestion.id ? tempQuestion : q
                )
            }))
        })));
        setEditingQuestion(null);
        setTempQuestion(null);
    };
    
    const duplicateQuestion = (pageId: number, sectionId: number, questionId: number) => {
        setPages(prevPages => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const page = newPages.find((p: Page) => p.id === pageId);
            if (page) {
                const section = page.sections.find((s: Section) => s.id === sectionId);
                if (section) {
                    const questionIndex = section.questions.findIndex((q: Question) => q.id === questionId);
                    if (questionIndex > -1) {
                        const originalQuestion = section.questions[questionIndex];
                        const duplicatedQuestion: Question = { ...originalQuestion, id: Date.now(), label: `${originalQuestion.label} (Copy)`, apiId: slugify(`${originalQuestion.label} (Copy) ${Date.now()}`) };
                        section.questions.splice(questionIndex + 1, 0, duplicatedQuestion);
                    }
                }
            }
            return newPages;
        });
    };

    const deleteQuestion = (pageId: number, sectionId: number, questionId: number) => {
        setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, sections: page.sections.map(section => section.id === sectionId ? { ...section, questions: section.questions.filter(q => q.id !== questionId) } : section) } : page));
    };

    const reorderQuestions = (pageId: number, sectionId: number, startIndex: number, endIndex: number) => {
        setPages(prevPages => {
            const newPages: Page[] = JSON.parse(JSON.stringify(prevPages));
            const page = newPages.find(p => p.id === pageId);
            if (page) {
                const section = page.sections.find(s => s.id === sectionId);
                if (section) {
                    const [removed] = section.questions.splice(startIndex, 1);
                    section.questions.splice(endIndex, 0, removed);
                }
            }
            return newPages;
        });
    };

    const handleTempQuestionChange = (field: keyof Question, value: any) => {
        if (tempQuestion) {
            const newTempQuestion = { ...tempQuestion, [field]: value };
            if(field === 'label') newTempQuestion.apiId = slugify(value);
            setTempQuestion(newTempQuestion);
        }
    };
    
    const handleTempOptionChange = (index: number, field: keyof QuestionOption, value: string) => {
        if (tempQuestion && tempQuestion.options) {
            const newOptions = [...tempQuestion.options];
            newOptions[index] = {...newOptions[index], [field]: value};
            if(field === 'label' && (!newOptions[index].value || slugify(newOptions[index].value) === slugify(tempQuestion.options[index].label))) {
                newOptions[index].value = slugify(value);
            }
            setTempQuestion({ ...tempQuestion, options: newOptions });
        }
    };

    const addTempOption = () => {
        if (tempQuestion) {
            const nextOptionNum = (tempQuestion.options?.length || 0) + 1;
            const newOption: QuestionOption = {
                label: `Option ${nextOptionNum}`,
                value: `option_${nextOptionNum}`
            }
            const newOptions = [...(tempQuestion.options || []), newOption];
            setTempQuestion({ ...tempQuestion, options: newOptions });
        }
    };

    const removeTempOption = (index: number) => {
        if (tempQuestion && tempQuestion.options) {
            const newOptions = tempQuestion.options.filter((_, i) => i !== index);
            setTempQuestion({ ...tempQuestion, options: newOptions });
        }
    };

    const filteredCategories = questionCategories.map(category => ({
        ...category,
        fields: category.fields.filter(field =>
            field.label.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter(category => category.fields.length > 0);

    const isFinalizeStep = currentStepIndex === steps.length - 1;

    // Functions for Preview Step
    const navigatePage = (direction: 'next' | 'prev') => {
        if (!initialRequestData || !activeIds) return;
        const pageIndex = initialRequestData.form_data.findIndex(p => p.id === activeIds.pageId);
        const newIndex = direction === 'next' ? pageIndex + 1 : pageIndex - 1;

        if (newIndex >= 0 && newIndex < initialRequestData.form_data.length) {
            const newPage = initialRequestData.form_data[newIndex];
            setActiveIds({
                pageId: newPage.id,
                sectionId: newPage.sections[0].id,
                questionId: newPage.sections[0].questions[0].id,
            });
        }
    };
    
    const handleContinue = () => {
        if (!initialRequestData || !activeIds) return;

        const { pageId, sectionId, questionId } = activeIds;

        const pageIndex = initialRequestData.form_data.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;
        const currentPage = initialRequestData.form_data[pageIndex];

        const sectionIndex = currentPage.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;
        const currentSection = currentPage.sections[sectionIndex];

        const questionIndex = currentSection.questions.findIndex(q => q.id === questionId);
        if (questionIndex === -1) return;

        if (questionIndex < currentSection.questions.length - 1) {
            const nextQuestion = currentSection.questions[questionIndex + 1];
            setActiveIds({ pageId, sectionId, questionId: nextQuestion.id });
            return;
        }

        if (sectionIndex < currentPage.sections.length - 1) {
            const nextSection = currentPage.sections[sectionIndex + 1];
            if (nextSection.questions.length > 0) {
                const nextQuestion = nextSection.questions[0];
                setActiveIds({ pageId, sectionId: nextSection.id, questionId: nextQuestion.id });
                return;
            }
        }

        if (pageIndex < initialRequestData.form_data.length - 1) {
            const nextPage = initialRequestData.form_data[pageIndex + 1];
            if (nextPage.sections.length > 0 && nextPage.sections[0].questions.length > 0) {
                const nextSection = nextPage.sections[0];
                const nextQuestion = nextSection.questions[0];
                setActiveIds({ pageId: nextPage.id, sectionId: nextSection.id, questionId: nextQuestion.id });
                return;
            }
        }
        toast({ title: "End of Form", description: "You have reached the last question."});
    };
    
    const isLastQuestion = useMemo(() => {
        if (!initialRequestData || !activeIds) return true;
        const { pageId, sectionId, questionId } = activeIds;
        const lastPage = initialRequestData.form_data[initialRequestData.form_data.length - 1];
        if (pageId !== lastPage.id) return false;
        const lastSection = lastPage.sections[lastPage.sections.length - 1];
        if (sectionId !== lastSection.id) return false;
        const lastQuestion = lastSection.questions[lastSection.questions.length - 1];
        return questionId === lastQuestion.id;
    }, [initialRequestData, activeIds]);

    const handleArchive = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !requestToArchive) return;
        try {
            await updateRequest(token, requestToArchive.id, { ...requestToArchive, status: 'archived' });
            toast({ title: 'Request archived' });
            router.push('/dashboard/requests');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error archiving request', description: err.message });
        } finally {
            setRequestToArchive(null);
        }
    };
    
    const handleForceDelete = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || !requestToForceDelete) return;
        try {
            await updateRequest(token, requestToForceDelete.id, { ...requestToForceDelete, is_deleted: true });
            toast({ title: 'Request permanently deleted' });
            router.push('/dashboard/requests');
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting request', description: err.message });
        } finally {
            setRequestToForceDelete(null);
        }
    };


    const renderStep = () => {
        if (isLoading) {
            return (
                <div className="p-6 w-full max-w-3xl mx-auto space-y-4">
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            );
        }
        
        switch (currentStep) {
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep
                                        setPages={setPages}
                                        requestTitle={requestTitle}
                                        setRequestTitle={setTemplateTitle}
                                        pages={pages || []} addPage={addPage} addSection={addSection} onAddFieldClick={handleAddFieldClick}
                                        updatePageTitle={updatePageTitle} updateSectionTitle={updateSectionTitle}
                                        openQuestionSettings={openQuestionSettings} duplicateQuestion={duplicateQuestion}
                                        deleteQuestion={deleteQuestion} activePageId={activePageId} setActivePageId={setActivePageId}
                                        duplicatePage={duplicatePage} deletePage={deletePage} 
                                        duplicateSection={duplicateSection} deleteSection={deleteSection}
                                        reorderQuestions={reorderQuestions}
                                        editingQuestion={editingQuestion}
                                        closeQuestionSettings={() => setEditingQuestion(null)}
                                        tempQuestion={tempQuestion}
                                        handleTempQuestionChange={handleTempQuestionChange}
                                        addTempOption={addTempOption}
                                        handleTempOptionChange={handleTempOptionChange}
                                        removeTempOption={removeTempOption}
                                        updateQuestion={updateQuestion}
                                    />;
            case "Preview": 
                return <RequestPreview 
                    initialRequestData={initialRequestData} 
                    clients={clients} 
                    activeIds={activeIds} 
                    setActiveIds={setActiveIds} 
                    navigatePage={navigatePage}
                    handleContinue={handleContinue}
                    isLastQuestion={isLastQuestion}
                    setRequestToArchive={setRequestToArchive}
                    setRequestToForceDelete={setRequestToForceDelete}
                    nextStep={nextStep}
                    isSubmitting={isSubmitting}
                    id={id}
                />;
            case "Finalize": return (
                <FinalizeStep
                    initialData={initialRequestData}
                    onPublish={(settings) => handleFinalSave(settings, 'published')}
                    onSaveDraft={(settings) => handleFinalSave(settings, 'draft')}
                    isSubmitting={isSubmitting}
                />
            );
            default: return <div>Step not found. Please navigate using the steps above.</div>;
        }
    };

    return (
        <>
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-16 z-20 flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 flex justify-center">
                    {!isViewerRole && (
                        <StepNavigation
                            steps={steps}
                            currentStepSlug={stepSlug}
                            onStepClick={handleStepClick}
                            maxVisitedStepIndex={maxVisitedStepIndex}
                            disabledSteps={disabledSteps}
                        />
                    )}
                </div>
                 <div className="flex items-center gap-2">
                     {currentStepIndex < steps.length - 1 && !isViewerRole && (
                        <Button onClick={nextStep} disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {steps[currentStepIndex + 1].name} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </header>
            
            <div className={cn("flex-grow overflow-y-auto", (currentStep === 'Builder' || currentStep === 'Preview' || currentStep === 'Finalize') ? "" : "p-6 flex justify-center items-start")}>
                {renderStep()}
            </div>

            <Sheet open={isQuestionTypeDialogOpen} onOpenChange={setQuestionTypeDialogOpen}>
                <SheetContent className="sm:max-w-3xl">
                    <SheetHeader>
                        <SheetTitle>Select a field type</SheetTitle>
                    </SheetHeader>
                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for a field type..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-6 py-4 max-h-[calc(100vh-150px)] overflow-y-auto pr-4">
                        {filteredCategories.map(category => (
                            <div key={category.name}>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category.name}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {category.fields.map((field) => (
                                        <button
                                            key={field.type}
                                            onClick={() => addQuestion(field.type)}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-center h-24",
                                                field.isHighlighted && "border-primary ring-1 ring-primary"
                                            )}
                                        >
                                            {field.isNew && (
                                                <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground px-1.5 py-0.5 text-xs h-auto">NEW</Badge>
                                            )}
                                            <field.icon className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-xs font-medium leading-tight">{field.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                         {filteredCategories.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No fields found for "{searchTerm}".</p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <AlertDialog open={!!requestToArchive} onOpenChange={(open) => !open && setRequestToArchive(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Archive Request?</AlertDialogTitle><AlertDialogDescription>This will move the request to the archive. You can restore it later.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!requestToForceDelete} onOpenChange={(open) => !open && setRequestToForceDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All data for this request will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleForceDelete}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

    
