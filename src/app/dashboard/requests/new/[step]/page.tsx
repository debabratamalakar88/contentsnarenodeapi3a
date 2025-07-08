

'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import StepNavigation from '../components/StepNavigation';
import TemplatesStep from '../components/TemplatesStep';
import EssentialsStep from '../components/EssentialsStep';
import BuilderStep from '../components/BuilderStep';
import PreviewStep from '../components/PreviewStep';
import FinalizeStep from '../components/FinalizeStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Type, Pilcrow, CheckSquare, ChevronDown as ChevronDownIcon, ListOrdered, UploadCloud, CalendarDays, AtSign, Phone, Link2, Plus, X, Loader2, Search, PenSquare, ImageUp, FileUp, Mail, MapPin, Hash, DollarSign, Globe, CalendarClock, CalendarRange, CircleDot, MenuSquare, GalleryVertical, Table, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick, Link2Off, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, AlignJustify, Smile, Code } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { createRequest, updateRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";
import { IconSelector } from "@/components/ui/icon-selector";


// Type definitions for the entire wizard
export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio' | 'formatted-text' | 'image-upload' | 'address' | 'number' | 'currency' | 'country' | 'date-range' | 'icon-selector' | 'color-picker' | 'button';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  label:string;
  type: QuestionType;
  instructions?: string;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
  defaultValue?: string;
  apiId?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonType?: 'button' | 'submit';
}
export interface Section {
  id: number;
  title: string;
  instructions?: string;
  questions: Question[];
}
export interface Page {
  id: number;
  title: string;
  instructions?: string;
  sections: Section[];
}

const initialPagesData: Page[] = [
  {
    id: 1,
    title: "1. New Page",
    instructions: "",
    sections: [
        {
            id: 101,
            title: "1.1 New Section",
            instructions: "",
            questions: [
                { 
                    id: 1001, 
                    label: "New Single Line Text Field", 
                    type: 'text', 
                    instructions: "Enter field instructions here...", 
                    placeholder: "", 
                    options: [], 
                    required: false,
                    apiId: "new_single_line_text_field" 
                },
            ]
        }
    ]
  },
];

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


export default function NewRequestWizardPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const stepSlug = Array.isArray(params.step) ? params.step[0] : (params.step || 'templates');

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.slug === stepSlug);
        return index === -1 ? 0 : index;
    }, [stepSlug]);
    const currentStep = steps[currentStepIndex].name;
    
    // State for the whole wizard
    const [requestTitle, setRequestTitle] = useState("New Request");
    const [requestDescription, setRequestDescription] = useState("Please provide all the necessary documents and information to get you set up in our system.");
    const [pages, setPages] = useState<Page[]>(initialPagesData);
    const [activePageId, setActivePageId] = useState<number | null>(initialPagesData[0]?.id || null);
    const [requestId, setRequestId] = useState<number | null>(null);
    const [startedFromScratch, setStartedFromScratch] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State to track wizard progress
    const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(currentStepIndex);

    // Question Type Dialog State
    const [isQuestionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ pageId: number, sectionId: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Question Settings Dialog State
    const [isQuestionSettingsOpen, setQuestionSettingsOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Question | null>(null);


    useEffect(() => {
        if (currentStepIndex > maxVisitedStepIndex) {
            setMaxVisitedStepIndex(currentStepIndex);
        }
    }, [currentStepIndex, maxVisitedStepIndex]);

    const handleProceedFromTemplates = (isFromScratch: boolean) => {
        setStartedFromScratch(isFromScratch);
        if (maxVisitedStepIndex < 1) {
            setMaxVisitedStepIndex(1);
        }
        router.push('/dashboard/requests/new/essentials');
    };

    const nextStep = async () => {
        if (currentStepIndex >= steps.length - 1) return;

        // Save logic for Essentials step and beyond
        if (currentStepIndex >= 1) {
             if (currentStepIndex === 1 && !requestTitle.trim()) {
                toast({
                    title: "Request Title Required",
                    description: "Please provide a title for your request.",
                    variant: "destructive",
                });
                return;
            }

            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }
            
            try {
                const payload = {
                    title: requestTitle,
                    description: requestDescription,
                    form_data: pages,
                    status: 'draft' as const,
                    started_from_scratch: startedFromScratch,
                };

                if (requestId) {
                    await updateRequest(token, requestId, payload);
                    toast({ title: "Request draft updated" });
                    const nextStepSlug = steps[currentStepIndex + 1].slug;
                    router.push(`/dashboard/requests/new/${nextStepSlug}`);
                } else {
                    const newRequest = await createRequest(token, payload);
                    setRequestId(newRequest.id);
                    toast({ title: "Request draft created" });
                    router.push(`/dashboard/requests/edit/${newRequest.id}/builder`);
                    return;
                }

            } catch (error: any) {
                const description = error.errors
                    ? Object.values(error.errors).flat().join("\n")
                    : error.message || "An unexpected error occurred.";
                toast({
                    title: "Save Failed",
                    description,
                    variant: "destructive",
                });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // For Templates step, navigation is handled by onProceed
        }
    };
    
    const handleBack = () => {
        if (currentStepIndex > 0) {
            const prevStepSlug = steps[currentStepIndex - 1].slug;
            router.push(`/dashboard/requests/new/${prevStepSlug}`);
        } else {
            router.push('/dashboard/requests');
        }
    };

    const handleStepClick = (slug: string) => {
        const targetIndex = steps.findIndex(s => s.slug === slug);
        if (targetIndex <= maxVisitedStepIndex) {
            router.push(`/dashboard/requests/new/${slug}`);
        }
    };

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
        const newPage: Page = {
            id: newPageId,
            title: `New Page`,
            instructions: "",
            sections: [{
                id: Date.now() + 1,
                title: `New Section`,
                instructions: '',
                questions: []
            }]
        };
        const newPages = renumberItems([...pages, newPage]);
        setPages(newPages);
        setActivePageId(newPageId);
    };

    const deletePage = (pageId: number) => {
        setPages(prevPages => {
            if (prevPages.length <= 1) {
                toast({
                    title: "Action Forbidden",
                    description: "You cannot delete the only page in a request.",
                    variant: "destructive"
                });
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
                    const newSection: Section = {
                        id: Date.now(),
                        title: `New Section`,
                        instructions: '',
                        questions: []
                    };
                    return { ...page, sections: [...page.sections, newSection] };
                }
                return page;
            })
            return renumberItems(newPages);
        });
    };

    const updatePageTitle = (pageId: number, newTitle: string) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.id === pageId) {
                return { ...page, title: newTitle };
            }
            return page;
        }));
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
        
        setPages(prevPages => prevPages.map(page => {
            if (page.id === pageId) {
                return {
                    ...page,
                    sections: page.sections.map(section => {
                        if (section.id === sectionId) {
                            const fieldConfig = questionCategories.flatMap(c => c.fields).find(f => f.type === type) || { label: 'New Field' };
                            const baseLabel = fieldConfig.label;
                            const newQuestion: Question = {
                                id: Date.now(),
                                type: type,
                                label: baseLabel,
                                instructions: "",
                                placeholder: "",
                                options: (type === 'radio' || type === 'dropdown' || type === 'checkbox') 
                                    ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] 
                                    : undefined,
                                required: false,
                                apiId: slugify(`${baseLabel}_${Date.now()}`),
                            };
                            if (type === 'button') {
                                newQuestion.buttonVariant = 'default';
                                newQuestion.buttonType = 'button';
                            }
                            return { ...section, questions: [...section.questions, newQuestion] };
                        }
                        return section;
                    })
                };
            }
            return page;
        }));
        
        setQuestionTypeDialogOpen(false);
        setCurrentLocation(null);
    };

    const openQuestionSettings = (question: Question) => {
        setEditingQuestion(question);
        setTempQuestion(JSON.parse(JSON.stringify(question))); // Deep copy
        setQuestionSettingsOpen(true);
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
        setQuestionSettingsOpen(false);
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
                        const duplicatedQuestion: Question = {
                            ...originalQuestion,
                            id: Date.now(),
                            label: `${originalQuestion.label} (Copy)`,
                            apiId: slugify(`${originalQuestion.label} (Copy) ${Date.now()}`),
                        };
                        section.questions.splice(questionIndex + 1, 0, duplicatedQuestion);
                    }
                }
            }
            return newPages;
        });
    };

    const deleteQuestion = (pageId: number, sectionId: number, questionId: number) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.id === pageId) {
                return {
                    ...page,
                    sections: page.sections.map(section => {
                        if (section.id === sectionId) {
                            return { ...section, questions: section.questions.filter(q => q.id !== questionId) };
                        }
                        return section;
                    })
                };
            }
            return page;
        }));
    };

    const handleTempQuestionChange = (field: keyof Question, value: any) => {
        if (tempQuestion) {
            const newTempQuestion = { ...tempQuestion, [field]: value };
            if(field === 'label') {
                newTempQuestion.apiId = slugify(value);
            }
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


    const renderStep = () => {
        switch (currentStep) {
            case "Templates": return <TemplatesStep onProceed={handleProceedFromTemplates} />;
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep 
                                        requestTitle={requestTitle}
                                        pages={pages}
                                        addPage={addPage}
                                        addSection={addSection}
                                        onAddFieldClick={handleAddFieldClick}
                                        updatePageTitle={updatePageTitle}
                                        updateSectionTitle={updateSectionTitle}
                                        openQuestionSettings={openQuestionSettings}
                                        duplicateQuestion={duplicateQuestion}
                                        deleteQuestion={deleteQuestion}
                                        activePageId={activePageId}
                                        setActivePageId={setActivePageId}
                                        duplicatePage={duplicatePage}
                                        deletePage={deletePage}
                                    />;
            case "Preview": return <PreviewStep title={requestTitle} description={requestDescription} pages={pages} />;
            case "Finalize": return <FinalizeStep />;
            default: return <div>Not Found</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center gap-4 p-4 border-b">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <StepNavigation
                    steps={steps}
                    currentStepSlug={stepSlug}
                    onStepClick={handleStepClick}
                    maxVisitedStepIndex={maxVisitedStepIndex}
                />
                <div className="ml-auto flex items-center gap-2">
                    {currentStepIndex < steps.length - 1 && (
                        <Button onClick={nextStep} disabled={isSubmitting || (currentStepIndex === 0)}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {currentStep === 'Essentials' ? 'Save & Continue' : (
                                <>
                                    {steps[currentStepIndex + 1].name} <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
            
            <div className={cn("flex-grow", (currentStep === 'Builder' || currentStep === 'Templates' || currentStep === 'Preview') ? "" : "p-6 flex justify-center items-start")}>
                {renderStep()}
            </div>

            <Dialog open={isQuestionTypeDialogOpen} onOpenChange={setQuestionTypeDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Select a field type</DialogTitle>
                    </DialogHeader>
                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for a field type..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
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
                </DialogContent>
            </Dialog>

            <Dialog open={isQuestionSettingsOpen} onOpenChange={setQuestionSettingsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Field Settings</DialogTitle>
                        <DialogDescription>
                            Make changes to your field here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    {tempQuestion && (
                        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="grid gap-2">
                                <Label htmlFor="label">Label</Label>
                                <Input id="label" value={tempQuestion.label} onChange={(e) => handleTempQuestionChange('label', e.target.value)} />
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="required" 
                                    checked={tempQuestion.required} 
                                    onCheckedChange={(checked) => handleTempQuestionChange('required', !!checked)}
                                />
                                <Label htmlFor="required">Required</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea id="instructions" value={tempQuestion.instructions || ''} onChange={(e) => handleTempQuestionChange('instructions', e.target.value)} placeholder="Optional: Guide users on how to fill this field" />
                            </div>
                            {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'date') && (
                                <div className="grid gap-2">
                                    <Label htmlFor="placeholder">Placeholder</Label>
                                    <Input id="placeholder" value={tempQuestion.placeholder || ''} onChange={(e) => handleTempQuestionChange('placeholder', e.target.value)} />
                                </div>
                            )}
                            {tempQuestion.type === 'formatted-text' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea 
                                        id="content" 
                                        value={tempQuestion.defaultValue || ''} 
                                        onChange={(e) => handleTempQuestionChange('defaultValue', e.target.value)} 
                                        placeholder="Enter your formatted text content here. You can use basic HTML for styling."
                                        className="min-h-[120px]"
                                    />
                                </div>
                            )}
                            {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'date' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'radio' ) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="defaultValue">Default Value</Label>
                                    <Input id="defaultValue" value={tempQuestion.defaultValue || ''} onChange={(e) => handleTempQuestionChange('defaultValue', e.target.value)} />
                                </div>
                            )}
                            
                            {(tempQuestion.type === 'dropdown' || tempQuestion.type === 'radio' || tempQuestion.type === 'checkbox') && (
                                <div className="grid gap-4">
                                    <Label>Options</Label>
                                    <div className="space-y-3">
                                        {tempQuestion.options?.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="grid gap-1.5 flex-1">
                                                    <Label htmlFor={`option-label-${index}`} className="text-xs">Label</Label>
                                                    <Input id={`option-label-${index}`} value={option.label} onChange={(e) => handleTempOptionChange(index, 'label', e.target.value)} />
                                                </div>
                                                <div className="grid gap-1.5 flex-1">
                                                    <Label htmlFor={`option-value-${index}`} className="text-xs">Value</Label>
                                                    <Input id={`option-value-${index}`} value={option.value} onChange={(e) => handleTempOptionChange(index, 'value', e.target.value)} />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeTempOption(index)} className="self-end">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addTempOption} className="mt-2">
                                        <Plus className="h-4 w-4 mr-2" /> Add Option
                                    </Button>
                                </div>
                            )}
                            {tempQuestion.type === 'button' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="buttonVariant">Button Style</Label>
                                        <Select
                                            value={tempQuestion.buttonVariant || 'default'}
                                            onValueChange={(value) => handleTempQuestionChange('buttonVariant', value as Question['buttonVariant'])}
                                        >
                                            <SelectTrigger id="buttonVariant">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Default</SelectItem>
                                                <SelectItem value="destructive">Destructive</SelectItem>
                                                <SelectItem value="outline">Outline</SelectItem>
                                                <SelectItem value="secondary">Secondary</SelectItem>
                                                <SelectItem value="ghost">Ghost</SelectItem>
                                                <SelectItem value="link">Link</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="buttonType">Button Type</Label>
                                        <Select
                                            value={tempQuestion.buttonType || 'button'}
                                            onValueChange={(value) => handleTempQuestionChange('buttonType', value as Question['buttonType'])}
                                        >
                                            <SelectTrigger id="buttonType">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="button">Button</SelectItem>
                                                <SelectItem value="submit">Submit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="advanced">
                                    <AccordionTrigger className="text-sm">Advanced Settings</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="apiId">API Identifier</Label>
                                            <Input id="apiId" value={tempQuestion.apiId || ''} onChange={(e) => handleTempQuestionChange('apiId', e.target.value)} />
                                            <p className="text-xs text-muted-foreground">Used as the 'name' attribute in the form. Must be unique.</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setQuestionSettingsOpen(false)}>Cancel</Button>
                        <Button onClick={updateQuestion}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
