

'use client'

import React, { useState } from 'react'
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
  Table as TableIcon, PenTool, ListChecks, BadgeCheck, Briefcase, Sparkles, Pipette, MousePointerClick
} from "lucide-react"

import type { Page, Question, QuestionType, Section } from "@/lib/api"
import { cn } from "@/lib/utils"
import { StrictModeDroppable } from './StrictModeDroppable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BuilderStepProps {
  requestTitle: string;
  requestDescription?: string;
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
    const iconProps = { className: "h-4 w-4 text-primary" };
    const IconComponent = questionTypeToIcon[type] || Type;
    return <IconComponent {...iconProps} />;
}

const PagesSidebar = ({ pages, addPage, activePageId, setActivePageId, duplicatePage, deletePage, addSection }: PagesSidebarProps) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">PAGES</h2>
            </div>
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                {pages.map(page => (
                    <div key={page.id}>
                         <div className={cn(
                            "w-full flex items-center justify-between text-sm p-2 rounded-md font-semibold",
                            activePageId === page.id
                              ? "bg-primary/10 text-primary"
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
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => deletePage(page.id)}>Delete Page</DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {activePageId === page.id && (
                           <div className="pl-4 border-l ml-4 mt-2 space-y-2">
                                {page.sections.map(section => (
                                    <div key={section.id}>
                                        <a href={`#section-${section.id}`} className="block text-sm p-2 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 truncate">
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

export default function BuilderStep({ requestTitle, requestDescription, pages, addPage, addSection, onAddFieldClick, updatePageTitle, updateSectionTitle, openQuestionSettings, duplicateQuestion, deleteQuestion, activePageId, setActivePageId, duplicatePage, deletePage, duplicateSection, deleteSection, reorderQuestions }: BuilderStepProps) {

  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");

  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  const getTitleParts = (title: string) => {
    const match = title.match(/^([0-9\.]+)\s*(.*)/);
    if (match) {
        return { number: match[1], text: match[2] };
    }
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
    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sectionId = parseInt(destination.droppableId.split('-')[1]);
    const page = pages.find(p => p.sections.some(s => s.id === sectionId));
    
    if (page) {
      reorderQuestions(page.id, sectionId, source.index, destination.index);
    }
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full">
        <PagesSidebar
            pages={pages} 
            addPage={addPage} 
            activePageId={activePageId} 
            setActivePageId={setActivePageId}
            duplicatePage={duplicatePage}
            deletePage={deletePage}
            addSection={addSection}
        />
        
        <main className="flex-1 overflow-y-scroll bg-white">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">{requestTitle}</h1>
                    {requestDescription && <p className="text-muted-foreground mt-1">{requestDescription}</p>}
                </div>


                <div className="space-y-6">
                    {pages.filter(p => p.id === activePageId).map(page => {
                        return (
                        <div key={page.id} id={`page-${page.id}`}>
                            <div className="flex items-center gap-2 mb-2 group">
                                {editingPageId === page.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-xl font-bold">{getTitleParts(page.title).number}</span>
                                        <Input
                                            value={editingPageTitle}
                                            onChange={(e) => setEditingPageTitle(e.target.value)}
                                            onBlur={() => handlePageTitleSave(page.id)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handlePageTitleSave(page.id); }}
                                            className="text-xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 flex-1"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h2 className="text-xl font-bold flex-1 cursor-pointer" onClick={() => handlePageTitleEdit(page)}>
                                        {page.title}
                                    </h2>
                                )}
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handlePageTitleEdit(page)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                            <Textarea 
                                placeholder="Enter page instructions here..." 
                                className="mb-4 min-h-[60px]"
                                defaultValue={page.instructions}
                            />

                            {page.sections.map(section => {
                                return (
                                <div key={section.id} id={`section-${section.id}`} className="ml-4 border-l-2 pl-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2 group">
                                        {editingSectionId === section.id ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-lg font-semibold">{getTitleParts(section.title).number}</span>
                                                <Input
                                                    value={editingSectionTitle}
                                                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                                                    onBlur={() => handleSectionTitleSave(page.id, section.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSectionTitleSave(page.id, section.id); }}
                                                    className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 flex-1"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <h3 className="text-lg font-semibold flex-1 cursor-pointer" onClick={() => handleSectionTitleEdit(section)}>
                                                {section.title}
                                            </h3>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleSectionTitleEdit(section)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => duplicateSection(page.id, section.id)}>Duplicate</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete this section and all its questions.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteSection(page.id, section.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    <StrictModeDroppable
                                        droppableId={`section-${section.id}`}
                                        isDropDisabled={false}
                                        isCombineEnabled={false}
                                        ignoreContainerClipping={false}
                                    >
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-4">
                                                {section.questions.map((question, index) => (
                                                    <Draggable key={question.id} draggableId={`${question.id}`} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="bg-white border rounded-lg"
                                                            >
                                                                <div className="p-3 flex items-center justify-between border-b">
                                                                    <div className="flex items-center gap-2">
                                                                        <div {...provided.dragHandleProps} className="h-5 w-5 flex items-center justify-center text-muted-foreground cursor-move">
                                                                            <GripVertical className="h-full w-full"/>
                                                                        </div>
                                                                        <div className="flex items-center justify-center h-6 w-6 bg-primary/10 rounded">
                                                                            <QuestionIcon type={question.type} />
                                                                        </div>
                                                                        <span className="font-semibold">{question.label}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openQuestionSettings(question)}>
                                                                            <Settings className="h-4 w-4" />
                                                                        </Button>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem onClick={() => duplicateQuestion(page.id, section.id, question.id)}>
                                                                                    Duplicate
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => openQuestionSettings(question)}>
                                                                                    Rename
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() => deleteQuestion(page.id, section.id, question.id)}
                                                                                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                                                                >
                                                                                    Delete
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </div>
                                                                <div className="p-3">
                                                                    <Textarea placeholder="Enter field instructions here..." className="border-none shadow-none focus-visible:ring-0 px-0" defaultValue={question.instructions} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </StrictModeDroppable>

                                    <Button variant="outline" size="sm" onClick={() => onAddFieldClick(page.id, section.id)}>Add a Field</Button>
                                </div>
                            )})}
                            <Button variant="outline" size="sm" onClick={() => addSection(page.id)}>Add a Section</Button>
                        </div>
                    )})}
                </div>
            </div>
        </main>
        </div>
    </DragDropContext>
  )
}
