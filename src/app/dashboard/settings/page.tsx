
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
import { getProfile, updateProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
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


export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
      company: "",
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

  useEffect(() => {
    async function loadProfile() {
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

      try {
        const responseData = await getProfile(token);
        // Handle potential nested data structures from the API
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

    loadProfile();
  }, [form, toast]);
  
  async function onSubmit(data: ProfileFormValues) {
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


  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     {isLoading ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-full" />
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                     ) : (
                        <>
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" value={userEmail} readOnly disabled className="bg-muted/50"/>
                                </FormItem>
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(123) 456-7890" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Inc." {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell us a little bit about yourself" className="min-h-24" {...field} value={field.value ?? ''}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </div>
                            </div>
                             {/* Address Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Address</h3>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="CA" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>Zip / Postal Code</FormLabel><FormControl><Input placeholder="90210" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <FormField control={form.control} name="country_name" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="United States" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="country_code" render={({ field }) => (<FormItem><FormLabel>Country Code</FormLabel><FormControl><Input placeholder="US" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="country_phone_code" render={({ field }) => (<FormItem><FormLabel>Phone Code</FormLabel><FormControl><Input placeholder="+1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="country_flag" render={({ field }) => (<FormItem><FormLabel>Country Flag</FormLabel><FormControl><Input placeholder="🇺🇸" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                             {/* Regional Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Regional Settings</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                     <FormField control={form.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><FormControl><Input placeholder="English" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><FormControl><Input placeholder="USD" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="timezone" render={({ field }) => (<FormItem><FormLabel>Timezone</FormLabel><FormControl><Input placeholder="Pacific Time (US & Canada)" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField
                                        control={form.control}
                                        name="date_format"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date Format</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                                    <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a format" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                     />
                                    <FormField
                                        control={form.control}
                                        name="time_format"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time Format</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select a format" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="12-hour">12-hour</SelectItem>
                                                        <SelectItem value="24-hour">24-hour</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                     />
                                     <FormField control={form.control} name="locale" render={({ field }) => (<FormItem><FormLabel>Locale</FormLabel><FormControl><Input placeholder="en_US" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                 </div>
                            </div>
                        </>
                     )}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update your password here. For security, you will be logged out after changing your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Update Password</Button>
        </CardFooter>
      </Card>

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
