
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
import { loginUser, getCompany, forgotPassword } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../auth/AuthLayout";
import { Checkbox } from "@/components/ui/checkbox";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<'login' | 'forgot-password'>('login');

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

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
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
        
        const user = loginData.user;

        if (user.selected_company_id) {
            const companyDetails = await getCompany(loginData.token, user.selected_company_id);
            localStorage.setItem('selectedCompany', JSON.stringify(companyDetails));
            localStorage.setItem('userRole', companyDetails.pivot?.role || 'Viewer');
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

  async function onForgotPasswordSubmit(values: z.infer<typeof forgotPasswordSchema>) {
     try {
      const data = await forgotPassword(values);
      toast({
        title: "Success",
        description: data.message || "Password reset link sent. Please check your email.",
      });
      forgotPasswordForm.reset();
      setView('login');
    } catch (error: any) {
      const description = error.errors
        ? Object.values(error.errors).flat().join("\n")
        : error.message || "Could not send password reset link. Please try again.";
      
      toast({
        variant: "destructive",
        title: "Error",
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
      {view === 'login' ? (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email address" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-8 px-2" />
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
                  control={loginForm.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox id="remember-me" checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <label htmlFor="remember-me" className="text-gray-600 cursor-pointer">Remember me for the next 7 days</label>
                    </FormItem>
                  )}
                />
                <button type="button" onClick={() => setView('forgot-password')} className="font-semibold text-blue-600 hover:underline">
                    Forgot password?
                </button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={loginForm.formState.isSubmitting}>
              {loginForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login with email
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...forgotPasswordForm}>
           <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Forgot Password</h3>
              <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
           </div>
           <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email address" {...field} className="border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={forgotPasswordForm.formState.isSubmitting}>
                {forgotPasswordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
               <div className="text-center">
                 <button type="button" onClick={() => setView('login')} className="text-sm font-semibold text-blue-600 hover:underline">
                    Back to Login
                </button>
               </div>
           </form>
        </Form>
      )}
    </AuthLayout>
  )
}
