
'use client'
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import StepNavigation from '../../../new/components/StepNavigation';
import EssentialsStep from '../../../new/components/EssentialsStep';
import BuilderStep from '../../../new/components/BuilderStep';
import FinalizeStep from '../../../new/components/FinalizeStep';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Type, Pilcrow, CheckSquare, ChevronDown as ChevronDownIcon, ListOrdered, UploadCloud, CalendarDays, AtSign, Phone, Link2, Plus, X, Loader2, Search, PenSquare, ImageUp, FileUp, Mail, MapPin, Hash, DollarSign, Globe, CalendarClock, CalendarRange, CircleDot, MenuSquare, GalleryVertical, Table, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick, Link2Off, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, AlignJustify, Smile, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { getRequest, updateRequest } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";


// Type definitions for the entire wizard
export type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio' | 'formatted-text' | 'image-upload' | 'address' | 'number' | 'currency' | 'country' | 'date-range' | 'image-choice' | 'table' | 'signature' | 'task-list' | 'identity-verification' | 'abn-acn' | 'icon-selector' | 'color-picker' | 'button';

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
            { type: 'image-choice', label: 'Image Choice', icon: GalleryVertical },
        ],
    },
    {
        name: "Special Fields",
        fields: [
            { type: 'table', label: 'Table', icon: Table },
            { type: 'signature', label: 'Signature', icon: PenTool },
            { type: 'task-list', label: 'Task List', icon: ListChecks },
            { type: 'identity-verification', label: 'Identity Verification', icon: BadgeCheck },
            { type: 'abn-acn', label: 'Australian ABN/ACN', icon: Briefcase, isNew: true, isHighlighted: true },
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

interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const RichTextEditorPreview = ({ question }: { question: Question }) => {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = React.useState(0);
    
    const [isBold, setIsBold] = React.useState(false);
    const [isItalic, setIsItalic] = React.useState(false);
    const [isUnderline, setIsUnderline] = React.useState(false);
    const [isUl, setIsUl] = React.useState(false);
    const [isOl, setIsOl] = React.useState(false);
    const [isLeftAligned, setIsLeftAligned] = React.useState(true);
    const [isCenterAligned, setIsCenterAligned] = React.useState(false);
    const [isRightAligned, setIsRightAligned] = React.useState(false);
    const [isJustifyAligned, setIsJustifyAligned] = React.useState(false);
    
    const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
    const [savedRange, setSavedRange] = React.useState<Range | null>(null);

    const updateToolbarState = React.useCallback(() => {
        if (editorRef.current) {
            setIsBold(document.queryCommandState('bold'));
            setIsItalic(document.queryCommandState('italic'));
            setIsUnderline(document.queryCommandState('underline'));
            setIsUl(document.queryCommandState('insertUnorderedList'));
            setIsOl(document.queryCommandState('insertOrderedList'));
            
            const center = document.queryCommandState('justifyCenter');
            const right = document.queryCommandState('justifyRight');
            const justify = document.queryCommandState('justifyFull');
            
            setIsCenterAligned(center);
            setIsRightAligned(right);
            setIsJustifyAligned(justify);
            setIsLeftAligned(!center && !right && !justify);
        }
    }, []);

    const updateContent = React.useCallback(() => {
        if (editorRef.current) {
            const textContent = editorRef.current.innerText || "";
            const words = textContent.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
        }
    }, []);

    const execCmd = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            updateContent();
            updateToolbarState();
        }
    };

    const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
        e.preventDefault();
        execCmd(command);
    };

    const handleLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
        }

        const url = window.prompt("Enter the URL:", "https://");

        if (url) {
            editorRef.current?.focus();
            if(savedRange) {
                const currentSelection = window.getSelection();
                if (currentSelection) {
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(savedRange);
                }
            }
            document.execCommand('createLink', false, url);
            setSavedRange(null);
            updateToolbarState();
            updateContent();
        }
    };
    
    const handleEmojiButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
        } else if (editorRef.current) {
            editorRef.current.focus();
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            setSavedRange(range);
        }
    };

    const onEmojiClick = (emojiObject: { emoji: string }) => {
        if (editorRef.current) {
            editorRef.current.focus();
            if (savedRange) {
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(savedRange);
                }
            }
            document.execCommand('insertText', false, emojiObject.emoji);
            setEmojiPickerOpen(false);
            updateContent();
            setSavedRange(null);
        }
    };

    const handleHeadingChange = (value: string) => {
        execCmd('formatBlock', value);
    };

    React.useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
          editor.innerHTML = question.defaultValue || '';
        }
        updateContent();
    }, [question.defaultValue, updateContent]);


    React.useEffect(() => {
        const editor = editorRef.current;
        const handleSelectionChange = () => {
            if (document.activeElement === editor) {
                updateToolbarState();
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        if (editor) {
            editor.addEventListener('focus', updateToolbarState);
        }

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            if (editor) {
                editor.removeEventListener('focus', updateToolbarState);
            }
        };
    }, [updateToolbarState]);

    const handleInput = () => {
        updateContent();
        updateToolbarState();
    }
    
    const isPlaceholderVisible = !editorRef.current?.textContent;
  
    return (
      <div className="rounded-md border border-input bg-background">
        <div className="p-2 border-b flex items-center gap-1 text-muted-foreground flex-wrap">
          <Select onValueChange={handleHeadingChange} defaultValue="p">
              <SelectTrigger className="w-[120px] h-8 text-sm focus:ring-0 focus:ring-offset-0 border-none shadow-none">
                  <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="p">Normal</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={isBold ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></Button>
          <Button variant={isItalic ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'italic')}><Italic className="h-4 w-4" /></Button>
          <Button variant={isUnderline ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'underline')}><Underline className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={isUl ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}><List className="h-4 w-4" /></Button>
          <Button variant={isOl ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={isLeftAligned ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
          <Button variant={isCenterAligned ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
          <Button variant={isRightAligned ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyRight')}><AlignRight className="h-4 w-4" /></Button>
          <Button variant={isJustifyAligned ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyFull')}><AlignJustify className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleLink}><LinkIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'unlink')}><Link2Off className="h-4 w-4" /></Button>
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleEmojiButtonMouseDown} onClick={() => setEmojiPickerOpen(o => !o)}>
                      <Smile className="h-4 w-4" />
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
              </PopoverContent>
          </Popover>
        </div>
        <div className="relative">
             {isPlaceholderVisible && (
                 <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">Enter text here...</div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="prose-preview min-h-[200px] w-full resize-y overflow-auto p-3 ring-offset-background focus-visible:outline-none"
              onInput={handleInput}
            />
        </div>
        <div className="p-2 border-t text-xs text-muted-foreground flex justify-end items-center">
            <span>Words: {wordCount}</span>
        </div>
        <textarea name={question.apiId} value={editorRef.current?.innerHTML || ''} className="hidden" readOnly />
      </div>
    );
};

const renderQuestionInput = (question: Question) => {
    switch(question.type) {
        case 'text':
            return <Input type="text" id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />
        case 'textarea':
            return <Textarea id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />
        case 'file':
            return <Input id={`preview-${question.id}`} type="file" name={question.apiId} />
        case 'checkbox':
            return (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id={`preview-${question.id}`} name={question.apiId} value={question.options?.[0].value} />
                    <label
                        htmlFor={`preview-${question.id}`}
                        className="text-sm font-medium leading-none"
                    >
                        {question.options?.[0].label || 'Sample option'}
                    </label>
                </div>
            )
        case 'dropdown':
            return (
                <Select name={question.apiId}>
                    <SelectTrigger id={`preview-${question.id}`}>
                        <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                        {question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        case 'date':
            return (
                <div className="relative">
                    <Input type="date" id={`preview-${question.id}`} className="block w-full max-w-[240px]" name={question.apiId} defaultValue={question.defaultValue}/>
                </div>
            )
        case 'email':
            return <Input type="email" id={`preview-${question.id}`} placeholder={question.placeholder || "email@example.com"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'tel':
            return <Input type="tel" id={`preview-${question.id}`} placeholder={question.placeholder || "(123) 456-7890"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'url':
            return <Input type="url" id={`preview-${question.id}`} placeholder={question.placeholder || "https://example.com"} defaultValue={question.defaultValue} name={question.apiId}/>
        case 'radio':
            return (
                <RadioGroup name={question.apiId} defaultValue={question.defaultValue}>
                {question.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 pt-2">
                        <RadioGroupItem value={opt.value} id={`preview-${question.id}-${i}`} />
                        <label
                            htmlFor={`preview-${question.id}-${i}`}
                            className="text-sm font-medium leading-none"
                        >
                            {opt.label}
                        </label>
                    </div>
                ))}
                </RadioGroup>
            )
        case 'formatted-text':
             return <RichTextEditorPreview question={question} />;
        case 'image-upload':
             return <Input id={`preview-${question.id}`} type="file" name={question.apiId} accept="image/*" multiple />;
        case 'address':
             return <Textarea id={`preview-${question.id}`} placeholder="123 Main St, Anytown, USA" name={question.apiId} />;
        case 'number':
             return <Input type="number" id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />;
        case 'currency':
             return (
                 <div className="relative max-w-[240px]">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                     <Input type="number" id={`preview-${question.id}`} placeholder="100.00" name={question.apiId} className="pl-7" />
                 </div>
             );
        case 'country':
             return <Input type="text" id={`preview-${question.id}`} placeholder="United States" name={question.apiId} />;
        case 'date-range':
             return (
                 <div className="flex items-center gap-2">
                     <Input type="date" id={`preview-${question.id}-start`} name={`${question.apiId}_start`} />
                     <span>to</span>
                     <Input type="date" id={`preview-${question.id}-end`} name={`${question.apiId}_end`} />
                 </div>
             );
        case 'image-choice':
            return (
                <div className="flex gap-4 flex-wrap">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 border p-2 rounded-md">
                            <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">Image</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={opt.value} id={`preview-${question.id}-${i}`} />
                                <label htmlFor={`preview-${question.id}-${i}`} className="text-sm font-medium">{opt.label}</label>
                            </div>
                        </div>
                    ))}
                </div>
            );
        case 'table':
             return <p className="p-3 border rounded-md bg-muted text-sm text-muted-foreground italic">[Table Preview]</p>;
        case 'signature':
             return <div className="w-full h-24 border-dashed border-2 rounded-md flex items-center justify-center text-muted-foreground">Signature Area</div>;
        case 'task-list':
            return (
                <div className="space-y-2">
                {(question.options || [{label: 'Sample Task', value: 'task1'}]).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Checkbox id={`preview-${question.id}-${i}`} />
                        <label htmlFor={`preview-${question.id}-${i}`}>{opt.label}</label>
                    </div>
                ))}
                </div>
            );
        case 'identity-verification':
            return <Button variant="outline">Verify Identity</Button>;
        case 'abn-acn':
            return <Input type="text" id={`preview-${question.id}`} placeholder="Enter ABN/ACN" name={question.apiId} />;
        case 'icon-selector':
            return (
                <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Select an Icon
                </Button>
            );
        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <Input type="color" id={`preview-${question.id}`} className="w-12 h-10 p-1" defaultValue={question.defaultValue || '#000000'} />
                    <Input type="text" placeholder="#000000" defaultValue={question.defaultValue || '#000000'} className="max-w-[150px]" readOnly/>
                </div>
            );
        case 'button':
            return <Button variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        default:
            return null
    }
}

const PreviewSidebar = ({ pages, activePageId, setActivePageId }: { pages: Page[], activePageId: number | null, setActivePageId: (id: number) => void }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">PAGES</h2>
            </div>
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {pages.map(page => (
                    <div key={page.id}>
                         <button
                            onClick={() => setActivePageId(page.id)}
                            className={cn(
                                "w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-semibold",
                                activePageId === page.id
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-accent/50"
                              )}
                          >
                            <span className="truncate">{page.title}</span>
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    )
}

const PreviewStep = ({ title, description, pages }: PreviewStepProps) => {    
    const [activePageId, setActivePageId] = useState<number | null>(pages[0]?.id || null);
    const activePage = pages.find(p => p.id === activePageId);

    return (
        <div className="flex h-full bg-background animate-in fade-in-50">
            <PreviewSidebar pages={pages} activePageId={activePageId} setActivePageId={setActivePageId} />
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {activePage ? (
                                <div key={activePage.id}>
                                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">{activePage.title}</h3>
                                    <div className="space-y-6">
                                        {activePage.sections.map(section => (
                                            <div key={section.id}>
                                                <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                                                {section.questions.map(question => (
                                                    <div key={question.id} className="grid gap-2 mb-4">
                                                        {question.type !== 'formatted-text' && (
                                                            <Label htmlFor={`preview-${question.id}`}>
                                                                {question.label}
                                                                {question.required && <span className="text-destructive"> *</span>}
                                                            </Label>
                                                        )}
                                                        {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                        {renderQuestionInput(question)}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-10">No pages found in this request.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}


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

    // State to track wizard progress
    const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState(steps.length - 1); // Allow all steps in edit mode

    // Question Type Dialog State
    const [isQuestionTypeDialogOpen, setQuestionTypeDialogOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ pageId: number, sectionId: number } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Question Settings Dialog State
    const [isQuestionSettingsOpen, setQuestionSettingsOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [tempQuestion, setTempQuestion] = useState<Question | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const requestId = id;
        if (!token || !requestId) {
            toast({ title: "Error", description: "Invalid request or not logged in.", variant: "destructive" });
            router.push('/dashboard/requests');
            return;
        }

        async function fetchRequestData() {
            try {
                const data = await getRequest(token, requestId);
                setRequestTitle(data.title);
                setRequestDescription(data.description);
                setPages(data.form_data);
                if (data.form_data?.length > 0) {
                    setActivePageId(data.form_data[0].id);
                }
            } catch (error: any) {
                toast({ title: "Failed to load request", description: error.message || "Could not fetch request data.", variant: "destructive" });
                router.push('/dashboard/requests');
            } finally {
                setIsLoading(false);
            }
        }

        fetchRequestData();
    }, [id, router, toast]);

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
            const payload = {
                title: requestTitle,
                description: requestDescription,
                form_data: pages,
            };

            await updateRequest(token, requestId, payload);
            toast({ title: "Request draft updated" });

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
        if (currentStepIndex > 1) { // If on builder or later, go back one step
            const prevStepSlug = steps[currentStepIndex - 1].slug;
            router.push(`/dashboard/requests/edit/${id}/${prevStepSlug}`);
        } else { // If on essentials, go back to requests list
            router.push('/dashboard/requests');
        }
    };

    const handleStepClick = (slug: string) => {
        const targetIndex = steps.findIndex(s => s.slug === slug);
        if (targetIndex > 0 && targetIndex <= maxVisitedStepIndex) {
          router.push(`/dashboard/requests/edit/${id}/${slug}`);
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
                    const newSection: Section = { id: Date.now(), title: `New Section`, instructions: '', questions: [] };
                    return { ...page, sections: [...page.sections, newSection] };
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
        setPages(prevPages => prevPages.map(page => page.id === pageId ? { ...page, sections: page.sections.map(section => section.id === sectionId ? { ...section, title: newTitle } : section) } : page));
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
                    options: (type === 'radio' || type === 'dropdown' || type === 'image-choice') ? [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] : (type === 'checkbox' ? [{ label: 'Accept terms', value: 'accepted'}] : undefined),
                    required: false, apiId: slugify(`${baseLabel}_${Date.now()}`),
                };
                if (type === 'button') {
                    newQuestion.buttonVariant = 'default';
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
        setTempQuestion(JSON.parse(JSON.stringify(question)));
        setQuestionSettingsOpen(true);
    };
    
    const updateQuestion = () => {
        if (!tempQuestion) return;
        setPages(prevPages => prevPages.map(page => ({ ...page, sections: page.sections.map(section => ({ ...section, questions: section.questions.map(q => q.id === tempQuestion.id ? tempQuestion : q) })) })));
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
            case "Essentials": return <EssentialsStep title={requestTitle} setTitle={setRequestTitle} description={requestDescription} setDescription={setRequestDescription} />;
            case "Builder": return <BuilderStep
                                        requestTitle={requestTitle}
                                        pages={pages} addPage={addPage} addSection={addSection} onAddFieldClick={handleAddFieldClick}
                                        updatePageTitle={updatePageTitle} updateSectionTitle={updateSectionTitle}
                                        openQuestionSettings={openQuestionSettings} duplicateQuestion={duplicateQuestion}
                                        deleteQuestion={deleteQuestion} activePageId={activePageId} setActivePageId={setActivePageId}
                                        duplicatePage={duplicatePage} deletePage={deletePage}
                                    />;
            case "Preview": return <PreviewStep title={requestTitle} description={requestDescription} pages={pages} />;
            case "Finalize": return <FinalizeStep />;
            default: return <div>Step not found. Please navigate using the steps above.</div>;
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
                    disabledSteps={['templates']}
                />
                <div className="ml-auto flex items-center gap-2">
                    {currentStepIndex < steps.length - 1 && (
                        <Button onClick={nextStep} disabled={isSubmitting || isLoading}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {steps[currentStepIndex + 1].name} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
            
            <div className={cn("flex-grow", (currentStep === 'Builder' || currentStep === 'Preview') ? "" : "p-6 flex justify-center items-start")}>
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
                        <DialogDescription>Make changes to your field. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    {tempQuestion && (
                        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="grid gap-2">
                                <Label htmlFor="label">Label</Label>
                                <Input id="label" value={tempQuestion.label} onChange={(e) => handleTempQuestionChange('label', e.target.value)} />
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="required" checked={tempQuestion.required} onCheckedChange={(checked) => handleTempQuestionChange('required', !!checked)} />
                                <Label htmlFor="required">Required</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea id="instructions" value={tempQuestion.instructions || ''} onChange={(e) => handleTempQuestionChange('instructions', e.target.value)} placeholder="Optional: Guide users" />
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
                            {(tempQuestion.type === 'dropdown' || tempQuestion.type === 'radio' || tempQuestion.type === 'image-choice') && (
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
                                                <Button variant="ghost" size="icon" onClick={() => removeTempOption(index)} className="self-end"><X className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={addTempOption} className="mt-2"><Plus className="h-4 w-4 mr-2" /> Add Option</Button>
                                </div>
                            )}
                             {tempQuestion.type === 'button' && (
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
                            )}
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="advanced">
                                    <AccordionTrigger className="text-sm">Advanced Settings</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="apiId">API Identifier</Label>
                                            <Input id="apiId" value={tempQuestion.apiId || ''} onChange={(e) => handleTempQuestionChange('apiId', e.target.value)} />
                                            <p className="text-xs text-muted-foreground">Used as the 'name' attribute. Must be unique.</p>
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
