'use client'

import { useState } from "react"
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
import { FileText, GripVertical, Plus, Trash2 } from "lucide-react"

interface Question {
  id: number;
  label: string;
  type: 'text' | 'textarea' | 'file';
}

interface Page {
  id: number;
  title: string;
  questions: Question[];
}

const initialPages: Page[] = [
  {
    id: 1,
    title: "Page 1: Company Information",
    questions: [
      { id: 1, label: "Company Name", type: 'text' },
      { id: 2, label: "Business Address", type: 'textarea' },
    ],
  },
  {
    id: 2,
    title: "Page 2: Document Uploads",
    questions: [
      { id: 3, label: "Business License", type: 'file' },
    ],
  },
]

export default function NewRequestPage() {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [editingPageId, setEditingPageId] = useState<number | null>(null);

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

  const addQuestion = (pageId: number) => {
    const newQuestion: Question = {
      id: Date.now(),
      label: "New Question",
      type: 'text',
    }
    setPages(
      pages.map((p) =>
        p.id === pageId
          ? { ...p, questions: [...p.questions, newQuestion] }
          : p
      )
    )
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

  const renderQuestionInput = (question: Question) => {
    switch(question.type) {
      case 'text':
        return <Input type="text" placeholder="Short text answer" disabled />
      case 'textarea':
        return <Textarea placeholder="Long text answer" disabled />
      case 'file':
        return <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground items-center">File Upload</div>
      default:
        return null
    }
  }

  return (
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
                  <div key={question.id} className="flex items-center gap-2 pl-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <Label>{question.label}</Label>
                      {renderQuestionInput(question)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(page.id, question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="ml-4" onClick={() => addQuestion(page.id)}>
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
  )
}
