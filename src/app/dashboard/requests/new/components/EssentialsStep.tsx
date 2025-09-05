
'use client'

import React, { useState, useRef, useCallback, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSelector } from "@/components/ui/icon-selector"
import type { TemplateCategory } from "@/lib/api"
import { Bold, Italic, Underline, List as ListIcon, ListOrdered, Link as LinkIcon, Link2Off, Smile, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker from "emoji-picker-react"
import { cn } from "@/lib/utils"

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isUl, setIsUl] = useState(false);
    const [isOl, setIsOl] = useState(false);
    const [isLeftAligned, setIsLeftAligned] = useState(true);
    const [isCenterAligned, setIsCenterAligned] = useState(false);
    const [isRightAligned, setIsRightAligned] = useState(false);
    const [isJustifyAligned, setIsJustifyAligned] = useState(false);
    
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    const [viewMode, setViewMode] = useState<'editor' | 'html'>('editor');
    const [htmlContent, setHtmlContent] = useState(value || '');

    useEffect(() => {
        setHtmlContent(value);
    }, [value]);

    const updateToolbarState = useCallback(() => {
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

    const execCmd = (command: string, valueArg?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, valueArg);
            const newContent = editorRef.current.innerHTML;
            setHtmlContent(newContent);
            onChange(newContent);
            updateToolbarState();
        }
    };
    
    const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
        e.preventDefault();
        execCmd(command);
    };

    const handleLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const url = window.prompt("Enter the URL:", "https://");
        if (url) {
            execCmd('createLink', url);
        }
    };

     const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setHtmlContent(newContent);
            onChange(newContent);
        }
    };
    
     useEffect(() => {
        const editor = editorRef.current;
        const handleSelectionChange = () => {
            if (document.activeElement === editor) {
                updateToolbarState();
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        if (editor) {
            editor.addEventListener('focus', updateToolbarState);
            editor.addEventListener('input', updateToolbarState);
        }

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
             if (editor) {
                editor.removeEventListener('focus', updateToolbarState);
                editor.removeEventListener('input', updateToolbarState);
            }
        };
    }, [updateToolbarState]);

    const toggleViewMode = () => {
        setViewMode(current => (current === 'editor' ? 'html' : 'editor'));
    };

    useEffect(() => {
        if (viewMode === 'editor' && editorRef.current) {
            if (editorRef.current.innerHTML !== htmlContent) {
                editorRef.current.innerHTML = htmlContent;
            }
        }
    }, [viewMode, htmlContent]);
    
    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setHtmlContent(newContent);
        onChange(newContent);
    };

    return (
        <div className="rounded-md border border-input bg-background">
            <div className="p-2 border-b flex items-center gap-1 text-muted-foreground flex-wrap">
                <Button variant={isBold ? "secondary" : "ghost"} size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></Button>
                <Button variant={isItalic ? "secondary" : "ghost"} size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleFormat(e, 'italic')}><Italic className="h-4 w-4" /></Button>
                <Button variant={isUnderline ? "secondary" : "ghost"} size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleFormat(e, 'underline')}><Underline className="h-4 w-4" /></Button>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant={isUl ? "secondary" : "ghost"} size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}><ListIcon className="h-4 w-4" /></Button>
                <Button variant={isOl ? "secondary" : "ghost"} size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleFormat(e, 'insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                 <Separator orientation="vertical" className="h-5 mx-1" />
                 <Button variant="ghost" size="icon" className="h-8 w-8" type="button" onMouseDown={(e) => handleLink(e)}><LinkIcon className="h-4 w-4" /></Button>
                 <Separator orientation="vertical" className="h-5 mx-1" />
                <Button variant={viewMode === 'html' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={toggleViewMode} title="Toggle HTML View">
                    <Code className="h-4 w-4" />
                </Button>
            </div>
            {viewMode === 'editor' ? (
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="prose-preview min-h-[200px] w-full p-3 ring-offset-background focus-visible:outline-none"
                    onInput={handleInput}
                />
            ) : (
                <textarea
                    value={htmlContent}
                    onChange={handleHtmlChange}
                    className="prose-preview min-h-[200px] w-full p-3 font-mono text-xs bg-muted/20 ring-offset-background focus-visible:outline-none"
                    placeholder="Enter HTML here..."
                />
            )}
        </div>
    );
};


interface EssentialsStepProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    categoryId?: number | null;
    setCategoryId?: (id: number | null) => void;
    icon?: string;
    setIcon?: (icon: string) => void;
    categories?: TemplateCategory[];
}

export default function EssentialsStep({ title, setTitle, description, setDescription, categoryId, setCategoryId, icon, setIcon, categories }: EssentialsStepProps) {
    const isTemplateFlow = typeof window !== 'undefined' && (window.location.pathname.includes('/admin/dashboard/templates') || window.location.pathname.includes('/dashboard/templates/new'));
    const noCategoryValue = "__none__";

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-50 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>{isTemplateFlow ? 'Template Essentials' : 'Request Essentials'}</CardTitle>
                    <CardDescription>
                       {isTemplateFlow ? 'Give your template a clear title and description.' : 'Give your request a clear title and description for your clients.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="title">{isTemplateFlow ? 'Template Title' : 'Request Title'}</Label>
                            <Input
                                id="title"
                                type="text"
                                className="w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={isTemplateFlow ? 'e.g., Client Onboarding Checklist' : 'e.g., New Client Onboarding'}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <RichTextEditor value={description} onChange={setDescription} />
                        </div>
                        {isTemplateFlow && setIcon && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {setCategoryId && categories && (
                                    <div className="grid gap-3">
                                        <Label htmlFor="category">Category</Label>
                                        <Select 
                                            value={categoryId ? String(categoryId) : noCategoryValue}
                                            onValueChange={(value) => setCategoryId(value === noCategoryValue ? null : Number(value))}
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={noCategoryValue}>No Category</SelectItem>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="grid gap-3">
                                    <Label htmlFor="icon">Icon</Label>
                                    <IconSelector
                                        defaultValue={icon}
                                        onValueChange={setIcon}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
