'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold, Italic, Underline, Strikethrough, List, Pilcrow, Link, Image, Video, Code2, MoreHorizontal, Settings, Trash2, GripVertical, ChevronDown, Folder
} from "lucide-react"

import type { Page, Section, Question } from "../page"

interface BuilderStepProps {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

const RichTextToolbar = () => (
    <div className="flex items-center gap-1 bg-card border-b p-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Strikethrough className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pilcrow className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Code2 className="h-4 w-4" />
        </Button>
    </div>
)

const PagesSidebar = ({ pages, setPages }: BuilderStepProps) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">PAGES</h2>
            </div>
            <div className="flex-grow p-2 space-y-1">
                {pages.map(page => (
                    <div key={page.id}>
                        <a href={`#page-${page.id}`} className="flex items-center justify-between text-sm p-2 rounded-md bg-primary/10 text-primary font-semibold">
                           <span>{page.title}</span>
                           <MoreHorizontal className="h-4 w-4" />
                        </a>
                        <div className="pl-4">
                            {page.sections.map(section => (
                                <div key={section.id}>
                                    <a href={`#section-${section.id}`} className="block text-sm p-2 text-muted-foreground hover:text-foreground">
                                        {section.title}
                                    </a>
                                     <div className="pl-4">
                                        {section.questions.map(question => (
                                             <a key={question.id} href={`#question-${question.id}`} className="flex items-center justify-between text-sm p-2 text-muted-foreground hover:text-foreground">
                                                <span className="truncate">{question.label}</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                             </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t">
                <Button variant="outline" className="w-full">
                    Add a Page <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </aside>
    )
}

export default function BuilderStep({ pages, setPages }: BuilderStepProps) {

  return (
    <div className="flex h-full">
      <PagesSidebar pages={pages} setPages={setPages} />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <Input className="text-2xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0" defaultValue="New Request" />
                     <div className="flex items-center">
                        <Button variant="ghost" className="text-muted-foreground p-1 h-auto">
                            <Folder className="h-4 w-4 mr-2" /> Default Folder <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
                <Button variant="link" className="text-primary">Edit request instructions</Button>
            </div>


            <div className="space-y-6">
                {pages.map(page => (
                    <div key={page.id} id={`page-${page.id}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-bold">{page.title}</h2>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>
                        <Textarea 
                            placeholder="Enter page instructions here..." 
                            className="mb-4 min-h-[60px]"
                            defaultValue={page.instructions}
                        />

                        {page.sections.map(section => (
                            <div key={section.id} id={`section-${section.id}`} className="ml-4 border-l-2 pl-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">{section.title}</h3>
                                     <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                </div>

                                {section.questions.map(question => (
                                    <div key={question.id} id={`question-${question.id}`} className="bg-white border rounded-lg mb-4">
                                        <div className="p-3 flex items-center justify-between border-b">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                                <div className="flex items-center justify-center h-6 w-6 bg-primary/10 rounded">
                                                   <span className="font-bold text-primary text-xs">Aa</span>
                                                </div>
                                                <span className="font-semibold">{question.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><Settings className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <Textarea placeholder="Enter field instructions here..." className="border-none shadow-none focus-visible:ring-0 px-0" defaultValue={question.instructions} />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm">Add a Field</Button>
                            </div>
                        ))}
                         <Button variant="outline" size="sm">Add a Section <ChevronDown className="h-4 w-4 ml-2" /></Button>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  )
}
