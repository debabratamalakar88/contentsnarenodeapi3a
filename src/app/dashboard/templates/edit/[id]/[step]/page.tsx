

'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import StepNavigation from '@/app/dashboard/templates/new/components/StepNavigation';
import EssentialsStep from '@/app/dashboard/requests/new/components/EssentialsStep';
import BuilderStep from '@/app/dashboard/templates/new/components/BuilderStep';
import PreviewStep from '@/app/dashboard/requests/new/components/PreviewStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Type, Pilcrow, CheckSquare, ChevronDown as ChevronDownIcon, ListOrdered, UploadCloud, CalendarDays, AtSign, Phone, Link2, Plus, X, Loader2, Search, PenSquare, ImageUp, FileUp, Mail, MapPin, Hash, DollarSign, Globe, CalendarClock, CalendarRange, CircleDot, MenuSquare, GalleryVertical, Table, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick, MoreHorizontal, Settings, GripVertical, Folder, ChevronDown, Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getMyTemplate, updateMyTemplate, type Page, type Section, type Question, type QuestionOption, type QuestionType, MyTemplate, getAdminTemplate, updateAdminTemplate, Template, getAdminTemplateCategories, TemplateCategory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";
import { IconSelector } from "@/components/ui/icon-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";


const steps = [
    { name: "Essentials", slug: "essentials" },
    { name: "Builder", slug: "builder" },
    { name: "Preview", slug: "preview" }
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


export default function EditMyTemplateWizardPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);
    const stepSlug = Array.isArray(params.step) ? params.step[0] : (params.step || 'essentials');

    const currentStepIndex = useMemo(() => {
        const index = steps.findIndex(s => s.slug === stepSlug);
        return index === -1 ? 0 : index;
    }, [stepSlug]);
    const currentStep = steps[currentStepIndex].name;
    
    // State for the whole wizard
    const [templateTitle, setTemplateTitle] = useState("");
    const [templateDescription, setTemplateDescription] = useState("");
    const [pages, setPages] = useState<Page[]>([]);
    const [activePageId, setActivePageId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialTemplateData, setInitialTemplateData] = useState<MyTemplate | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Question Type Dialog State
    const [isQuestionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ pageId: number, sectionId: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Question Settings Dialog State
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Question | null>(null);
    
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
        
        const token = localStorage.getItem('authToken');
        const myTemplateId = id;
        if (!token || !myTemplateId) {
            toast({ title: "Error", description: "Invalid template or not logged in.", variant: "destructive" });
            router.push('/dashboard/templates');
            return;
        }

        async function fetchTemplateData() {
            try {
                const data = await getMyTemplate(token, myTemplateId);
                setTemplateTitle(data.title);
                setTemplateDescription(data.description || "");
                setPages(data.form_data || []);
                setInitialTemplateData(data);

                if (data.form_data?.length > 0) {
                    setActivePageId(data.form_data[0].id);
                }
            } catch (error: any) {
                toast({ title: "Failed to load template", description: error.message || "Could not fetch template data.", variant: "destructive" });
                router.push('/dashboard/templates');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTemplateData();
    }, [id, router, toast]);

    const saveProgress = async () => {
        setIsSubmitting(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
            setIsSubmitting(false);
            return false;
        }
        
        try {
            const payload: Partial<MyTemplate> = {
                title: templateTitle,
                description: templateDescription,
                form_data: pages,
            };

            await updateMyTemplate(token, id, payload);
            toast({ title: "Template saved" });
            return true;
        } catch (error: any) {
            const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "An unexpected error occurred.";
            toast({ title: "Save Failed", description, variant: "destructive" });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const nextStep = async () => {
        if (currentStepIndex >= steps.length - 1) return;

        if (currentStepIndex === 0 && !templateTitle.trim()) {
            toast({ title: "Template Title Required", description: "Please provide a title for your template.", variant: "destructive" });
            return;
        }

        const saved = await saveProgress();
        if (saved) {
            const nextStepSlug = steps[currentStepIndex + 1].slug;
            router.push(`/dashboard/templates/edit/${id}/${nextStepSlug}`);
        }
    };

    const handleSaveAndClose = async () => {
       if (!templateTitle.trim()) {
           toast({ title: "Template Title Required", description: "Please provide a title for your template.", variant: "destructive" });
           return;
       }

       const saved = await saveProgress();
       if (saved) {
           router.push('/dashboard/templates');
           router.refresh();
       }
   };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            const prevStepSlug = steps[currentStepIndex - 1].slug;
            router.push(`/dashboard/templates/edit/${id}/${prevStepSlug}`);
        } else {
            router.push('/dashboard/templates');
        }
    };

    const handleStepClick = (slug: string) => {
        router.push(`/dashboard/templates/edit/${id}/${slug}`);
    };

    const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const renumberItems = (pagesToRenumber: Page[]): Page[] => {
      return pagesToRenumber.map((page, pageIndex) => {
          const newPageNumber = pageIndex + 1;
          const pageTitleText = page.title.replace(/^[0-9\.]+\s*/, '');
          const renumberedSections = page.sections.map((section, sectionIndex) => {
              const newSectionNumber = sectionIndex + 1;
              const sectionTitleText = section.title.replace(/^[0-9\.]+\s*/, '');
              return { ...section, title: `${newPageNumber}.${newSectionNumber} ${sectionTitleText}` };
          });
          return { ...page, title: `${newPageNumber}. ${pageTitleText}`, sections: renumberedSections };
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
        const newPage: Page = { id: newPageId, title: `New Page`, instructions: "", sections: [{ id: Date.now() + 1, title: `New Section`, instructions: '', questions: [newQuestion] }]};
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

    const updatePageTitle = (pageId: number, newTitle: string) => setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, title: newTitle } : page));
    const updateSectionTitle = (pageId: number, sectionId: number, newTitle: string) => setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, sections: page.sections.map(section => section.id === sectionId ? { ...section, title: newTitle } : section) } : page));

    const handleAddFieldClick = (pageId: number, sectionId: number) => {
        setCurrentLocation({ pageId, sectionId });
        setSearchTerm("");
        setQuestionTypeDialogOpen(true);
    };

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
                if (type === 'button') { newQuestion.buttonVariant = 'default'; newQuestion.buttonType = 'button'; }
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
        setPages(prevPages => prevPages.map(page => ({ ...page, sections: page.sections.map(section => ({ ...section, questions: section.questions.map(q => q.id === tempQuestion.id ? tempQuestion : q) })) })));
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
            if(field === 'label' && (!newOptions[index].value || slugify(newOptions[index].value) === slugify(tempQuestion.options[index].label))) newOptions[index].value = slugify(value);
            setTempQuestion({ ...tempQuestion, options: newOptions });
        }
    };

    const addTempOption = () => {
        if (tempQuestion) {
            const nextOptionNum = (tempQuestion.options?.length || 0) + 1;
            const newOption: QuestionOption = { label: `Option ${nextOptionNum}`, value: `option_${nextOptionNum}` };
            setTempQuestion({ ...tempQuestion, options: [...(tempQuestion.options || []), newOption] });
        }
    };

    const removeTempOption = (index: number) => {
        if (tempQuestion && tempQuestion.options) setTempQuestion({ ...tempQuestion, options: tempQuestion.options.filter((_, i) => i !== index) });
    };

    const filteredCategories = questionCategories.map(category => ({
        ...category,
        fields: category.fields.filter(field =>
            field.label.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter(category => category.fields.length > 0);


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
            case "Essentials": 
                return (
                    <EssentialsStep 
                        title={templateTitle} 
                        setTitle={setTemplateTitle} 
                        description={templateDescription} 
                        setDescription={setTemplateDescription}
                    />
                );
            case "Builder": return <BuilderStep
                                        requestTitle={templateTitle}
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
            case "Preview": return <PreviewStep title={templateTitle} description={templateDescription} pages={pages} />;
            default: return <div>Step not found. Please navigate using the steps above.</div>;
        }
    };

    const isLastStep = currentStepIndex === steps.length - 1;

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-16 z-20 flex items-center gap-4 p-4 border-b bg-background/95 backdrop-blur">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <StepNavigation
                    steps={steps}
                    currentStepSlug={stepSlug}
                    onStepClick={handleStepClick}
                    maxVisitedStepIndex={steps.length}
                />
                <div className="ml-auto flex items-center gap-2">
                    {isLastStep ? (
                        <Button onClick={handleSaveAndClose} disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           Save & Close
                        </Button>
                    ) : (
                        <Button onClick={nextStep} disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {steps[currentStepIndex + 1].name} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </header>
            
            <div className={cn("flex-grow overflow-y-auto", (currentStep === 'Builder' || currentStep === 'Preview') ? "" : "p-6 flex justify-center items-start")}>
                {renderStep()}
            </div>

            <Sheet open={isQuestionTypeDialogOpen} onOpenChange={setQuestionTypeDialogOpen}>
                <SheetContent className="sm:max-w-3xl">
                    <SheetHeader>
                        <SheetTitle>Select a field type</SheetTitle>
                    </SheetHeader>
                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search for a field type..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                            className={cn("relative flex flex-col items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-center h-24", field.isHighlighted && "border-primary ring-1 ring-primary")}
                                        >
                                            {field.isNew && <Badge className="absolute top-1 right-1 bg-primary text-primary-foreground px-1.5 py-0.5 text-xs h-auto">NEW</Badge>}
                                            <field.icon className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-xs font-medium leading-tight">{field.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                         {filteredCategories.length === 0 && <p className="text-center text-muted-foreground py-8">No fields found for "{searchTerm}".</p>}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

