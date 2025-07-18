
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
  type LucideIcon,
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
import { format, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { iconList } from '@/components/ui/icon-selector'

const CategoryIcon = ({ iconName }: { iconName: string | undefined }) => {
    if (!iconName) return null;
    const IconComponent = iconList.find(i => i.name.toLowerCase() === iconName.toLowerCase())?.icon;
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />
}

export default function ManageTemplateCategoriesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState('active')
  const [dataVersion, setDataVersion] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')

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
        return <LoadingSkeleton />
    }

    if (categories.length === 0) {
        return (
             <div className="text-center py-10">
                <p className="text-muted-foreground">No {isArchived ? 'archived' : ''} categories found.</p>
                {!isArchived && <Button asChild className="mt-4"><Link href="/admin/dashboard/template-categories/new">Create a Category</Link></Button>}
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>{isArchived ? 'Archived At' : 'Created At'}</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category) => {
                    const dateString = isArchived ? category.deleted_at : category.created_at;
                    return (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.title}</TableCell>
                            <TableCell><CategoryIcon iconName={category.icon} /></TableCell>
                            <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-xs">{category.description}</TableCell>
                            <TableCell>{dateString ? format(parseISO(dateString), 'PPP') : 'N/A'}</TableCell>
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
                                            <DropdownMenuItem onSelect={() => setCategoryToRestore(category)}><ArchiveRestore className="mr-2 h-4 w-4" />Restore</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setCategoryToForceDelete(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem asChild><Link href={`/admin/dashboard/template-categories/${category.id}/edit`}><PenSquare className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setCategoryToArchive(category)} className="text-destructive focus:text-destructive focus:bg-destructive focus:text-destructive-foreground"><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-2xl font-bold">Template Categories</h1>
                <p className="text-muted-foreground">Manage your template categories.</p>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search categories..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                <Button asChild>
                    <Link href="/admin/dashboard/template-categories/new"><PlusCircle className="mr-2 h-4 w-4"/>Add Category</Link>
                </Button>
            </div>
        </div>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">{renderContent(false)}</TabsContent>
          <TabsContent value="archived">{renderContent(true)}</TabsContent>
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

function LoadingSkeleton() {
    return (
         <Table>
          <TableHeader><TableRow>{[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}</TableRow></TableHeader>
          <TableBody>{[...Array(5)].map((_, i) => (<TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>))}</TableBody>
        </Table>
    )
}

