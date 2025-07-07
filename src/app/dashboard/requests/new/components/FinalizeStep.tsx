'use client'

import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Calendar as CalendarIcon, HelpCircle, Info, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function FinalizeStep() {
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date(2025, 6, 21));
    const [protectWithPin, setProtectWithPin] = useState(true);
    const [isPinInfoVisible, setIsPinInfoVisible] = useState(true);

    return (
        <div className="max-w-xl mx-auto animate-in fade-in-50 w-full space-y-8 py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Publish Settings</h2>
            </div>
            
            <div className="space-y-6">
                {/* Client Select */}
                <div>
                    <Label htmlFor="client-select" className="flex items-center gap-1.5 font-semibold text-gray-700 mb-2">
                        Which client(s) do you want to send this request to? <HelpCircle className="w-4 h-4 text-gray-400" />
                    </Label>
                    <Select>
                        <SelectTrigger id="client-select">
                            <SelectValue placeholder="Choose a client..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="acme">Acme Inc.</SelectItem>
                            <SelectItem value="stark">Stark Industries</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enable-comments" className="flex items-center gap-2 font-medium">Enable client comments <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="enable-comments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="allow-no-login" className="flex items-center gap-2 font-medium">Allow access without logging in <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="allow-no-login" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="protect-pin" className="flex items-center gap-2 font-medium">Protect with a pin code <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="protect-pin" checked={protectWithPin} onCheckedChange={setProtectWithPin} />
                    </div>
                </div>

                {/* PIN Info Alert */}
                {protectWithPin && isPinInfoVisible && (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600 relative p-4">
                        <Info className="h-5 w-5" />
                        <AlertDescription className="ml-2 pr-8">
                            Your client will be asked to set their own pincode when they first access the request.
                        </AlertDescription>
                         <Button variant="ghost" size="icon" type="button" onClick={() => setIsPinInfoVisible(false)} className="absolute top-1.5 right-1.5 h-7 w-7 text-blue-900 hover:bg-blue-100">
                             <X className="h-4 w-4" />
                         </Button>
                    </Alert>
                )}

                {/* Communications Schedule */}
                <div>
                     <Label htmlFor="comms-schedule" className="block font-semibold text-gray-700 mb-2">
                        Select a communications schedule
                    </Label>
                    <Select defaultValue="none">
                        <SelectTrigger id="comms-schedule">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No automatic reminders</SelectItem>
                            <SelectItem value="default">Default Schedule</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="link" className="text-pink-600 p-0 h-auto mt-2 text-sm font-medium">Show client communications</Button>
                </div>
                
                {/* Send Time */}
                 <div>
                     <Label htmlFor="send-time" className="block font-semibold text-gray-700 mb-2">
                        When do you want to send this request?
                    </Label>
                    <Select defaultValue="immediately">
                        <SelectTrigger id="send-time">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="later">Schedule for later</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Due Date */}
                <div>
                    <Label htmlFor="due-date" className="block font-semibold text-gray-700 mb-2">
                        When is the request due?
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="due-date"
                                variant={"outline"}
                                className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "dd / MM / yyyy") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={setDueDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                 {/* Warning Alert */}
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription className="ml-2">
                        A request must be assigned to at least one client before it can be published.
                    </AlertDescription>
                </Alert>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
                <Button size="lg" className="w-full max-w-xs bg-purple-200 text-purple-800 hover:bg-purple-300 font-bold text-base" disabled>
                    PUBLISH & SEND
                </Button>
                <Button variant="link" className="text-pink-600 font-medium">
                    or Save settings and leave the request as draft
                </Button>
            </div>
        </div>
    )
}
