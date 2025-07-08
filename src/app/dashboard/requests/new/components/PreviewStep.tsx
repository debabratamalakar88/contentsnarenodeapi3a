

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Sparkles, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile, Link2Off, Code, Link as LucideLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';


interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const RichTextEditorPreview = ({ question }: { question: Question }) => {
    const editorRef = useRef<HTMLDivElement>(null);
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
    const [htmlContent, setHtmlContent] = useState(question.defaultValue || '');

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

    const execCmd = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            updateToolbarState();
            setHtmlContent(editorRef.current.innerHTML);
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
            setHtmlContent(editorRef.current!.innerHTML);
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
            setHtmlContent(editorRef.current.innerHTML);
            updateWordCount();
            setSavedRange(null);
        }
    };
    
    const handleHeadingChange = (value: string) => {
        execCmd('formatBlock', value);
    };

    const handleInput = () => {
        if (editorRef.current) {
            setHtmlContent(editorRef.current.innerHTML);
            updateToolbarState();
            updateWordCount();
        }
    }

    const toggleViewMode = () => {
        setViewMode(current => (current === 'editor' ? 'html' : 'editor'));
    };

    useEffect(() => {
        if (viewMode === 'editor' && editorRef.current) {
            if (editorRef.current.innerHTML !== htmlContent) {
                editorRef.current.innerHTML = htmlContent;
            }
            updateWordCount();
            updateToolbarState();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]); 
    
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
    
    const isPlaceholderVisible = viewMode === 'editor' && !htmlContent.replace(/<p><br><\/p>/g, '').trim();

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
          <Button variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleLink}><LucideLink className="h-4 w-4" /></Button>
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
        </div>
        
        {viewMode === 'editor' ? (
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
        ) : (
            <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="prose-preview min-h-[200px] w-full resize-y overflow-auto p-3 font-mono text-xs bg-muted/20 ring-offset-background focus-visible:outline-none"
                placeholder="Enter HTML here..."
            />
        )}

        <div className="p-2 border-t text-xs text-muted-foreground flex justify-end items-center">
            <span>Words: {wordCount}</span>
        </div>
        <textarea name={question.apiId} value={htmlContent} className="hidden" readOnly />
      </div>
    );
};

const DateRangePicker = ({ question }: { question: Question }) => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        // if new start date is after end date, clear end date
        if (endDate && newStartDate > endDate) {
            setEndDate('');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                type="date"
                id={`preview-${question.id}-start`}
                name={`${question.apiId}_start`}
                value={startDate}
                onChange={handleStartDateChange}
            />
            <span>to</span>
            <Input
                type="date"
                id={`preview-${question.id}-end`}
                name={`${question.apiId}_end`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                disabled={!startDate}
            />
        </div>
    );
};

const CurrencyInput = ({ question }: { question: Question }) => {
    const defaultCountry = countries.find(c => c.code === 'US' && c.currency) || countries.find(c => c.currency);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(defaultCountry?.code || '');

    const selectedCountry = countries.find(c => c.code === selectedCountryCode);

    return (
        <div className="flex items-center gap-0 max-w-xs">
            <Select onValueChange={setSelectedCountryCode} defaultValue={selectedCountryCode}>
                <SelectTrigger className="w-[90px] rounded-r-none border-r-0">
                    <SelectValue>
                        {selectedCountry ? <div className="flex items-center gap-2 truncate"><span className="text-lg">{selectedCountry.flag}</span> <span className="text-xs text-muted-foreground">{selectedCountry.currency}</span></div> : '...'}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    {countries.filter(c => c.currency && c.symbol).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{country.flag}</span>
                                <span className="font-medium">{country.name}</span>
                                <span className="text-muted-foreground ml-auto">{country.currency} ({country.symbol})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{selectedCountry?.symbol}</span>
                <Input type="number" id={`preview-${question.id}`} placeholder="100.00" name={question.apiId} className="pl-8 rounded-l-none" />
            </div>
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
             return <AddressAutocompleteInput id={`preview-${question.id}`} placeholder="123 Main St, Anytown, USA" name={question.apiId} defaultValue={question.defaultValue} />;
        case 'number':
             return <Input type="number" id={`preview-${question.id}`} placeholder={question.placeholder} defaultValue={question.defaultValue} name={question.apiId} />;
        case 'currency':
             return <CurrencyInput question={question} />;
        case 'country':
            return (
                <Select name={question.apiId} defaultValue={question.defaultValue}>
                    <SelectTrigger id={`preview-${question.id}`}>
                        <SelectValue placeholder={question.placeholder || "Select a country"} />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
                             <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'date-range':
             return <DateRangePicker question={question} />;
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
