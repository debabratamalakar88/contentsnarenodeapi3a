
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { loginUser, getProfile, getCompany } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../auth/AuthLayout";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().optional(),
});


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const company = localStorage.getItem('selectedCompany');
    if (token && company) {
      router.replace('/dashboard');
    } else if (token) {
      router.replace('/companies');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const loginData = await loginUser(values);
      if (loginData.token && loginData.user) {
        
        localStorage.setItem('authToken', loginData.token);
        
        if (loginData.user.email_verified_at === null) {
          toast({
            title: "Verification Required",
            description: "Please check your email to verify your account.",
            variant: "destructive"
          });
          router.push('/verify-email');
          return;
        } 
        
        const profileResponse = await getProfile(loginData.token);
        const profile = profileResponse.user || profileResponse.data || profileResponse;

        if (profile.selected_company_id) {
            const companyDetails = await getCompany(loginData.token, profile.selected_company_id);
            localStorage.setItem('selectedCompany', JSON.stringify(companyDetails));
            toast({ title: "Success", description: "Logged in successfully." });
            router.push('/dashboard');
        } else {
            toast({ title: "Success", description: "Logged in successfully." });
            router.push('/companies');
        }

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
    <AuthLayout activeTab="login">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email address" {...field} className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
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
                    <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-8" />
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between text-sm">
             <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                       <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <label htmlFor="remember-me" className="text-gray-600 cursor-pointer">Remember me</label>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password" className="font-semibold text-blue-600 hover:underline">
                  Forgot password?
              </Link>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login with email
          </Button>
        </form>
      </Form>
    </AuthLayout>
  )
}
