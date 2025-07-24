
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  User,
  PenSquare,
  Copy,
  Trash2,
  Eye,
  Rocket,
  FolderOpen,
  Plus
} from "lucide-react";
import type { MyTemplate, Template } from '@/lib/api';
import { iconList } from '@/components/ui/icon-selector';

const TemplateIconDisplay = ({ iconName, categoryColor, isMyTemplate }: { iconName?: string | null, categoryColor?: string | null, isMyTemplate?: boolean }) => {
    const IconComponent = useMemo(() => {
        if (isMyTemplate) return User;
        if (!iconName) return FolderOpen;
        const foundIcon = iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase());
        return foundIcon ? foundIcon.icon : FolderOpen;
    }, [iconName, isMyTemplate]);

    const bgColor = isMyTemplate ? '#e0f2fe' : (categoryColor ? `${categoryColor}20` : 'hsl(var(--muted))');
    const iconColor = isMyTemplate ? '#0284c7' : (categoryColor || 'hsl(var(--muted-foreground))');

    return (
        <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: bgColor }}>
            <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
        </div>
    );
};

export function MyTemplateCard({ template, onDuplicate, onDelete }: { template: MyTemplate; onDuplicate: () => void; onDelete: () => void; }) {
  return (
    <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
      <CardContent className="p-4 flex gap-4 items-start flex-grow">
        <div className="p-3 rounded-lg flex-shrink-0 bg-blue-100">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">{template.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href={`/dashboard/templates/edit/${template.id}`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href={`/dashboard/templates/edit/${template.id}/preview`}><Eye className="mr-2 h-4 w-4" />Preview</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description || "No description."}</p>
        </div>
      </CardContent>
      <div className="p-2 border-t flex items-center justify-between mt-auto">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/templates/edit/${template.id}/preview`}><Eye className="mr-2 h-4 w-4" />Preview</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/dashboard/requests/new/essentials?myTemplateId=${template.id}`}>Use Template</Link>
        </Button>
      </div>
    </Card>
  );
};

export function TemplateCard({ template, onDuplicate }: { template: Template; onDuplicate: () => void; }) {
  return (
    <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
      <div className="p-4 flex gap-4 items-start flex-grow">
        <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
        <div className="flex-grow">
          <div className="flex justify-between items-start">
              <h3 className="font-semibold">{template.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/dashboard/templates/preview/${template.id}`}><Eye className="mr-2 h-4 w-4" />Preview</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" />Duplicate</Link></DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
        </div>
      </div>
        <div className="p-2 border-t flex items-center justify-between mt-auto">
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/templates/preview/${template.id}`}><Eye className="mr-2 h-4 w-4"/>Preview</Link>
            </Button>
            <Button size="sm" asChild>
                <Link href={`/dashboard/requests/new/essentials?templateId=${template.id}`}>Use Template</Link>
            </Button>
        </div>
    </Card>
  );
};

export function MyTemplatesTable({ templates, onDuplicate, onDelete }: { templates: MyTemplate[]; onDuplicate: (id: number) => void; onDelete: (template: MyTemplate) => void; }) {
    return (
    <Card>
        <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {templates.map(template => (
                    <TableRow key={template.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <TemplateIconDisplay isMyTemplate />
                                <span>{template.title}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-sm">{template.description}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild><Link href={`/dashboard/requests/new/essentials?myTemplateId=${template.id}`}><Rocket className="mr-2 h-4 w-4" />Use Template</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={`/dashboard/templates/edit/${template.id}`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={`/dashboard/templates/edit/${template.id}/preview`}><Eye className="mr-2 h-4 w-4" />Preview</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" />Duplicate</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                 <TableRow>
                    <TableCell colSpan={3} className="py-2">
                        <Link href="/dashboard/templates/new" className="text-primary hover:underline text-sm font-medium flex items-center">
                            <Plus className="mr-1 h-4 w-4" />
                            Create New Template
                        </Link>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Card>
    )
}

export function TemplatesTable({ templates, onDuplicate }: { templates: Template[]; onDuplicate: (id: number) => void; }) {
    return (
     <Card>
        <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {templates.map(template => (
                    <TableRow key={template.id}>
                        <TableCell className="font-medium">
                             <div className="flex items-center gap-3">
                                <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
                                <span>{template.title}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-sm">{template.description}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild><Link href={`/dashboard/requests/new/essentials?templateId=${template.id}`}><Rocket className="mr-2 h-4 w-4" />Use Template</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href={`/dashboard/templates/preview/${template.id}`}><Eye className="mr-2 h-4 w-4" />Preview</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" />Duplicate</Link></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
    )
}
