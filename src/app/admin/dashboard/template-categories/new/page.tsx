
'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createAdminTemplateCategory } from '@/lib/api'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { ColorSelector } from '@/components/ui/color-selector'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  color: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NewTemplateCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      color: '#0ea5e9', // default to a pleasant blue
      description: '',
    },
  })

  const { isSubmitting } = form.formState
  const selectedColor = form.watch('color')

  async function onSubmit(values: FormValues) {
    const token = localStorage.getItem('adminAuthToken')
    if (!token) {
      toast({ title: 'Authentication Error', variant: 'destructive' })
      return
    }

    try {
      await createAdminTemplateCategory(token, values)
      toast({
        title: 'Category Created',
        description: 'The new template category has been successfully created.',
      })
      router.push('/admin/dashboard/template-categories')
      router.refresh()
    } catch (error: any) {
      const description = error.errors
        ? Object.values(error.errors).flat().join('\n')
        : error.message || 'Could not create the category.'
      toast({
        title: 'Creation Failed',
        description: description,
        variant: 'destructive',
      })
    }
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
              <h1 className="text-lg font-semibold">New Template Category</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                type="button"
                asChild
                className="text-gray-700 font-semibold border-gray-300"
              >
                <Link href="/admin/dashboard/template-categories">CANCEL</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                SAVE
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="flex flex-col items-center gap-4">
               <div className="h-24 w-24 rounded-full border-4" style={{ borderColor: selectedColor }}/>
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Color</FormLabel>
                     <FormControl>
                       <ColorSelector value={field.value} onChange={field.onChange} />
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
