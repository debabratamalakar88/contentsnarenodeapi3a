'use client'
import { useState } from "react";
import StepNavigation from './components/StepNavigation';
import TemplatesStep from './components/TemplatesStep';
import EssentialsStep from './components/EssentialsStep';
import BuilderStep from './components/BuilderStep';
import PreviewStep from './components/PreviewStep';
import FinalizeStep from './components/FinalizeStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Type, Pilcrow, CheckSquare, ChevronDown as ChevronDownIcon, ListOrdered, UploadCloud, CalendarDays, AtSign, Phone, Link2, Plus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


// Type definitions for the entire wizard
export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  label: string;
  type: QuestionType;
  instructions?: string;
  placeholder?: string;
  options?: QuestionOption[];
  required?: boolean;
  defaultValue?: string;
  apiId?: string;
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

const steps = ["Templates", "Essentials", "Builder", "Preview", "Finalize"];

const questionTypes: { type: QuestionType; label: string; icon: React.ElementType }[] = [
    { type: 'text', label: 'Single Line Text', icon: Type },
    { type: 'textarea', label: 'Multi-line Text', icon: Pilcrow },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'dropdown', label: 'Dropdown', icon: ChevronDownIcon },
    { type: 'radio', label: 'Radio Group', icon: ListOrdered },
    { type: 'file', label: 'File Upload', icon: UploadCloud },
    { type: 'date', label: 'Date', icon: CalendarDays },
    { type: 'email', label: 'Email', icon: AtSign },
    { type: 'tel', label: 'Phone Number', icon: Phone },
    { type: 'url', label: 'Website/URL', icon: Link2 },
];


export default function NewRequestPage() {
    const [currentStep, setCurrentStep] = useState(steps[0]);
    
    // State for the whole wizard
    const [requestTitle, setRequestTitle] = useState("New Request");
    const [requestDescription, setRequestDescription] = useState("Please provide all the necessary documents and information to get you set up in our system.");
    const [pages, setPages] = useState<Page[]>(initialPagesData);

    // Question Type Dialog State
    const [isQuestionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ pageId: number, sectionId: number } | null>(null);
    
    // Question Settings Dialog State
    const [isQuestionSettingsOpen, setQuestionSettingsOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Question | null>(null);

    const currentStepIndex = steps.indexOf(currentStep);

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStep(steps[currentStepIndex + 1]);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(steps[currentStepIndex - 1]);
        }
    };

    const addPage = () => {
        const newPageNumber = pages.length + 1;
        const newPage: Page = {
            id: Date.now(),
            title: `${newPageNumber}. New Page`,
            instructions: "",
            sections: [{
                id: Date.now() + 1,
                title: `${newPageNumber}.1 New Section`,
                instructions: '',
                questions: []
            }]
        };
        setPages(prev => [...prev, newPage]);
    };

    const addSection = (pageId: number) => {
        setPages(prevPages => prevPages.map(page => {
            if (page.id === pageId) {
                const pageNumber = page.title.split('.')[0];
                const newSectionNumber = page.sections.length + 1;
                const newSection: Section = {
                    id: Date.now(),
                    title: `${pageNumber}.${newSectionNumber} New Section`,
                    instructions: '',
                    questions: []
                };
                return { ...page, sections: [...page.sections, newSection] };
            }
            return page;
        }));
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
                             const baseLabel = `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`;
                            const newQuestion: Question = {
                                id: Date.now(),
                                type: type,
                                label: baseLabel,
                                instructions: "",
                                placeholder: "",
                                options: (type === 'radio' || type === 'dropdown') 
                                    ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] 
                                    : (type === 'checkbox' ? [{ label: 'Accept terms', value: 'accepted'}] : undefined),
                                required: false,
                                apiId: slugify(baseLabel),
                            };
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
            
            // Auto-slugify value from label if value is empty
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


    const renderStep = () => {
        switch (currentStep) {
            case "Templates": return <TemplatesStep onNext={nextStep} />;
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep 
                                        pages={pages} 
                                        setPages={setPages}
                                        addPage={addPage}
                                        addSection={addSection}
                                        onAddFieldClick={handleAddFieldClick}
                                        updatePageTitle={updatePageTitle}
                                        updateSectionTitle={updateSectionTitle}
                                        openQuestionSettings={openQuestionSettings}
                                        duplicateQuestion={duplicateQuestion}
                                        deleteQuestion={deleteQuestion}
                                    />;
            case "Preview": return <PreviewStep title={requestTitle} description={requestDescription} pages={pages} />;
            case "Finalize": return <FinalizeStep />;
            default: return <div>Not Found</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center gap-4 p-4 border-b">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="/dashboard/requests"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <StepNavigation currentStep={currentStep} onStepClick={setCurrentStep} />
                <div className="ml-auto flex items-center gap-2">
                     {currentStepIndex > 0 && currentStepIndex < steps.length - 2 && (
                        <Button onClick={nextStep}>
                            {steps[currentStepIndex + 1]} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                     {currentStepIndex === steps.length - 2 && (
                        <Button onClick={nextStep} className="bg-accent text-accent-foreground hover:bg-accent/90">
                           {steps[currentStepIndex + 1]} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className={cn("flex-grow", currentStep !== 'Builder' && "p-6 flex justify-center items-center")}>
                {renderStep()}
            </div>

            <Dialog open={isQuestionTypeDialogOpen} onOpenChange={setQuestionTypeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choose a Field Type</DialogTitle>
                        <DialogDescription>Select the type of field you want to add to your request.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                        {questionTypes.map((qType) => (
                            <button
                                key={qType.type}
                                onClick={() => addQuestion(qType.type)}
                                className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-center"
                            >
                                <qType.icon className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm font-medium">{qType.label}</span>
                            </button>
                        ))}
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
                                <Label htmlFor="required" className="font-normal">Required</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea id="instructions" value={tempQuestion.instructions} onChange={(e) => handleTempQuestionChange('instructions', e.target.value)} placeholder="Optional: Guide users on how to fill this field" />
                            </div>
                            {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'date') && (
                                <div className="grid gap-2">
                                    <Label htmlFor="placeholder">Placeholder</Label>
                                    <Input id="placeholder" value={tempQuestion.placeholder} onChange={(e) => handleTempQuestionChange('placeholder', e.target.value)} />
                                </div>
                            )}
                            {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'date' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'radio' ) && (
                                <div className="grid gap-2">
                                    <Label htmlFor="defaultValue">Default Value</Label>
                                    <Input id="defaultValue" value={tempQuestion.defaultValue} onChange={(e) => handleTempQuestionChange('defaultValue', e.target.value)} />
                                </div>
                            )}
                            
                            {(tempQuestion.type === 'dropdown' || tempQuestion.type === 'radio') && (
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

                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="advanced">
                                    <AccordionTrigger className="text-sm">Advanced Settings</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="apiId">API Identifier</Label>
                                            <Input id="apiId" value={tempQuestion.apiId} onChange={(e) => handleTempQuestionChange('apiId', e.target.value)} />
                                            <p className="text-xs text-muted-foreground">Used as the `name` attribute in the form. Must be unique.</p>
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
