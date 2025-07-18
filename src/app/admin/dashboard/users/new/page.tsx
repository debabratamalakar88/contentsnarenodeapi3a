
'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createAdminUser } from "@/lib/api";
import { ChevronLeft, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  password_confirmation: z.string(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords do not match.",
  path: ["password_confirmation"],
});

type FormValues = z.infer<typeof formSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();

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
  
  const { isSubmitting } = form.formState;
  const fullName = form.watch("name");

  async function onSubmit(values: FormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({ title: "Authentication Error", variant: "destructive" });
        return;
    }

    try {
        await createAdminUser(token, values);
        toast({
            title: "User Created",
            description: "The new user has been successfully created.",
        });
        router.push("/admin/dashboard/users");
        router.refresh();
    } catch (error: any) {
        const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not create the user.";
        toast({
            title: "Creation Failed",
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
                  <h1 className="text-lg font-semibold">New User Details</h1>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" type="button" asChild>
                      <Link href="/admin/dashboard/users">CANCEL</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      SAVE
                  </Button>
              </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-xl mx-auto space-y-8">
              <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-4xl font-bold border">
                          {initials ? initials : (
                              <User className="h-10 w-10 text-gray-400" />
                          )}
                      </AvatarFallback>
                  </Avatar>
                  <Button variant="link" type="button" className="text-primary font-semibold">Change Image</Button>
              </div>
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="password_confirmation" render={({ field }) => (<FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="company" render={({ field }) => (<FormItem><FormLabel>Company (Optional)</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio (Optional)</FormLabel><FormControl><Textarea placeholder="A little bit about the user..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
          </div>
        </main>
      </form>
    </Form>
  )
}
