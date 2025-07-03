
'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  current_password: z.string().min(1, "Current password is required."),
  password: z.string().min(8, "New password must be at least 8 characters."),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: "New passwords do not match.",
  path: ["password_confirmation"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function AdminSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No admin auth token found. Please log in again.",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      try {
        const profileData = await getAdminProfile(token);
        form.reset(profileData);
      } catch (error) {
        toast({
          title: "Failed to load profile",
          description: "Could not fetch your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [form, toast, router]);
  
  async function onSubmit(data: ProfileFormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await updateAdminProfile(token, data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    } catch (error: any) {
        const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not update your profile.";
        toast({
            title: "Update Failed",
            description: description,
            variant: "destructive",
        });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await changeAdminPassword(token, data);
        toast({
            title: "Password Updated",
            description: "Your password has been changed. You will be logged out.",
        });
        
        localStorage.removeItem('adminAuthToken');
        router.push('/admin/login');

    } catch (error: any) {
         const description = error.errors
            ? Object.values(error.errors).flat().join("\n")
            : error.message || "Could not update your password.";
        toast({
            title: "Update Failed",
            description: description,
            variant: "destructive",
        });
    }
  }


  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your administrator account and preferences.
        </p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is your administrator profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} value={field.value ?? ''} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@example.com" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                     )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>

    <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Update your password here. For security, you will be logged out after changing your password.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
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
                        control={passwordForm.control}
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
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>

       <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an additional layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox id="2fa" />
            <label
              htmlFor="2fa"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable Two-Factor Authentication
            </label>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
