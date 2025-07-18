
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

interface EssentialsStepProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
}

export default function EssentialsStep({ title, setTitle, description, setDescription }: EssentialsStepProps) {
    const isTemplateFlow = window.location.pathname.includes('/admin/dashboard/templates');

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
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-32"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
