

'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Draggable, type DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal, Settings, GripVertical, Folder, ChevronDown, Pencil,
  Type, Pilcrow, FileUp, CheckSquare, MenuSquare, CalendarClock, Mail, Phone, Link2, CircleDot,
  PenSquare, ImageUp, MapPin, Hash, DollarSign, Globe, CalendarRange, GalleryVertical, 
  Table as TableIcon, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick, X, Plus
} from "lucide-react"

import type { Page, Question, QuestionType, Section, QuestionOption } from "@/lib/api"
import { cn } from "@/lib/utils"
import { StrictModeDroppable } from '../../../../dashboard/requests/new/components/StrictModeDroppable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface BuilderStepProps {
  requestTitle: string;
  setRequestTitle: (title: string) => void;
  pages: Page[];
  addPage: () => void;
  addSection: (pageId: number) => void;
  onAddFieldClick: (pageId: number, sectionId: number) => void;
  updatePageTitle: (pageId: number, newTitle: string) => void;
  updateSectionTitle: (pageId: number, sectionId: number, newTitle: string) => void;
  openQuestionSettings: (question: Question) => void;
  duplicateQuestion: (pageId: number, sectionId: number, questionId: number) => void;
  deleteQuestion: (pageId: number, sectionId: number, questionId: number) => void;
  activePageId: number | null;
  setActivePageId: (id: number) => void;
  duplicatePage: (pageId: number) => void;
  deletePage: (pageId: number) => void;
  duplicateSection: (pageId: number, sectionId: number) => void;
  deleteSection: (pageId: number, sectionId: number) => void;
  reorderQuestions: (pageId: number, sectionId: number, startIndex: number, endIndex: number) => void;
  editingQuestion: Question | null;
  closeQuestionSettings: () => void;
  tempQuestion: Question | null;
  handleTempQuestionChange: (field: keyof Question, value: any) => void;
  addTempOption: () => void;
  handleTempOptionChange: (index: number, field: keyof QuestionOption, value: string) => void;
  removeTempOption: (index: number) => void;
  updateQuestion: () => void;
}

interface PagesSidebarProps {
  pages: Page[];
  addPage: () => void;
  activePageId: number | null;
  setActivePageId: (id: number) => void;
  duplicatePage: (pageId: number) => void;
  deletePage: (pageId: number) => void;
  addSection: (pageId: number) => void;
}

const questionTypeToIcon: Record<QuestionType, React.ElementType> = {
    'text': Type,
    'textarea': Pilcrow,
    'file': FileUp,
    'checkbox': CheckSquare,
    'dropdown': MenuSquare,
    'date': CalendarClock,
    'email': Mail,
    'tel': Phone,
    'url': Link2,
    'radio': CircleDot,
    'formatted-text': PenSquare,
    'image-upload': ImageUp,
    'address': MapPin,
    'number': Hash,
    'currency': DollarSign,
    'country': Globe,
    'date-range': CalendarRange,
    'icon-selector': Sparkles,
    'color-picker': Pipette,
    'button': MousePointerClick,
};

const QuestionIcon = ({ type }: { type: QuestionType }) => {
    const iconProps = { className: "h-4 w-4 text-pink-600" };
    const IconComponent = questionTypeToIcon[type] || Type;
    return <IconComponent {...iconProps} />;
}

const PagesSidebar = ({ pages, addPage, activePageId, setActivePageId, duplicatePage, deletePage, addSection }: PagesSidebarProps) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">PAGES</h2>
            </div>
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {pages.map(page => (
                    <div key={page.id}>
                         <div className={cn(
                            "w-full flex items-center justify-between text-sm p-2 rounded-md font-semibold",
                            activePageId === page.id
                              ? "bg-pink-100 text-pink-700"
                              : "text-foreground hover:bg-accent/50"
                          )}>
                            <button
                                onClick={() => setActivePageId(page.id)}
                                className="flex-1 text-left truncate"
                            >
                                {page.title}
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onClick={() => duplicatePage(page.id)}>Duplicate Page</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addSection(page.id)}>Create New Section</DropdownMenuItem>
                                    {pages.length > 1 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete Page</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this page and all its content.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deletePage(page.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {activePageId === page.id && (
                           <div className="pl-4 border-l ml-4 mt-2 space-y-1">
                                {page.sections.map(section => (
                                    <div key={section.id}>
                                        <a href={`#section-${section.id}`} className="block text-sm p-1.5 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 truncate">
                                            {section.title}
                                        </a>
                                        <div className="pl-4 border-l ml-2 mt-1 space-y-1">
                                            {section.questions.map(question => (
                                                <a
                                                    key={question.id}
                                                    href={`#question-${question.id}`}
                                                    className="block text-xs p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 truncate"
                                                    title={question.label}
                                                >
                                                    {question.label}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="p-2 border-t">
                <Button variant="outline" className="w-full" onClick={addPage}>
                    Add a Page
                </Button>
            </div>
        </aside>
    )
}

const SettingsPanel = (props: any) => {
    const { 
        tempQuestion, handleTempQuestionChange, removeTempOption, 
        addTempOption, handleTempOptionChange, closeQuestionSettings 
    } = props;
    
    const [showLengthValidation, setShowLengthValidation] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(false);
    
    useEffect(() => {
      if (tempQuestion) {
          setShowLengthValidation(!!(tempQuestion.minLength || tempQuestion.maxLength));
          setShowPlaceholder(!!tempQuestion.placeholder);
      }
    }, [tempQuestion]);

    if (!tempQuestion) return null;

    return (
        <div className="flex flex-col h-full bg-white border-l">
            <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <h2 className="font-semibold text-sm uppercase text-muted-foreground">Field Options</h2>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeQuestionSettings}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" value={tempQuestion.label} onChange={(e) => handleTempQuestionChange('label', e.target.value)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label htmlFor="required">Required</Label>
                    <Switch id="required" checked={tempQuestion.required} onCheckedChange={(checked) => handleTempQuestionChange('required', !!checked)} />
                </div>
                 <div className="flex items-center justify-between p-3 rounded-lg border">
                    <Label htmlFor="showInstructions">Show Instructions</Label>
                    <Switch id="showInstructions" checked={!tempQuestion.hideInstructions} onCheckedChange={(checked) => handleTempQuestionChange('hideInstructions', !checked)} />
                </div>

                {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea') && (
                    <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <Label htmlFor="showLength">Set Min/Max Length</Label>
                        <Switch id="showLength" checked={showLengthValidation} onCheckedChange={setShowLengthValidation} />
                    </div>
                    {showLengthValidation && (
                        <div className="grid grid-cols-2 gap-4 pl-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minLength">Min Length</Label>
                                <Input id="minLength" type="number" value={tempQuestion.minLength || ''} onChange={(e) => handleTempQuestionChange('minLength', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxLength">Max Length</Label>
                                <Input id="maxLength" type="number" value={tempQuestion.maxLength || ''} onChange={(e) => handleTempQuestionChange('maxLength', e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                            </div>
                        </div>
                    )}
                    </>
                )}
                
                {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'date') && (
                    <>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <Label htmlFor="showPlaceholder">Add Placeholder</Label>
                        <Switch id="showPlaceholder" checked={showPlaceholder} onCheckedChange={setShowPlaceholder} />
                    </div>
                    {showPlaceholder && (
                    <div className="grid gap-2 pl-4"><Label htmlFor="placeholder" className="sr-only">Custom placeholder</Label><Input id="placeholder" value={tempQuestion.placeholder || ''} onChange={(e) => handleTempQuestionChange('placeholder', e.target.value)} /></div>
                    )}
                    </>
                )}
                
                {tempQuestion.type === 'formatted-text' && (<div className="grid gap-2"><Label htmlFor="content">Content</Label><Textarea id="content" value={tempQuestion.defaultValue || ''} onChange={(e) => handleTempQuestionChange('defaultValue', e.target.value)} placeholder="Enter your formatted text content here. You can use basic HTML for styling." className="min-h-[120px]" /></div>)}
                {(tempQuestion.type === 'text' || tempQuestion.type === 'textarea' || tempQuestion.type === 'date' || tempQuestion.type === 'email' || tempQuestion.type === 'tel' || tempQuestion.type === 'url' || tempQuestion.type === 'radio' ) && (<div className="grid gap-2"><Label htmlFor="defaultValue">Default Value</Label><Input id="defaultValue" value={tempQuestion.defaultValue || ''} onChange={(e) => handleTempQuestionChange('defaultValue', e.target.value)} /></div>)}
                {(tempQuestion.type === 'dropdown' || tempQuestion.type === 'radio' || tempQuestion.type === 'checkbox') && (
                    <div className="grid gap-4">
                        <Label>Options</Label>
                        <div className="space-y-3">{tempQuestion.options?.map((option, index) => (<div key={index} className="flex items-center gap-2"><div className="grid gap-1.5 flex-1"><Label htmlFor={`option-label-${index}`} className="text-xs">Label</Label><Input id={`option-label-${index}`} value={option.label} onChange={(e) => handleTempOptionChange(index, 'label', e.target.value)} /></div><div className="grid gap-1.5 flex-1"><Label htmlFor={`option-value-${index}`} className="text-xs">Value</Label><Input id={`option-value-${index}`} value={option.value} onChange={(e) => handleTempOptionChange(index, 'value', e.target.value)} /></div><Button variant="ghost" size="icon" onClick={() => removeTempOption(index)} className="self-end"><X className="h-4 w-4" /></Button></div>))}</div>
                        <Button variant="outline" size="sm" onClick={addTempOption} className="mt-2"><Plus className="h-4 w-4 mr-2" /> Add Option</Button>
                    </div>
                )}
                {tempQuestion.type === 'button' && (<div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="buttonVariant">Button Style</Label><Select value={tempQuestion.buttonVariant || 'default'} onValueChange={(value) => handleTempQuestionChange('buttonVariant', value as Question['buttonVariant'])}><SelectTrigger id="buttonVariant"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default</SelectItem><SelectItem value="destructive">Destructive</SelectItem><SelectItem value="outline">Outline</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="ghost">Ghost</SelectItem><SelectItem value="link">Link</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label htmlFor="buttonType">Button Type</Label><Select value={tempQuestion.buttonType || 'button'} onValueChange={(value) => handleTempQuestionChange('buttonType', value as Question['buttonType'])}><SelectTrigger id="buttonType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="button">Button</SelectItem><SelectItem value="submit">Submit</SelectItem></SelectContent></Select></div></div>)}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced">
                        <AccordionTrigger>Advanced Settings</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="apiId">API Identifier</Label>
                                <Input id="apiId" value={tempQuestion.apiId || ''} onChange={(e) => handleTempQuestionChange('apiId', e.target.value)} />
                                <p className="text-xs text-muted-foreground">Used as the 'name' attribute. Must be unique.</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}

export default function BuilderStep(props: BuilderStepProps) {
  const { 
    requestTitle, pages, addPage, addSection, onAddFieldClick, updatePageTitle, 
    updateSectionTitle, openQuestionSettings, duplicateQuestion, deleteQuestion, 
    activePageId, setActivePageId, duplicatePage, deletePage, duplicateSection, 
    deleteSection, reorderQuestions, editingQuestion
  } = props;

  const [editingMainTitle, setEditingMainTitle] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  
  const getTitleParts = (title: string) => {
    const match = title.match(/^([0-9\.]+)\s*(.*)/);
    if (match) return { number: match[1], text: match[2] };
    return { number: '', text: title };
  }

  const handlePageTitleEdit = (page: Page) => {
    setActivePageId(page.id);
    setEditingPageId(page.id);
    setEditingPageTitle(getTitleParts(page.title).text);
  }

  const handlePageTitleSave = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      const { number } = getTitleParts(page.title);
      updatePageTitle(pageId, `${number} ${editingPageTitle}`);
    }
    setEditingPageId(null);
    setEditingPageTitle("");
  }

  const handleSectionTitleEdit = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSectionTitle(getTitleParts(section.title).text);
  }

  const handleSectionTitleSave = (pageId: number, sectionId: number) => {
    const page = pages.find(p => p.id === pageId);
    const section = page?.sections.find(s => s.id === sectionId);
    if (section) {
        const { number } = getTitleParts(section.title);
        updateSectionTitle(pageId, sectionId, `${number} ${editingSectionTitle}`);
    }
    setEditingSectionId(null);
    setEditingSectionTitle("");
  }
  
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sectionId = parseInt(destination.droppableId.split('-')[1]);
    const page = pages.find(p => p.sections.some(s => s.id === sectionId));
    if (page) reorderQuestions(page.id, sectionId, source.index, destination.index);
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full bg-muted/40 overflow-hidden">
            <PagesSidebar
                pages={pages} addPage={addPage} activePageId={activePageId} setActivePageId={setActivePageId}
                duplicatePage={duplicatePage} deletePage={deletePage} addSection={addSection}
            />
            <div className="flex flex-1 overflow-hidden relative">
                 <div className="flex-1 transition-all duration-300 ease-in-out overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="mb-6">
                            <div className="group flex items-center gap-2">
                                {editingMainTitle ? (
                                    <Input
                                        value={requestTitle}
                                        onChange={(e) => props.setRequestTitle(e.target.value)}
                                        onBlur={() => setEditingMainTitle(false)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setEditingMainTitle(false); }}
                                        className="text-2xl font-bold h-auto p-2 border border-input focus-visible:ring-2 focus-visible:ring-ring"
                                        style={{ borderColor: '#ddd' }}
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setEditingMainTitle(true)}>{requestTitle}</h1>
                                )}
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setEditingMainTitle(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {pages.filter(p => p.id === activePageId).map(page => (
                                <div key={page.id} id={`page-${page.id}`}>
                                    <div className="flex items-center gap-2 mb-2 group">
                                        {editingPageId === page.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-xl font-bold">{getTitleParts(page.title).number}</span>
                                                <Input
                                                    value={editingPageTitle} onChange={(e) => setEditingPageTitle(e.target.value)}
                                                    onBlur={() => handlePageTitleSave(page.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handlePageTitleSave(page.id); }}
                                                    className="text-xl font-bold p-2 h-auto border focus-visible:ring-2 focus-visible:ring-ring"
                                                    style={{ borderColor: '#ddd' }}
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <h2 className="text-xl font-bold flex-1 cursor-pointer" onClick={() => handlePageTitleEdit(page)}>{page.title}</h2>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handlePageTitleEdit(page)}><Pencil className="h-4 w-4" /></Button>
                                    </div>
                                    
                                    {page.sections.map(section => (
                                        <div key={section.id} id={`section-${section.id}`} className="ml-4 border-l-2 pl-4 mb-4">
                                            <div className="flex items-center gap-2 mb-2 group">
                                                {editingSectionId === section.id ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-lg font-semibold">{getTitleParts(section.title).number}</span>
                                                        <Input
                                                            value={editingSectionTitle} onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                            onBlur={() => handleSectionTitleSave(page.id, section.id)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSectionTitleSave(page.id, section.id); }}
                                                            className="text-lg font-semibold p-2 h-auto border focus-visible:ring-2 focus-visible:ring-ring flex-1" 
                                                            style={{ borderColor: '#ddd' }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <h3 className="text-lg font-semibold flex-1 cursor-pointer" onClick={() => handleSectionTitleEdit(section)}>{section.title}</h3>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleSectionTitleEdit(section)}><Pencil className="h-4 w-4" /></Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => duplicateSection(page.id, section.id)}>Duplicate</DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete</DropdownMenuItem></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this section and all its questions.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSection(page.id, section.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <StrictModeDroppable droppableId={`section-${section.id}`} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                                                {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
                                                        {section.questions.map((question, index) => {
                                                            
                                                            return (
                                                                <Draggable key={question.id} draggableId={`${question.id}`} index={index}>
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-white border rounded-lg">
                                                                            <div className="p-3 flex items-center justify-between border-b">
                                                                                <div className="flex items-center gap-2 group/field">
                                                                                    <div {...provided.dragHandleProps} className="h-5 w-5 flex items-center justify-center text-muted-foreground cursor-move"><GripVertical className="h-full w-full"/></div>
                                                                                    <div className="flex items-center justify-center h-6 w-6 bg-pink-100 rounded"><QuestionIcon type={question.type} /></div>
                                                                                    <span className="font-semibold cursor-pointer" onClick={() => openQuestionSettings(question)}>{question.label}</span>
                                                                                    {question.required && <Badge variant="destructive" className="ml-2">Required</Badge>}
                                                                                    {question.placeholder && <Badge variant="secondary" className="ml-2">Placeholder</Badge>}
                                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/field:opacity-100" onClick={() => openQuestionSettings(question)}><Pencil className="h-3 w-3" /></Button>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openQuestionSettings(question)}><Settings className="h-4 w-4" /></Button>
                                                                                    <DropdownMenu>
                                                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                                        <DropdownMenuContent align="end">
                                                                                            <DropdownMenuItem onClick={() => duplicateQuestion(page.id, section.id, question.id)}>Duplicate</DropdownMenuItem>
                                                                                            <DropdownMenuItem onClick={() => deleteQuestion(page.id, section.id, question.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete</DropdownMenuItem>
                                                                                        </DropdownMenuContent>
                                                                                    </DropdownMenu>
                                                                                </div>
                                                                            </div>
                                                                            {!question.hideInstructions && (
                                                                                <div className="p-3">
                                                                                    <Textarea 
                                                                                        placeholder="Enter field instructions here..." 
                                                                                        className="border-none shadow-none focus-visible:ring-0 px-2" 
                                                                                        defaultValue={question.instructions || ''}
                                                                                        onBlur={(e) => {
                                                                                            const updatedQuestion = { ...question, instructions: e.target.value };
                                                                                            handleTempQuestionChange('instructions', e.target.value);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            )
                                                         })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </StrictModeDroppable>
                                            <Button variant="outline" size="sm" onClick={() => onAddFieldClick(page.id, section.id)} className="mt-4">Add a Field</Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addSection(page.id)}>Add a Section</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className={cn(
                    "flex-shrink-0 transition-all duration-300 ease-in-out bg-transparent overflow-hidden",
                    editingQuestion ? 'w-80' : 'w-0'
                )}>
                    <div className="w-80 h-full">
                       {editingQuestion && (
                            <SettingsPanel {...props} />
                       )}
                   </div>
                </div>
            </div>
        </div>
    </DragDropContext>
  )
}
