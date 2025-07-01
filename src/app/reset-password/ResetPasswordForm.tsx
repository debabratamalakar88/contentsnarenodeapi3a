
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/api";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  token: z.string().min(1, { message: "Token is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords do not match.",
  path: ["password_confirmation"],
});


export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      router.replace('/dashboard');
      return;
    }

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token && email) {
        form.setValue('token', token);
        form.setValue('email', email);
        setIsValidLink(true);
    }

    setIsChecking(false);
  }, [searchParams, form, router]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = await resetPassword(values);
      toast({
        title: "Success",
        description: data.message || "Your password has been reset successfully.",
      });
      router.push('/login');
    } catch (error: any) {
      const description = error.errors
        ? Object.values(error.errors).flat().join("\n")
        : error.message || "Could not reset password. The link may be invalid or expired.";
      
      toast({
        variant: "destructive",
        title: "Error",
        description: description,
      });

      // If the error message from the API indicates an invalid token,
      // update the state to show the "Invalid Token" message.
      if (description.toLowerCase().includes('token')) {
        setIsValidLink(false);
      }
    }
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Invalid Token</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
             <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Back to Login
                </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <Logo className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted/50" />
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="token" render={({ field }) => <Input type="hidden" {...field} />} />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
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
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
