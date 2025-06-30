
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Info, User, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NewClientPage() {
    const [companies, setCompanies] = useState<string[]>([]);
    const [companyInput, setCompanyInput] = useState("");
    const [isCompanyAlertVisible, setCompanyAlertVisible] = useState(true);

    const handleCompanyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && companyInput.trim()) {
            e.preventDefault();
            const newCompany = companyInput.trim();
            if (!companies.includes(newCompany)) {
                setCompanies([...companies, newCompany]);
            }
            setCompanyInput("");
        }
    };

    const removeCompany = (companyToRemove: string) => {
        setCompanies(companies.filter(company => company !== companyToRemove));
    };


    return (
        <div className="flex flex-col h-full bg-white">
            <header className="sticky top-0 bg-white z-10">
                <div className="h-16 flex items-center justify-between px-6 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/dashboard/clients">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-lg font-semibold">New Client Details</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild className="text-gray-700 font-semibold border-gray-300">
                            <Link href="/dashboard/clients">CANCEL</Link>
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">SAVE</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-gray-100 border">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 13.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5c0 1.93 1.57 3.5 3.5 3.5H8a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h1.5c1.93 0 3.5-1.57 3.5-3.5Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="link" className="text-indigo-600 font-semibold">Change Image</Button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="fullName" className="font-semibold text-gray-700">Full Name</Label>
                            <Input id="fullName" placeholder="Client full name..." className="bg-gray-50 mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="emailAddress" className="font-semibold text-gray-700">Email Address</Label>
                            <Input id="emailAddress" type="email" placeholder="Contact email address..." className="bg-gray-50 mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="companyName" className="font-semibold text-gray-700">Company Name (optional)</Label>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {companies.map((company, index) => (
                                    <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                                        {company}
                                        <button onClick={() => removeCompany(company)} className="ml-1.5 rounded-full hover:bg-gray-300/50 p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                id="companyName"
                                value={companyInput}
                                onChange={(e) => setCompanyInput(e.target.value)}
                                onKeyDown={handleCompanyKeyDown}
                                placeholder="Type a company name and press Enter..."
                                className="bg-gray-50 mt-2"
                            />
                        </div>

                        {isCompanyAlertVisible && (
                            <Alert className="bg-cyan-50 border-cyan-200 text-cyan-900 [&>svg]:text-cyan-600 relative p-4">
                                <Info className="h-5 w-5" />
                                <AlertDescription className="pr-8">
                                    Press ENTER after typing the name of a company to add multiple companies to this client.
                                </AlertDescription>
                                <Button variant="ghost" size="icon" className="absolute top-1.5 right-1.5 h-7 w-7 text-cyan-900 hover:bg-cyan-100" onClick={() => setCompanyAlertVisible(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </Alert>
                        )}
                        
                        <div>
                            <Label htmlFor="phoneNumber" className="font-semibold text-gray-700">Phone Number (optional)</Label>
                             <div className="flex items-center mt-1">
                                <Select defaultValue="in">
                                    <SelectTrigger className="w-[80px] rounded-r-none bg-gray-50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">🇮🇳</SelectItem>
                                        <SelectItem value="us">🇺🇸</SelectItem>
                                        <SelectItem value="gb">🇬🇧</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input id="phoneNumber" type="tel" defaultValue="(415) 555-1212" className="rounded-l-none bg-gray-50" />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="appLanguage" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                Application Language <Info className="w-4 h-4 text-gray-400" />
                            </Label>
                            <Select defaultValue="english">
                                <SelectTrigger id="appLanguage" className="bg-gray-50 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                         <div>
                            <Label htmlFor="dateFormat" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                Date Format <Info className="w-4 h-4 text-gray-400" />
                            </Label>
                            <Select defaultValue="ddmmyyyy">
                                <SelectTrigger id="dateFormat" className="bg-gray-50 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="mmddyyyy">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="timeZone" className="flex items-center gap-1.5 font-semibold text-gray-700">
                                Time Zone <Info className="w-4 h-4 text-gray-400" />
                            </Label>
                            <Select defaultValue="ist">
                                <SelectTrigger id="timeZone" className="bg-gray-50 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ist">(+05:30) India Standard Time</SelectItem>
                                    <SelectItem value="pst">(-08:00) Pacific Standard Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Alert className="bg-cyan-50 border-cyan-200 text-cyan-900 [&>svg]:text-cyan-600 p-4">
                            <Info className="h-5 w-5" />
                            <AlertDescription>
                                Your client will not receive any emails from us until you send them a request.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </main>
        </div>
    )
}
