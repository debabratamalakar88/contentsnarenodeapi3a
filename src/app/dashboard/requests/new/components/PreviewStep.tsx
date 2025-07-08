
'use client'

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Page, Question } from "../[step]/page"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile } from 'lucide-react';

interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const RichTextEditorPreview = ({ question }: { question: Question }) => {
    const [content, setContent] = React.useState(question.defaultValue || '');
    const [wordCount, setWordCount] = React.useState(0);
    const editorRef = React.useRef<HTMLDivElement>(null);

    const execCmd = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            updateContent();
        }
    };

    const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
        e.preventDefault();
        execCmd(command);
    };

    const handleLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const url = window.prompt("Enter the URL:");
        if (url) {
            execCmd('createLink', url);
        }
    };
    
    const handleEmoji = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const emoji = window.prompt("Enter an emoji to insert:");
        if (emoji) {
            execCmd('insertText', emoji);
        }
    };

    const handleHeadingChange = (value: string) => {
        execCmd('formatBlock', value);
    };

    const updateContent = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            const textContent = editorRef.current.innerText || "";
            setContent(newContent);
            const words = textContent.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
        }
    };
    
    React.useEffect(() => {
        if (editorRef.current && question.defaultValue && editorRef.current.innerHTML !== question.defaultValue) {
            editorRef.current.innerHTML = question.defaultValue;
            updateContent();
        } else {
             updateContent();
        }
    }, [question.defaultValue]);

    const isPlaceholderVisible = content === '' || content === '<br>';
  
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'italic')}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'underline')}><Underline className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyRight')}><AlignRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'justifyFull')}><AlignJustify className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleLink}><LinkIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleEmoji}><Smile className="h-4 w-4" /></Button>
        </div>
        <div className="relative">
             {isPlaceholderVisible && (
                 <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">Enter text here...</div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[200px] w-full resize-y overflow-auto p-3 text-sm ring-offset-background focus-visible:outline-none"
              onInput={updateContent}
            />
        </div>
        <div className="p-2 border-t text-xs text-muted-foreground flex justify-end items-center">
            <span>Words: {wordCount}</span>
        </div>
        <textarea name={question.apiId} value={content} className="hidden" readOnly />
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

export default function PreviewStep({ title, description, pages }: PreviewStepProps) {    
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
