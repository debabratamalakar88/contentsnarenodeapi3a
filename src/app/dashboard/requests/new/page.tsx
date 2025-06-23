'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  GripVertical,
  Plus,
  Trash2,
  Text,
  Heading2,
  CheckSquare,
  List,
  UploadCloud,
  Calendar as CalendarIcon,
  Mail,
  Phone,
  Link as LinkIcon,
  CircleDot,
  Pencil,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


type QuestionType = 'text' | 'textarea' | 'file' | 'checkbox' | 'dropdown' | 'date' | 'email' | 'tel' | 'url' | 'radio';

interface Question {
  id: number;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
}

interface Page {
  id: number;
  title: string;
  questions: Question[];
}

const initialPagesData: Page[] = [
  {
    id: 1,
    title: "Page 1: Company Information",
    questions: [
      { id: 1, label: "Company Name", type: 'text', placeholder: "e.g. Acme Inc." },
      { id: 2, label: "Business Address", type: 'textarea', placeholder: "Enter your full business address" },
    ],
  },
  {
    id: 2,
    title: "Page 2: Document Uploads",
    questions: [
      { id: 3, label: "Business License", type: 'file' },
      { id: 4, label: "Services Needed", type: 'radio', options: ["Web Design", "SEO", "Marketing"] }
    ],
  },
]

const fieldTypes: { icon: React.ElementType; label: string; type: QuestionType }[] = [
    { icon: Text, label: "Text", type: 'text' },
    { icon: Heading2, label: "Textarea", type: 'textarea' },
    { icon: UploadCloud, label: "File Upload", type: 'file' },
    { icon: CheckSquare, label: "Checkbox", type: 'checkbox' },
    { icon: List, label: "Dropdown", type: 'dropdown' },
    { icon: CalendarIcon, label: "Date", type: 'date' },
    { icon: Mail, label: "Email", type: 'email' },
    { icon: Phone, label: "Phone", type: 'tel' },
    { icon: LinkIcon, label: "URL", type: 'url' },
    { icon: CircleDot, label: "Radio Button", type: 'radio' },
];

export default function NewRequestPage() {
  const [pages, setPages] = useState<Page[]>(initialPagesData)
  
  // Page editing state
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  
  // Add question modal state
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  const [targetPageId, setTargetPageId] = useState<number | null>(null);

  // Question editing state
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<{ pageId: number; question: Question } | null>(null);
  const [editFormData, setEditFormData] = useState({ placeholder: '', options: '' });


  const addPage = () => {
    const newPage: Page = {
      id: Date.now(),
      title: `Page ${pages.length + 1}: Untitled Page`,
      questions: [],
    }
    setPages([...pages, newPage])
  }

  const removePage = (pageId: number) => {
    setPages(pages.filter((p) => p.id !== pageId))
  }
  
  const updatePageTitle = (pageId: number, newTitle: string) => {
    setPages(
      pages.map((p) =>
        p.id === pageId ? { ...p, title: newTitle.trim() || `Untitled Page` } : p
      )
    );
    setEditingPageId(null);
  };

  const addQuestion = (pageId: number, type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now(),
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      type,
      placeholder: '',
      options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    }
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? { ...p, questions: [...p.questions, newQuestion] }
          : p
      )
    )
    setQuestionModalOpen(false)
  }

  const removeQuestion = (pageId: number, questionId: number) => {
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? { ...p, questions: p.questions.filter((q) => q.id !== questionId) }
          : p
      )
    )
  }

  const updateQuestionLabel = (pageId: number, questionId: number, newLabel: string) => {
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              questions: p.questions.map((q) =>
                q.id === questionId ? { ...q, label: newLabel.trim() || `Untitled Question` } : q
              ),
            }
          : p
      )
    );
    setEditingQuestionId(null);
  };

  const handleOpenQuestionModal = (pageId: number) => {
    setTargetPageId(pageId);
    setQuestionModalOpen(true);
  };
  
  const handleOpenEditModal = (pageId: number, question: Question) => {
    setQuestionToEdit({ pageId, question });
    setEditFormData({
        placeholder: question.placeholder || '',
        options: question.options?.join('\n') || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuestionSettings = () => {
      if (!questionToEdit) return;

      const { pageId, question } = questionToEdit;
      const updatedQuestion = {
          ...question,
          placeholder: editFormData.placeholder,
          options: editFormData.options.split('\n').filter(opt => opt.trim() !== '')
      };

      setPages(pages.map(p =>
          p.id === pageId ? {
              ...p,
              questions: p.questions.map(q => q.id === question.id ? updatedQuestion : q)
          } : p
      ));
      setIsEditModalOpen(false);
      setQuestionToEdit(null);
  };

  const renderQuestionInput = (question: Question) => {
    switch(question.type) {
      case 'text':
        return <Input type="text" placeholder={question.placeholder || "Short text answer"} disabled />
      case 'textarea':
        return <Textarea placeholder={question.placeholder || "Long text answer"} disabled />
      case 'file':
        return <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground items-center">File Upload</div>
      case 'checkbox':
        return (
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id={`checkbox-${question.id}`} disabled />
                <label
                    htmlFor={`checkbox-${question.id}`}
                    className="text-sm font-medium leading-none text-muted-foreground"
                >
                    {question.options?.[0] || 'Sample option'}
                </label>
            </div>
        )
      case 'dropdown':
        return (
            <Select disabled>
                <SelectTrigger>
                    <SelectValue placeholder={question.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((opt, i) => <SelectItem key={i} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        )
      case 'date':
        return (
            <Button variant={"outline"} disabled className="w-full max-w-[240px] justify-start text-left font-normal text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{question.placeholder || 'Pick a date'}</span>
            </Button>
        )
      case 'email':
        return <Input type="email" placeholder={question.placeholder || "email@example.com"} disabled />
      case 'tel':
        return <Input type="tel" placeholder={question.placeholder || "(123) 456-7890"} disabled />
      case 'url':
        return <Input type="url" placeholder={question.placeholder || "https://example.com"} disabled />
      case 'radio':
        return (
            <RadioGroup disabled>
              {question.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2 pt-2">
                    <RadioGroupItem value={opt} id={`radio-${question.id}-${i}`} />
                    <label
                        htmlFor={`radio-${question.id}-${i}`}
                        className="text-sm font-medium leading-none text-muted-foreground"
                    >
                        {opt}
                    </label>
                </div>
              ))}
            </RadioGroup>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Request</CardTitle>
              <CardDescription>
                Customize the request details, add pages and questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="title">Request Title</Label>
                  <Input
                    id="title"
                    type="text"
                    className="w-full"
                    defaultValue="New Client Onboarding Materials"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue="Please provide all the necessary documents and information to get you set up in our system."
                    className="min-h-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Builder</CardTitle>
              <CardDescription>Drag and drop to reorder pages and questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="rounded-lg border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move flex-shrink-0" />
                      {editingPageId === page.id ? (
                        <Input
                          defaultValue={page.title}
                          onBlur={(e) => updatePageTitle(page.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updatePageTitle(page.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingPageId(null);
                            }
                          }}
                          autoFocus
                          className="font-semibold"
                        />
                      ) : (
                        <h3 className="font-semibold cursor-pointer truncate" onClick={() => setEditingPageId(page.id)}>
                          {page.title}
                        </h3>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removePage(page.id)} className="flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                  {page.questions.map((question) => (
                    <div key={question.id} className="flex items-start gap-2 pl-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move mt-2.5" />
                      <div className="flex-1 space-y-2">
                         {editingQuestionId === question.id ? (
                            <Input
                                defaultValue={question.label}
                                onBlur={(e) => updateQuestionLabel(page.id, question.id, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        updateQuestionLabel(page.id, question.id, e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                        setEditingQuestionId(null);
                                    }
                                }}
                                autoFocus
                            />
                        ) : (
                            <Label onClick={() => setEditingQuestionId(question.id)} className="cursor-pointer font-medium text-base">
                                {question.label}
                            </Label>
                        )}
                        {renderQuestionInput(question)}
                      </div>
                       <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(page.id, question)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(page.id, question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="ml-4" onClick={() => handleOpenQuestionModal(page.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              ))}
              <Button variant="secondary" className="w-full" onClick={addPage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Request Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button>Publish Immediately</Button>
              <Button variant="secondary">Schedule Publish</Button>
              <Button variant="outline">Save as Draft</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assign Clients</CardTitle>
            </CardHeader>
            <CardContent>
               <Label>Select one or more clients</Label>
               <Input placeholder="Search for clients..." />
               <div className="mt-2 text-sm text-muted-foreground">Assigned: Acme Inc.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Template</CardTitle>
              <CardDescription>Start from a template to save time.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0">
                  <FileText className="mr-2 h-4 w-4" />
                  Client Onboarding Questionnaire
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Choose a Different Template</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Dialog open={isQuestionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a question type</DialogTitle>
            <DialogDescription>
              Select the type of field you want to add to your request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 md:grid-cols-3">
            {fieldTypes.map((field) => (
              <button
                key={field.type}
                onClick={() => targetPageId !== null && addQuestion(targetPageId, field.type)}
                className="flex flex-col items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-foreground"
              >
                <field.icon className="h-8 w-8 text-accent" />
                <span className="text-sm font-medium">{field.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question Settings</DialogTitle>
            <DialogDescription>
              Make changes to your question here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={editFormData.placeholder}
                onChange={(e) => setEditFormData({ ...editFormData, placeholder: e.target.value })}
              />
            </div>
            {(questionToEdit?.question.type === 'dropdown' || questionToEdit?.question.type === 'radio') && (
              <div className="grid gap-2">
                <Label htmlFor="options">Options (one per line)</Label>
                <Textarea
                  id="options"
                  className="min-h-[120px]"
                  value={editFormData.options}
                  onChange={(e) => setEditFormData({ ...editFormData, options: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateQuestionSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
