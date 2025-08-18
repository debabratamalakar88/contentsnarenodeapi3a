
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../auth/AuthLayout";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  company_name: z.string().min(1, { message: "Company name is required." }),
  company_subdomain: z.string().min(1, { message: "Company subdomain is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords do not match.",
  path: ["password_confirmation"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company_name: "",
      company_subdomain: "",
      password: "",
      password_confirmation: "",
    },
  });

  const companyNameValue = form.watch("company_name");

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  useEffect(() => {
      const slug = slugify(companyNameValue);
      form.setValue('company_subdomain', slug);
  }, [companyNameValue, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await registerUser(values);
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
      router.push('/login');
    } catch (error: any) {
      const description = error.errors
        ? Object.values(error.errors).flat().join("\n")
        : error.message || "An unexpected error occurred.";

      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: description,
      });
    }
  }
  
  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout activeTab="register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Full Name" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Company Name" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="company_subdomain"
            render={({ field }) => (
              <FormItem>
                 <FormControl>
                    <div className="flex items-center mt-1">
                        <Input
                            placeholder="subdomain"
                            className="bg-gray-50 rounded-r-none border-0 border-b border-input focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-2"
                            {...field}
                        />
                        <span className="px-3 h-10 flex items-center bg-gray-50 text-muted-foreground border-b border-input rounded-r-md text-sm">.contentsnare.com</span>
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email address" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 px-2"/>
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                    <FormControl>
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 px-2"/>
                    </FormControl>
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
