

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, MoreHorizontal, Eye, Edit, Copy, Trash2, FolderOpen, Rocket, PlusCircle } from "lucide-react";
import type { Template, MyTemplate } from '@/lib/api';
import { iconList } from '@/components/ui/icon-selector';

// Props Interfaces
interface MyTemplateCardProps {
  template: MyTemplate;
  onDuplicate: (id: number) => void;
  onDelete: (template: MyTemplate) => void;
  onPreview: () => void;
  onSelect: () => void;
  canManage: boolean;
}

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
  onPreview: () => void;
  onDuplicate: (id: number) => void;
  canManage: boolean;
}


interface MyTemplatesTableProps {
  templates: MyTemplate[];
  onDuplicate: (id: number) => void;
  onDelete: (template: MyTemplate) => void;
  onPreview: (template: MyTemplate) => void;
  onSelect: (id: number) => void;
  canManage: boolean;
}

interface TemplatesTableProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onPreview: (template: Template) => void;
  onDuplicate: (id: number) => void;
  canManage: boolean;
}

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

// MyTemplateCard Component
export function MyTemplateCard({ template, onDuplicate, onDelete, onPreview, onSelect, canManage }: MyTemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <TemplateIconDisplay isMyTemplate={true} />
          <h3 className="font-semibold">{template.title}</h3>
        </div>
        {canManage && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href={`/dashboard/templates/edit/${template.id}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description || "No description provided."}</p>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
         <Button variant="ghost" size="sm" onClick={onPreview}><Eye className="mr-2 h-4 w-4"/>Preview</Button>
         {canManage && (
            <Button size="sm" onClick={onSelect}>
                <Rocket className="mr-2 h-4 w-4" /> Use Template
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}

// TemplateCard Component (Public Templates)
export function TemplateCard({ template, onSelect, onPreview, onDuplicate, canManage }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow group flex flex-col bg-card">
       <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
          <h3 className="font-semibold">{template.title}</h3>
        </div>
        {canManage && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
        <Button variant="ghost" size="sm" onClick={onPreview}><Eye className="mr-2 h-4 w-4" /> Preview</Button>
        {canManage && (
            <Button size="sm" onClick={onSelect}>
                <Rocket className="mr-2 h-4 w-4" /> Use Template
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// MyTemplatesTable Component
export function MyTemplatesTable({ templates, onDuplicate, onDelete, onPreview, onSelect, canManage }: MyTemplatesTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">
                 <div className="flex items-center gap-3">
                    <TemplateIconDisplay isMyTemplate={true} />
                    <span>{template.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-sm truncate">{template.description || "No description"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canManage && <DropdownMenuItem onClick={() => onSelect(template.id)}><Rocket className="mr-2 h-4 w-4" />Use Template</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => onPreview(template)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                    {canManage && (
                        <>
                            <DropdownMenuItem asChild><Link href={`/dashboard/templates/edit/${template.id}`}><Edit className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(template)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {canManage && (
            <TableRow>
                <TableCell colSpan={3}>
                    <Button variant="link" asChild className="p-0 h-auto font-medium">
                        <Link href="/dashboard/templates/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Template
                        </Link>
                    </Button>
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// TemplatesTable Component (Public)
export function TemplatesTable({ templates, onSelect, onPreview, onDuplicate, canManage }: TemplatesTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">
                 <div className="flex items-center gap-3">
                    <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
                    <span>{template.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-sm truncate">{template.description}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canManage && <DropdownMenuItem onClick={() => onSelect(template)}><Rocket className="mr-2 h-4 w-4" />Use Template</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => onPreview(template)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                    {canManage && <DropdownMenuItem onClick={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
