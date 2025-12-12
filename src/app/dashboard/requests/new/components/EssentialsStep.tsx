
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
import { Bold, Italic, Underline, List as ListIcon, ListOrdered, Link as LinkIcon, Link2Off, Smile, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify, Expand, Shrink } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker from "emoji-picker-react"
import { cn } from "@/lib/utils"

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    const [wordCount, setWordCount] = useState(0);
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
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const toggleFullScreen = () => setIsFullScreen(prev => !prev);


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

    const updateWordCount = useCallback(() => {
        if (editorRef.current) {
            const textContent = editorRef.current.innerText || "";
            const words = textContent.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
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
            updateWordCount();
        }
    };

    const handleFormat = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
        e.preventDefault();
        execCmd(command);
    };

    const handleLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const selection = window.getSelection();
        let rangeToSave: Range | null = null;
        if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
            rangeToSave = selection.getRangeAt(0).cloneRange();
        }

        const url = window.prompt("Enter the URL:", "https://");

        if (url) {
            editorRef.current?.focus();
            if(rangeToSave) {
                const currentSelection = window.getSelection();
                if (currentSelection) {
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(rangeToSave);
                }
            }
            document.execCommand('createLink', false, url);
            updateToolbarState();
            const newContent = editorRef.current!.innerHTML;
            setHtmlContent(newContent);
            onChange(newContent);
            updateWordCount();
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
            const newContent = editorRef.current.innerHTML;
            setHtmlContent(newContent);
            onChange(newContent);
            updateWordCount();
            setSavedRange(null);
        }
    };
    
    const handleHeadingChange = (value: string) => {
        execCmd('formatBlock', value);
    };

    const handleBlur = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            onChange(newContent);
        }
    };

    const toggleViewMode = () => {
        setViewMode(current => (current === 'editor' ? 'html' : 'editor'));
    };

    useEffect(() => {
        if (editorRef.current) {
            if (isInitialMount.current || editorRef.current.innerHTML !== htmlContent) {
                 editorRef.current.innerHTML = htmlContent || '';
                 isInitialMount.current = false;
            }
            updateWordCount();
            updateToolbarState();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [htmlContent, viewMode]); 
    
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
        }

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            if (editor) {
                editor.removeEventListener('focus', updateToolbarState);
            }
        };
    }, [updateToolbarState]);
    
    const isPlaceholderVisible = viewMode === 'editor' && !(htmlContent || '').replace(/<p><br><\/p>/g, '').trim();

    return (
      <div className={cn(
          "rounded-md border border-input bg-background flex flex-col transition-all duration-300",
          isFullScreen && "fixed inset-0 z-50 h-screen w-screen"
        )}>
        <div className="p-2 border-b flex items-center gap-1 text-muted-foreground flex-wrap">
          <Select onValueChange={handleHeadingChange} defaultValue="p">
              <SelectTrigger className="w-[120px] h-8 text-sm focus:ring-0 focus:ring-offset-0 border-none shadow-none">
                  <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="p">Normal</SelectItem>
                  <SelectItem value="blockquote">Blockquote</SelectItem>
                  <SelectItem value="pre">Code</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="h4">Heading 4</SelectItem>
                  <SelectItem value="h5">Heading 5</SelectItem>
              </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={isBold ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'bold')}><Bold className="h-4 w-4" /></Button>
          <Button variant={isItalic ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'italic')}><Italic className="h-4 w-4" /></Button>
          <Button variant={isUnderline ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'underline')}><Underline className="h-4 w-4" /></Button>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={isUl ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onMouseDown={(e) => handleFormat(e, 'insertUnorderedList')}><ListIcon className="h-4 w-4" /></Button>
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
           <Separator orientation="vertical" className="h-5 mx-1" />
          <Button variant={viewMode === 'html' ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={toggleViewMode} title="Toggle HTML View">
              <Code className="h-4 w-4" />
          </Button>
           <div className="ml-auto">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullScreen} title="Toggle Fullscreen">
                {isFullScreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
             </Button>
           </div>
        </div>
        
        <div className={cn("flex-1 overflow-y-auto", isFullScreen && "h-[calc(100vh-80px)]")}>
        {viewMode === 'editor' ? (
            <div className="relative h-full">
                 {isPlaceholderVisible && (
                     <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">Enter text here...</div>
                )}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={cn("prose-preview min-h-[200px] w-full resize-y p-3 ring-offset-background focus-visible:outline-none", isFullScreen && "h-full")}
                  onBlur={handleBlur}
                />
            </div>
        ) : (
            <textarea
                value={htmlContent || ''}
                onChange={(e) => {
                    setHtmlContent(e.target.value);
                    onChange(e.target.value);
                }}
                className={cn("prose-preview min-h-[200px] w-full resize-y p-3 font-mono text-xs bg-muted/20 ring-offset-background focus-visible:outline-none", isFullScreen && "h-full")}
                placeholder="Enter HTML here..."
            />
        )}
        </div>

        <div className="p-2 border-t text-xs text-muted-foreground flex justify-end items-center">
            <span>Words: {wordCount}</span>
        </div>
        <textarea name="description" value={htmlContent || ''} className="hidden" readOnly />
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
    const isTemplateFlow = typeof window !== 'undefined' && (window.location.pathname.includes('/admin/dashboard/templates') || window.location.pathname.includes('/dashboard/templates/new') || window.location.pathname.includes('/dashboard/templates/edit'));
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
