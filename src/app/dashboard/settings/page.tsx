
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getProfile, updateProfile, changePassword, updateCompany, type Company } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country_code: z.string().optional().nullable(),
  country_name: z.string().optional().nullable(),
  country_flag: z.string().optional().nullable(),
  country_phone_code: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  date_format: z.string().optional().nullable(),
  time_format: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  current_password: z.string().min(1, "Current password is required."),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
  new_password_confirmation: z.string(),
}).refine(data => data.new_password === data.new_password_confirmation, {
  message: "New passwords do not match.",
  path: ["new_password_confirmation"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const companyFormSchema = z.object({
    company_name: z.string().min(1, "Company name is required."),
    company_subdomain: z.string().min(1, "Subdomain is required."),
    company_logo: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country_code: "",
      country_name: "",
      country_flag: "",
      country_phone_code: "",
      locale: "",
      currency: "",
      timezone: "",
      date_format: "MM/DD/YYYY",
      time_format: "12-hour",
      language: "en",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });
  
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
        company_name: "",
        company_subdomain: "",
        company_logo: "",
    },
  });

  useEffect(() => {
    async function loadProfileAndCompany() {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No auth token found. Please log in again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const companyData = localStorage.getItem('selectedCompany');
      if (companyData) {
        const company = JSON.parse(companyData);
        setSelectedCompany(company);
        companyForm.reset({
            company_name: company.company_name,
            company_subdomain: company.company_subdomain,
            company_logo: company.company_logo || "",
        });
      }

      try {
        const responseData = await getProfile(token);
        const profileData = responseData.user || responseData.data || responseData;

        form.reset(profileData);
        if(profileData.email) {
            setUserEmail(profileData.email);
        }
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

    loadProfileAndCompany();
  }, [form, companyForm, toast]);
  
  async function onProfileSubmit(data: ProfileFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await updateProfile(token, data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
        });
    } catch (error: any) {
        toast({
            title: "Update Failed",
            description: error.message || "Could not update your profile.",
            variant: "destructive",
        });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        toast({
            title: "Authentication Error",
            description: "No auth token found. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    try {
        await changePassword(token, data);
        toast({
            title: "Password Updated",
            description: "Your password has been changed. Please log in again.",
        });
        
        localStorage.removeItem('authToken');
        router.push('/login');

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

  async function onCompanySubmit(data: CompanyFormValues) {
    const token = localStorage.getItem("authToken");
    if (!token || !selectedCompany) {
      toast({ title: "Error", description: "Authentication or company selection error.", variant: "destructive" });
      return;
    }
    
    try {
        const response = await updateCompany(token, selectedCompany.id, data);
        localStorage.setItem('selectedCompany', JSON.stringify(response.company));
        setSelectedCompany(response.company);
        toast({ title: "Company Updated", description: "Your company details have been saved." });
    } catch (error: any) {
         const description = error.errors ? Object.values(error.errors).flat().join("\n") : error.message || "Could not update company details.";
        toast({ title: "Update Failed", description: description, variant: "destructive" });
    }
  }


  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     {isLoading ? (
                        <div className="space-y-6"><Skeleton className="h-24 w-full" /></div>
                     ) : (
                        <>
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormItem><FormLabel>Email</FormLabel><Input type="email" value={userEmail} readOnly disabled className="bg-muted/50"/></FormItem>
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about yourself" className="min-h-24" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </>
                     )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Profile
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
    
    {selectedCompany && (
      <Form {...companyForm}>
        <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Company Settings</CardTitle>
                    <CardDescription>Manage your currently selected company details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={companyForm.control} name="company_name" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={companyForm.control} name="company_subdomain" render={({ field }) => (<FormItem><FormLabel>Company Subdomain</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormField control={companyForm.control} name="company_logo" render={({ field }) => (<FormItem><FormLabel>Logo URL (Optional)</FormLabel><FormControl><Input {...field} placeholder="https://example.com/logo.png" /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={companyForm.formState.isSubmitting || isLoading}>
                        {companyForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Company
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
    )}

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
                    <FormField control={passwordForm.control} name="current_password" render={({ field }) => (<FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={passwordForm.control} name="new_password_confirmation" render={({ field }) => (<FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
