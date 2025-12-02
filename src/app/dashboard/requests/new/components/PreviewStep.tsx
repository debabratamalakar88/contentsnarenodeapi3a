
'use client';

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
import type { Page, Question } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Smile, Link2Off, Code, Link as LucideLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete-input';
import { countries } from '@/lib/countries';
import { Badge } from '@/components/ui/badge';


interface PreviewStepProps {
    title: string;
    description: string;
    pages: Page[];
}

const RichTextEditorPreview = ({ question }: { question: Question }) => {
    return <div className="prose prose-sm max-w-none p-2 border rounded-md min-h-[60px]" dangerouslySetInnerHTML={{ __html: question.defaultValue || '' }} />;
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
                <div className="space-y-2 pt-2">
                    {question.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <Checkbox id={`preview-${question.id}-${i}`} name={`${question.apiId}[]`} value={opt.value} />
                            <label
                                htmlFor={`preview-${question.id}-${i}`}
                                className="text-sm font-medium leading-none"
                            >
                                {opt.label}
                            </label>
                        </div>
                    ))}
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
            return <Button type={question.buttonType || 'button'} variant={question.buttonVariant || 'default'}>{question.label}</Button>;
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
                {pages.map((page, index) => (
                    <div key={page.id}>
                         <button
                            onClick={() => setActivePageId(index)}
                            className={cn(
                                "w-full text-left flex items-center justify-between text-sm p-2 rounded-md font-semibold",
                                activePageId === index
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
    const [activePageIndex, setActivePageIndex] = useState<number>(0);

    const activePage = pages[activePageIndex];

    return (
        <div className="flex h-full bg-background animate-in fade-in-50">
            <PreviewSidebar pages={pages} activePageId={activePageIndex} setActivePageId={setActivePageIndex} />
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                     <h2 className="text-3xl font-bold mb-4">{title}</h2>
                    {description && (
                         <div className="mt-4 p-6 border rounded-md h-[250px] overflow-y-auto mb-6 bg-slate-50 shadow-sm">
                            <div className="text-muted-foreground prose-preview" dangerouslySetInnerHTML={{ __html: description }} />
                        </div>
                    )}
                    <Card>
                        <CardHeader>
                            <CardTitle>{activePage?.title}</CardTitle>
                            {activePage?.instructions && <CardDescription>{activePage.instructions}</CardDescription>}
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {activePage ? (
                                <div key={activePage.id}>
                                    <div className="space-y-6">
                                        {activePage.sections.map(section => (
                                            <div key={section.id}>
                                                <h4 className="text-lg font-semibold mb-2">{section.title}</h4>
                                                {section.questions.map(question => (
                                                    <div key={question.id} className="grid gap-2 mb-4">
                                                        {question.type !== 'formatted-text' && question.type !== 'button' && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    {question.required && <Badge variant="destructive">Required</Badge>}
                                                                    {question.showPlaceholder && question.placeholder && <Badge variant="secondary">Placeholder</Badge>}
                                                                    {question.showLengthValidation && question.minLength && <Badge variant="outline">Min: {question.minLength}</Badge>}
                                                                    {question.showLengthValidation && question.maxLength && <Badge variant="outline">Max: {question.maxLength}</Badge>}
                                                                </div>
                                                                <Label htmlFor={`preview-${question.id}`}>
                                                                    {question.label}
                                                                </Label>
                                                            </div>
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
