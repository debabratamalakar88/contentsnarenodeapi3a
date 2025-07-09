
'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequest, getClients, type Request, type Question, type Client, type Page } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile, Link2Off, Code, Link as LucideLink, Loader2, CalendarDays, Mail, Phone, Clipboard, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { IconSelector } from '@/components/ui/icon-selector';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
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
    const questionId = `q-${question.id}`;
    const questionName = question.apiId || questionId;

    switch(question.type) {
        case 'text':
            return <Input id={questionId} name={questionName} type="text" placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'textarea':
            return <Textarea id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'file':
            return <Input id={questionId} name={questionName} type="file" required={question.required} />;
        case 'checkbox':
            return (
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`${questionId}-${i}`} name={`${questionName}[]`} value={opt.value} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </div>
            );
        case 'dropdown':
            return (
                <Select name={questionName} defaultValue={question.defaultValue} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
                    <SelectContent>{question.options?.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date':
            return <Input id={questionId} name={questionName} type="date" defaultValue={question.defaultValue} required={question.required} className="max-w-[240px]" />;
        case 'email':
            return <Input id={questionId} name={questionName} type="email" placeholder={question.placeholder || "email@example.com"} defaultValue={question.defaultValue} required={question.required} />;
        case 'tel':
            return <Input id={questionId} name={questionName} type="tel" placeholder={question.placeholder || "(123) 456-7890"} defaultValue={question.defaultValue} required={question.required} />;
        case 'url':
            return <Input id={questionId} name={questionName} type="url" placeholder={question.placeholder || "https://example.com"} defaultValue={question.defaultValue} required={question.required} />;
        case 'radio':
            return (
                <RadioGroup name={questionName} defaultValue={question.defaultValue}>
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2 pt-2">
                            <RadioGroupItem value={opt.value} id={`${questionId}-${i}`} />
                            <label htmlFor={`${questionId}-${i}`} className="text-sm font-medium leading-none">{opt.label}</label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case 'formatted-text':
             return <RichTextEditorPreview question={question} />;
        case 'image-upload':
             return <Input id={questionId} name={questionName} type="file" accept="image/*" required={question.required} multiple />;
        case 'address':
             return <AddressAutocompleteInput id={questionId} name={questionName} placeholder={question.placeholder} defaultValue={question.defaultValue} />;
        case 'number':
             return <Input id={questionId} name={questionName} type="number" placeholder={question.placeholder} defaultValue={question.defaultValue} required={question.required} />;
        case 'currency':
             return <CurrencyInput question={question} />;
        case 'country':
            return (
                <Select name={questionName} defaultValue={question.defaultValue} required={question.required}>
                    <SelectTrigger id={questionId}><SelectValue placeholder={question.placeholder || "Select a country"} /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c.code} value={c.code}><div className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></div></SelectItem>)}</SelectContent>
                </Select>
            );
        case 'date-range':
             return <DateRangePicker question={question} />;
        case 'icon-selector':
            return <IconSelector name={questionName} defaultValue={question.defaultValue} />;
        case 'color-picker':
            return (
                <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-10 p-1" defaultValue={question.defaultValue || '#000000'} />
                    <Input type="text" name={questionName} placeholder="#000000" defaultValue={question.defaultValue || '#000000'} className="max-w-[150px]"/>
                </div>
            );
        case 'button':
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
        default:
            return <div className="text-sm text-red-500">Unsupported field type: {question.type}</div>;
    }
}

interface ViewSidebarProps {
  request: Request;
  assignedClients: Client[];
  pages: Page[];
  activePageId: number | null;
  setActivePageId: (id: number) => void;
}

const ViewSidebar = ({ request, assignedClients, pages, activePageId, setActivePageId }: ViewSidebarProps) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [publicUrl, setPublicUrl] = useState('');

    useEffect(() => {
        if (request?.status === 'published' && request.request_code) {
            setPublicUrl(`${window.location.origin}/request/share/${request.request_code}`);
        } else {
            setPublicUrl('');
        }
    }, [request]);

    const handleCopy = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast({ title: "Copied to clipboard!", description: "The public URL has been copied." });
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <aside className="w-72 flex-shrink-0 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg leading-tight">{request.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{request.description}</p>
                {request.due_date && (
                    <div className="text-xs font-medium text-muted-foreground mt-3 flex items-center">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        Due: {format(parseISO(request.due_date), 'PPP')}
                    </div>
                )}
                 {request.status === 'published' && request.request_code && publicUrl && (
                    <div className="mt-4">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Public URL</Label>
                        <div className="flex items-center gap-1 mt-1">
                             <div className="flex h-8 w-full items-center truncate rounded-md border border-input bg-muted/50 px-3 text-xs ring-offset-background">
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate hover:underline"
                                    title={publicUrl}
                                >
                                    {publicUrl}
                                </a>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {assignedClients.length > 0 && (
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Clients</h3>
                    <div className="space-y-2">
                        {assignedClients.map(client => (
                            <div key={client.id} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-pink-100 text-pink-700">{getInitials(client.full_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{client.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{client.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex-grow p-2 space-y-1 overflow-y-auto">
                <h3 className="font-semibold text-xs px-2 mb-1 uppercase text-muted-foreground">Pages</h3>
                {pages.map(page => (
                    <button
                        key={page.id}
                        onClick={() => setActivePageId(page.id)}
                        className={cn("w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-semibold", activePageId === page.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent/50")}
                    >
                        <span className="truncate">{page.title}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}

export default function ViewRequestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const id = Number(params.id);

    const [request, setRequest] = useState<Request | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePageId, setActivePageId] = useState<number | null>(null);
    
    useEffect(() => {
        if (!id) { router.push('/dashboard/requests'); return; }
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        async function fetchRequestData() {
            try {
                const [requestData, clientsData] = await Promise.all([
                    getRequest(token!, id),
                    getClients(token!)
                ]);

                setRequest(requestData);
                setClients(clientsData || []);

                if (requestData.form_data?.length > 0) {
                    setActivePageId(requestData.form_data[0].id);
                }
            } catch (err: any) {
                const message = err.message || 'Failed to load request data.';
                setError(message);
                toast({ variant: 'destructive', title: 'Error', description: message });
            } finally {
                setIsLoading(false);
            }
        }
        fetchRequestData();
    }, [id, router, toast]);

    const assignedClients = useMemo(() => {
        if (!request?.client_id || !clients) return [];
        return clients.filter(c => request.client_id!.includes(c.id));
    }, [request, clients]);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        // Placeholder for submission logic.
        // The API for submitting responses is not defined in the provided documentation.
        // For now, we just show a success message.
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ title: 'Form Submitted', description: 'Your response has been recorded (simulation).' });
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="p-6 h-full flex flex-col">
                <header className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4"><Skeleton className="h-9 w-9" /></div>
                </header>
                <div className="flex flex-1"><Skeleton className="w-64" /><div className="flex-1 p-6"><Skeleton className="h-full w-full" /></div></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/40 p-4 text-center">
                <Card className="w-full max-w-md"><CardHeader><CardTitle className="text-destructive">Request Not Found</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent><Button asChild><a href="/dashboard/requests">Back to Requests</a></Button></CardContent></Card>
            </div>
        );
    }

    if (!request || !request.form_data) {
        return <div className="p-6 text-center text-muted-foreground">Request data is not available.</div>;
    }

    const activePage = request.form_data.find(p => p.id === activePageId);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/40">
            <header className="flex items-center gap-4 px-6 py-3 border-b bg-background sticky top-0 z-10">
                <Button variant="outline" size="icon" asChild><a href="/dashboard/requests"><ArrowLeft className="h-4 w-4" /></a></Button>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
                <ViewSidebar request={request} assignedClients={assignedClients} pages={request.form_data} activePageId={activePageId} setActivePageId={setActivePageId} />
                <main className="flex-1 p-6 overflow-y-auto">
                    <form className="max-w-3xl mx-auto" onSubmit={handleFormSubmit}>
                        {activePage ? (
                            <Card>
                                <CardHeader><CardTitle>{activePage.title}</CardTitle>{activePage.instructions && <CardDescription>{activePage.instructions}</CardDescription>}</CardHeader>
                                <CardContent className="space-y-8">
                                    {activePage.sections.map(section => (
                                        <div key={section.id}>
                                            <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                                            {section.instructions && <p className="text-sm text-muted-foreground mt-1 mb-4">{section.instructions}</p>}
                                            {section.questions.map(question => (
                                                <div key={question.id} className="grid gap-2 mb-4">
                                                    {question.type !== 'button' && question.type !== 'formatted-text' && <Label htmlFor={`q-${question.id}`}>{question.label}{question.required && <span className="text-destructive"> *</span>}</Label>}
                                                    {question.instructions && <p className="text-sm text-muted-foreground">{question.instructions}</p>}
                                                    {renderQuestionInput(question)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Page
                                    </Button>
                                </CardFooter>
                            </Card>
                        ) : (
                             <p className="text-muted-foreground text-center py-10">Select a page to view its content.</p>
                        )}
                    </form>
                </main>
            </div>
        </div>
    );
}
