
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  MoreHorizontal,
  Loader2,
  PlusCircle,
  Search,
  Archive,
  ArchiveRestore,
  Trash2,
  PenSquare,
  LayoutGrid,
  List,
  ChevronDown,
  Layers,
  Eye,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getAdminTemplateCategories,
  getAdminArchivedTemplateCategories,
  softDeleteAdminTemplateCategory,
  restoreAdminTemplateCategory,
  forceDeleteAdminTemplateCategory,
  type TemplateCategory,
} from '@/lib/api'
import { format, parseISO, isValid } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const CategoryIcon = ({ color }: { color?: string }) => {
    if (!color) return <div className="h-4 w-4 rounded-full bg-muted-foreground" />;
    return <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />;
}

export default function ManageTemplateCategoriesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState('active')
  const [dataVersion, setDataVersion] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [categoryToArchive, setCategoryToArchive] = useState<TemplateCategory | null>(null)
  const [categoryToRestore, setCategoryToRestore] = useState<TemplateCategory | null>(null)
  const [categoryToForceDelete, setCategoryToForceDelete] = useState<TemplateCategory | null>(null)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminAuthToken') : null
  const router = useRouter()

  const refetchData = () => setDataVersion((v) => v + 1)

  useEffect(() => {
    async function fetchCategories() {
      if (!token) {
        toast({ title: 'Authentication Error', variant: 'destructive' })
        setIsLoading(false)
        router.push('/admin/login')
        return
      }

      setIsLoading(true)
      try {
        const fetchFunction =
          currentTab === 'active'
            ? getAdminTemplateCategories
            : getAdminArchivedTemplateCategories
        
        const fetchedCategories = await fetchFunction(token, searchQuery)
        
        setCategories(fetchedCategories.data || fetchedCategories || [])
      } catch (error: any) {
        toast({
          title: `Failed to fetch ${
            currentTab === 'active' ? 'active' : 'archived'
          } categories`,
          description: error.message || 'Could not fetch category data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchCategories();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [toast, currentTab, dataVersion, token, router, searchQuery])

  const handleArchive = async () => {
    if (!token || !categoryToArchive) return
    try {
      await softDeleteAdminTemplateCategory(token, categoryToArchive.id)
      toast({
        title: 'Category Archived',
        description: 'The category has been moved to the archived list.',
      })
      refetchData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setCategoryToArchive(null)
    }
  }

  const handleRestore = async () => {
    if (!token || !categoryToRestore) return
    try {
      await restoreAdminTemplateCategory(token, categoryToRestore.id)
      toast({
        title: 'Category Restored',
        description: 'The category has been successfully restored.',
      })
      refetchData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setCategoryToRestore(null)
    }
  }

  const handleForceDelete = async () => {
    if (!token || !categoryToForceDelete) return
    try {
      await forceDeleteAdminTemplateCategory(token, categoryToForceDelete.id)
      toast({
        title: 'Category Permanently Deleted',
        description: 'The category has been removed.',
      })
      refetchData()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setCategoryToForceDelete(null)
    }
  }

  const renderContent = (isArchived: boolean) => {
    if (isLoading) {
        return <LoadingSkeleton view={viewMode} />
    }

    if (categories.length === 0) {
        return (
             <div className="text-center py-10">
                <p className="text-muted-foreground">No {isArchived ? 'archived' : ''} categories found.</p>
                {!isArchived && <Button asChild className="mt-4"><Link href="/admin/dashboard/template-categories/new">Create a Category</Link></Button>}
            </div>
        )
    }

    const viewProps = {
        categories,
        isArchived,
        onArchive: setCategoryToArchive,
        onRestore: setCategoryToRestore,
        onForceDelete: setCategoryToForceDelete,
    };

    return viewMode === 'grid' ? <CategoriesGrid {...viewProps} /> : <CategoriesTable {...viewProps} />
  }
  
  const ViewIcon = viewMode === 'grid' ? LayoutGrid : List;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
          <div className="flex items-center p-6 pb-0 border-b bg-card">
              <TabsList className="bg-transparent p-0">
                  <TabsTrigger value="active" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">ACTIVE</TabsTrigger>
                  <TabsTrigger value="archived" className="bg-transparent pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">ARCHIVED</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2 mb-2">
                 <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search categories..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                          <ViewIcon className="h-4 w-4" />
                          <span>View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setViewMode('grid')}>Grid</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setViewMode('list')}>List</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button asChild>
                    <Link href="/admin/dashboard/template-categories/new"><PlusCircle className="mr-2 h-4 w-4"/>Add Category</Link>
                </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-muted/40">
            <TabsContent value="active">{renderContent(false)}</TabsContent>
            <TabsContent value="archived">{renderContent(true)}</TabsContent>
          </div>
        </Tabs>
      </div>

      <AlertDialog open={!!categoryToArchive} onOpenChange={(open) => !open && setCategoryToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the category. It can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={!!categoryToRestore} onOpenChange={(open) => !open && setCategoryToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the category to the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!categoryToForceDelete} onOpenChange={(open) => !open && setCategoryToForceDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleForceDelete}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface CategoryViewProps {
  categories: TemplateCategory[];
  isArchived: boolean;
  onArchive: (category: TemplateCategory) => void;
  onRestore: (category: TemplateCategory) => void;
  onForceDelete: (category: TemplateCategory) => void;
}


function CategoriesGrid({ categories, isArchived, onArchive, onRestore, onForceDelete }: CategoryViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map(category => (
        <Card key={category.id} className="relative group">
          <CardContent className="flex flex-col items-center text-center p-6 gap-3">
             <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator />
                 {isArchived ? (
                    <>
                        <DropdownMenuItem onSelect={() => onRestore(category)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onForceDelete(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild><Link href={`/admin/dashboard/template-categories/${category.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/admin/dashboard/template-categories/${category.id}/edit`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onArchive(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100">
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: category.color || 'hsl(var(--muted-foreground))' }} />
            </div>
            <h3 className="font-semibold text-lg">{category.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{category.description}</p>
          </CardContent>
        </Card>
      ))}
      {!isArchived && (
         <Link href="/admin/dashboard/template-categories/new">
          <Card className="flex flex-col items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50 min-h-[224px] h-full">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4"><Layers className="h-8 w-8 text-slate-400" /></div>
            <Button variant="secondary" className="pointer-events-none bg-primary/10 text-primary hover:bg-primary/20">ADD NEW CATEGORY</Button>
          </Card>
        </Link>
      )}
    </div>
  )
}

function CategoriesTable({ categories, isArchived, onArchive, onRestore, onForceDelete }: CategoryViewProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>{isArchived ? 'Archived At' : 'Created At'}</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {categories.map((category) => {
                const dateString = isArchived ? category.deleted_at : category.created_at;
                const dateToFormat = dateString ? parseISO(dateString) : null;
                return (
                    <TableRow key={category.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <CategoryIcon color={category.color} />
                                <span>{category.title}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-xs">{category.description}</TableCell>
                        <TableCell>{dateToFormat && isValid(dateToFormat) ? format(dateToFormat, 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {isArchived ? (
                                    <>
                                        <DropdownMenuItem onSelect={() => onRestore(category)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onForceDelete(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild><Link href={`/admin/dashboard/template-categories/${category.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></DropdownMenuItem>
                                        <DropdownMenuItem asChild><Link href={`/admin/dashboard/template-categories/${category.id}/edit`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onArchive(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
            {!isArchived && (
              <TableRow>
                <TableCell colSpan={6} className="py-4">
                  <Link href="/admin/dashboard/template-categories/new" className="text-primary hover:underline text-sm font-medium">Add a category...</Link>
                </TableCell>
              </TableRow>
            )}
        </TableBody>
      </Table>
    </Card>
  )
}

function LoadingSkeleton({ view }: { view: 'grid' | 'list'}) {
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
             <Card key={i}><CardContent className="flex flex-col items-center text-center p-6 gap-3"><Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          ))}
        </div>
      )
    }
    return (
        <Card>
            <Table>
                <TableHeader><TableRow>{[...Array(4)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
                <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
            </Table>
        </Card>
    )
}

    
