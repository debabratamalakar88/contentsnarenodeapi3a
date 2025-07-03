
'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAdminUser, updateAdminUser, type User } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
          username: userData.username,
          phone: userData.phone,
          bio: userData.bio,
          company: userData.company,
        });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error fetching user', description: error.message });
      }
    }
    fetchUser();
  }, [id, router, toast, form]);


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

  if (!form.formState.isDirty && form.formState.isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <p className="text-muted-foreground">Modify the details for {form.getValues('name')}.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                       Update the user's information below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                </CardContent>
            </Card>
            <div className="mt-6 flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href="/admin/dashboard/users">Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
      </Form>
    </div>
  )
}
