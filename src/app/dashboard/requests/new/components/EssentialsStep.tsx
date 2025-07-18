

'use client'

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconSelector } from "@/components/ui/icon-selector"
import type { TemplateCategory } from "@/lib/api"


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
    const isTemplateFlow = typeof window !== 'undefined' && window.location.pathname.includes('/admin/dashboard/templates');

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in-50">
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
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-32"
                                placeholder={isTemplateFlow ? 'A short description of what this template is for.' : 'Instructions or a welcome message for your client.'}
                            />
                        </div>
                        {isTemplateFlow && setCategoryId && setIcon && categories && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="category">Category</Label>
                                    <Select 
                                        value={categoryId ? String(categoryId) : ""}
                                        onValueChange={(value) => setCategoryId(value ? Number(value) : null)}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No Category</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
