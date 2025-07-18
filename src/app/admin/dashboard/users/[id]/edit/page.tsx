
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAdminUser, updateAdminUser, type User } from "@/lib/api";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
}).refine(data => {
    if (data.password && data.password.length > 0) {
        return data.password.length >= 8 && data.password === data.password_confirmation;
    }
    return true;
}, {
  message: "Passwords must match and be at least 8 characters long.",
  path: ["password_confirmation"],
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = Number(params.id);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      password_confirmation: "",
      phone: "",
      bio: "",
      company: "",
    },
  });

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("adminAuthToken");
      if (!token || !id) {
        router.push('/admin/dashboard/users');
        return;
      }
      try {
        const userData = await getAdminUser(token, id);
        form.reset({
          name: userData.name,
          email: userData.email,
          username: userData.username ?? '',
          phone: userData.phone,
          bio: userData.bio,
          company: userData.company,
        });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error fetching user', description: error.message });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [id, router, toast, form]);

  const { isSubmitting } = form.formState;
  const fullName = form.watch("name");

  async function onSubmit(values: FormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        return;
    }

    const dataToSubmit: any = { ...values };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
      delete dataToSubmit.password_confirmation;
    }

    try {
        await updateAdminUser(token, id, dataToSubmit);
        toast({
            title: "User Updated",
            description: "The user's details have been successfully updated.",
        });
        router.push("/admin/dashboard/users");
        router.refresh();
    } catch (error: any) {
        const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not update the user.";
        toast({
            title: "Update Failed",
            description: description,
            variant: "destructive",
        });
    }
  }
  
  const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
  }
    
  const initials = getInitials(fullName);

  if (isLoading) {
    return (
        <div className="flex flex-col h-full bg-white">
          <header className="sticky top-0 bg-white z-10"><div className="h-16 flex items-center justify-between px-6 border-b"><Skeleton className="h-8 w-48" /><div className="flex items-center gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div></div></header>
            <main className="flex-1 overflow-y-auto p-8"><div className="max-w-xl mx-auto space-y-8"><Skeleton className="h-24 w-24 rounded-full mx-auto" /><div className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></div></main>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
        <header className="sticky top-0 bg-white z-10">
          <div className="h-16 flex items-center justify-between px-6 border-b">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                      <Link href="/admin/dashboard/users">
                          <ChevronLeft className="h-5 w-5" />
                      </Link>
                  </Button>
                  <h1 className="text-lg font-semibold">Edit User Details</h1>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" type="button" asChild>
                      <Link href={`/admin/dashboard/users/${id}`}>CANCEL</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      SAVE CHANGES
                  </Button>
              </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8">
              <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-4xl font-bold border">
                          {initials || 'U'}
                      </AvatarFallback>
                  </Avatar>
                  <Button variant="link" type="button" className="text-primary font-semibold">Change Image</Button>
              </div>
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} placeholder="Leave blank to keep current" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="password_confirmation" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="company" render={({ field }) => (<FormItem><FormLabel>Company (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio (Optional)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
          </div>
        </main>
      </form>
    </Form>
  )
}
