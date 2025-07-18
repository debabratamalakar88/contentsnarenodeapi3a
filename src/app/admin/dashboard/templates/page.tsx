
'use client'

import { 
    MoreHorizontal, 
    ChevronDown, 
    LayoutGrid, 
    Search,
    Layers,
    List,
    PlusCircle,
    Copy,
    Archive as ArchiveIcon,
    ArchiveRestore,
    Trash2,
    Eye,
    PenSquare,
    FileText
} from "lucide-react"
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from 'date-fns';
import { useRouter } from "next/navigation";
import * as React from 'react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getAdminTemplates, 
  getAdminArchivedTemplates,
  getAdminTemplateCategories,
  softDeleteAdminTemplate,
  restoreAdminTemplate,
  forceDeleteAdminTemplate,
  type Template, 
  type TemplateCategory
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { iconList } from "@/components/ui/icon-selector";


const TemplateIconDisplay = ({ iconName, categoryColor }: { iconName?: string | null, categoryColor?: string | null }) => {
    const IconComponent = useMemo(() => {
        if (!iconName) return FileText;
        return iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase())?.icon || FileText;
    }, [iconName]);

    return (
        <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: categoryColor || 'hsl(var(--muted))' }}>
            <IconComponent className="h-5 w-5 text-white" />
        </div>
    );
};


export default function ManageTemplatesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const [currentTab, setCurrentTab] = useState('active');
    const [dataVersion, setDataVersion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<TemplateCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const [templateToArchive, setTemplateToArchive] = useState<Template | null>(null);
    const [templateToRestore, setTemplateToRestore] = useState<Template | null>(null);
    const [templateToForceDelete, setTemplateToForceDelete] = useState<Template | null>(null);

    const refetchData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                if (categories.length === 0) {
                    const cats = await getAdminTemplateCategories(token);
                    setCategories(cats.data);
                }
                
                const fetcher = currentTab === 'active' ? getAdminTemplates : getAdminArchivedTemplates;
                const categorySlug = selectedCategory === 'all' ? undefined : selectedCategory;
                const templatesData = await fetcher(token, { search: searchQuery, category: categorySlug });
                
                setTemplates(templatesData.data || []);
            } catch (err: any) {
                setError(err.message || "Failed to load data.");
                toast({
                    title: "Error",
                    description: err.message || "Could not fetch data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        
        const timer = setTimeout(() => {
            loadData();
        }, 300); // Debounce search

        return () => clearTimeout(timer);

    }, [router, toast, currentTab, dataVersion, categories.length, searchQuery, selectedCategory]);
    

    const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

    const handleArchive = async () => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token || !templateToArchive) return;
        try {
            await softDeleteAdminTemplate(token, templateToArchive.id);
            toast({ title: 'Template archived' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error archiving template', description: err.message });
        } finally {
            setTemplateToArchive(null);
        }
    };

    const handleRestore = async () => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token || !templateToRestore) return;
        try {
            await restoreAdminTemplate(token, templateToRestore.id);
            toast({ title: 'Template restored' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error restoring template', description: err.message });
        } finally {
            setTemplateToRestore(null);
        }
    };

    const handleForceDelete = async () => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token || !templateToForceDelete) return;
        try {
            await forceDeleteAdminTemplate(token, templateToForceDelete.id);
            toast({ title: 'Template permanently deleted' });
            refetchData();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error deleting template', description: err.message });
        } finally {
            setTemplateToForceDelete(null);
        }
    };

    const renderLoadingSkeleton = () => (
        viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}><CardHeader className="p-4 border-b"><Skeleton className="h-8 w-full" /></CardHeader><CardContent className="p-4 pt-4"><div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-2" /></div></CardContent><CardFooter className="p-4 border-t"><Skeleton className="h-6 w-1/4" /></CardFooter></Card>
                ))}
            </div>
        ) : (
            <Card>
                <Table>
                    <TableHeader>{[...Array(1)].map((_, i) => <TableRow key={i}>{[...Array(5)].map((_, j) => <TableHead key={j}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow>)}</TableHeader>
                    <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
                </Table>
            </Card>
        )
    );

    const renderContent = (tpls: Template[], isArchivedTab: boolean) => {
        if (isLoading) {
            return renderLoadingSkeleton();
        }
        if (error) {
            return <div className="text-center text-destructive py-10">{error}</div>;
        }
        if (tpls.length === 0) {
            const message = isArchivedTab ? "No archived templates found" : "No templates found";
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10 bg-background rounded-lg border-2 border-dashed">
                    <h3 className="text-2xl font-bold tracking-tight mb-2">{message}</h3>
                    {!isArchivedTab && (
                        <Button asChild>
                            <Link href="/admin/dashboard/templates/new"><PlusCircle className="mr-2 h-4 w-4"/>Create Template</Link>
                        </Button>
                    )}
                </div>
            );
        }

        const viewProps = {
            templates: tpls,
            onArchive: setTemplateToArchive,
            onRestore: setTemplateToRestore,
            onForceDelete: setTemplateToForceDelete,
            isArchived: isArchivedTab,
        };

        return viewMode === 'grid' ? <TemplatesGrid {...viewProps} /> : <TemplatesTable {...viewProps} />;
    }
    
    const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.title || 'All Categories';

    return (
        <>
            <div className="flex flex-col h-full bg-muted/40">
                <header className="flex items-center gap-4 px-6 py-3 border-b bg-background flex-wrap">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-grow">
                        <TabsList>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2 ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9">
                                    {selectedCategoryName}
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setSelectedCategory('all')}>All Categories</DropdownMenuItem>
                                {categories.map(cat => (
                                    <DropdownMenuItem key={cat.id} onSelect={() => setSelectedCategory(cat.slug)}>
                                        {cat.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2 font-semibold border-primary text-primary bg-primary/10 h-9">
                                    <ViewIcon className="h-4 w-4" />
                                    {viewMode === 'grid' ? 'Grid' : 'List'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search templates..." 
                                className="pl-9 h-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button asChild className="h-9">
                            <Link href="/admin/dashboard/templates/new"><PlusCircle className="h-4 w-4 mr-2"/>New Template</Link>
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                     <Tabs value={currentTab} onValueChange={setCurrentTab}>
                        <TabsContent value="active" className="mt-0">
                            {renderContent(templates, false)}
                        </TabsContent>
                        <TabsContent value="archived" className="mt-0">
                            {renderContent(templates, true)}
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
            
            <AlertDialog open={!!templateToArchive} onOpenChange={(open) => !open && setTemplateToArchive(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Archive Template?</AlertDialogTitle><AlertDialogDescription>This will move the template to the archive. You can restore it later.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!templateToRestore} onOpenChange={(open) => !open && setTemplateToRestore(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Restore Template?</AlertDialogTitle><AlertDialogDescription>This will move the template back to your active list.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!templateToForceDelete} onOpenChange={(open) => !open && setTemplateToForceDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All data for this template will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleForceDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

interface ViewProps {
    templates: Template[];
    isArchived: boolean;
    onArchive: (template: Template) => void;
    onRestore: (template: Template) => void;
    onForceDelete: (template: Template) => void;
}

const TemplatesGrid = ({ templates, isArchived, ...props }: ViewProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {templates.map(template => (
            <TemplateCard key={template.id} template={template} {...props} />
        ))}
         {!isArchived && (
            <Link href="/admin/dashboard/templates/new">
                <div className="flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer border-2 border-dashed hover:border-primary/50 rounded-lg min-h-[160px] h-full text-muted-foreground">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 mb-4">
                        <Layers className="h-8 w-8 text-pink-500" />
                    </div>
                    <Button variant="secondary" className="pointer-events-none bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 font-semibold">ADD NEW TEMPLATE</Button>
                </div>
            </Link>
        )}
    </div>
);

const TemplatesTable = ({ templates, isArchived, ...props }: ViewProps) => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>{isArchived ? "Archived At" : "Last Updated"}</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {templates.map(template => (
                    <TemplateRow key={template.id} template={template} isArchived={isArchived} {...props} />
                ))}
                {!isArchived && (
                    <TableRow>
                        <TableCell colSpan={4} className="py-2">
                            <Link href="/admin/dashboard/templates/new" className="text-primary hover:underline text-sm font-medium">Add new template...</Link>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Card>
);


const TemplateCard = ({ template, onArchive, onRestore, onForceDelete, isArchived }: { template: Template } & Omit<ViewProps, 'templates' | 'isArchived'>) => {
    return (
        <Card className="bg-white hover:shadow-md transition-shadow flex flex-col group">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
                 <div className="flex items-center gap-2">
                    <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
                    <div>
                        <p className="text-sm font-semibold">{template.title}</p>
                    </div>
                 </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                         {isArchived ? (
                            <>
                                <DropdownMenuItem onSelect={() => onRestore(template)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onForceDelete(template)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                            </>
                         ) : (
                            <>
                                <DropdownMenuItem asChild><Link href={`/admin/dashboard/templates/edit/${template.id}/preview`}><Eye className="mr-2 h-4 w-4" />View/Preview</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href={`/admin/dashboard/templates/edit/${template.id}/essentials`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                {/* <DropdownMenuItem onSelect={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem> */}
                                <DropdownMenuItem onSelect={() => onArchive(template)}><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                            </>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow flex flex-col relative min-h-[60px]">
                <p className="text-sm text-muted-foreground line-clamp-3">{template.description || "No description provided."}</p>
            </CardContent>
             <CardFooter className="p-4 border-t">
                 <Badge variant={template.category ? "outline" : "secondary"}>
                    {template.category?.title || 'Uncategorized'}
                </Badge>
            </CardFooter>
        </Card>
    );
};

const TemplateRow = ({ template, onArchive, onRestore, onForceDelete, isArchived }: { template: Template, isArchived: boolean } & Omit<ViewProps, 'templates' | 'isArchived'>) => (
    <TableRow>
        <TableCell className="font-medium flex items-center gap-3">
          <TemplateIconDisplay iconName={template.icon} categoryColor={template.category?.color} />
          {template.title}
        </TableCell>
        <TableCell><Badge variant={template.category ? "outline" : "secondary"}>{template.category?.title || 'Uncategorized'}</Badge></TableCell>
        <TableCell>{template.updated_at ? format(parseISO(template.updated_at), 'PPP') : 'N/A'}</TableCell>
        <TableCell>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                    {isArchived ? (
                        <>
                            <DropdownMenuItem onSelect={() => onRestore(template)}><ArchiveRestore className="mr-2 h-4 w-4" /> Restore</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onForceDelete(template)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" /> Delete Permanently</DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuItem asChild><Link href={`/admin/dashboard/templates/edit/${template.id}/preview`}><Eye className="mr-2 h-4 w-4" />View/Preview</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/admin/dashboard/templates/edit/${template.id}/essentials`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                            {/* <DropdownMenuItem onSelect={() => onDuplicate(template.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem> */}
                            <DropdownMenuItem onSelect={() => onArchive(template)}><ArchiveIcon className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </TableCell>
    </TableRow>
);

    