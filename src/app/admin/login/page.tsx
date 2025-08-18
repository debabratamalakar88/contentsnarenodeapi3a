
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/icons"
import Link from "next/link"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { adminLogin } from "@/lib/api";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});


export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      router.replace('/admin/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await adminLogin(values); 
      if (data.token) {
        localStorage.setItem('adminAuthToken', data.token);
        toast({
          title: "Admin Login Successful",
          description: "Welcome back, administrator.",
        });
        router.push('/admin/dashboard');
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error: any) {
      let description = "An unknown error occurred. Please try again.";

      if (error?.errors && typeof error.errors === 'object') {
        description = Object.values(error.errors).flat().join("\n");
      } else if (error?.message && typeof error.message === 'string') {
        if (error.message.includes('A backend communication error')) {
             description = "An unexpected error occurred. Please check the server connection and try again.";
        } else {
            description = error.message;
        }
      } else if (error?.error && typeof error.error === 'string') {
        description = error.error;
      } else if (error?.detail && typeof error.detail === 'string') {
        description = error.detail;
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <Logo className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            System Admin Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the admin panel.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Admin Access</CardTitle>
                <CardDescription>
                  Please enter your administrator credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} />
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
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/login"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Switch to User Login
          </Link>
        </p>
      </div>
    </div>
  )
}
