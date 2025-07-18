
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  getAdminTemplateCategory,
  updateAdminTemplateCategory,
  type TemplateCategory,
} from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Loader2, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { IconSelector, iconList } from '@/components/ui/icon-selector'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  icon: z.string().min(1, 'Icon is required.'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditTemplateCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = Number(params.id)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      icon: '',
      description: '',
    },
  })

  useEffect(() => {
    async function fetchCategory() {
      const token = localStorage.getItem('adminAuthToken')
      if (!token || !id) {
        router.push('/admin/dashboard/template-categories')
        return
      }
      try {
        const categoryData = await getAdminTemplateCategory(token, id)
        form.reset({
          title: categoryData.title,
          icon: categoryData.icon || '',
          description: categoryData.description || '',
        })
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error fetching category',
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategory()
  }, [id, router, toast, form])

  const { isSubmitting } = form.formState
  const selectedIconName = form.watch('icon')

  async function onSubmit(values: FormValues) {
    const token = localStorage.getItem('adminAuthToken')
    if (!token) {
      toast({ title: 'Authentication Error', variant: 'destructive' })
      return
    }

    try {
      await updateAdminTemplateCategory(token, id, values)
      toast({
        title: 'Category Updated',
        description: 'The template category has been successfully updated.',
      })
      router.push('/admin/dashboard/template-categories')
      router.refresh()
    } catch (error: any) {
      const description = error.errors
        ? Object.values(error.errors).flat().join('\n')
        : error.message || 'Could not update the category.'
      toast({
        title: 'Update Failed',
        description: description,
        variant: 'destructive',
      })
    }
  }

  const IconComponent =
    iconList.find((i) => i.name.toLowerCase() === selectedIconName?.toLowerCase())
      ?.icon 

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="sticky top-0 bg-white z-10">
          <div className="h-16 flex items-center justify-between px-6 border-b">
            <Skeleton className="h-8 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-white"
      >
        <header className="sticky top-0 bg-white z-10">
          <div className="h-16 flex items-center justify-between px-6 border-b">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/dashboard/template-categories">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-lg font-semibold">Edit Category</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                type="button"
                asChild
                className="text-gray-700 font-semibold border-gray-300"
              >
                <Link href={`/admin/dashboard/template-categories`}>CANCEL</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="flex flex-col items-center gap-4">
               {IconComponent && <IconComponent className="h-24 w-24 text-primary" />}
            </div>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Accounting" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                       <IconSelector onValueChange={field.onChange} defaultValue={field.value}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="A short description of the category..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </main>
      </form>
    </Form>
  )
}
