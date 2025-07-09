

'use client'

import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Calendar as CalendarIcon, HelpCircle, Info, Loader2, Mail, Phone, PlusCircle, X } from "lucide-react"
import { useRouter } from "next/navigation";

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
import { MultiSelect, type OptionType } from "@/components/ui/multi-select";
import { getClients, type Request, type Client } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FinalizeStepProps {
  initialData: Request | null;
  onPublish: (settings: any) => void;
  onSaveDraft: (settings: any) => void;
  isSubmitting: boolean;
}

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

export default function FinalizeStep({ initialData, onPublish, onSaveDraft, isSubmitting }: FinalizeStepProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Component state
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [protectWithPin, setProtectWithPin] = useState(true);
    const [isPinInfoVisible, setIsPinInfoVisible] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [allowComments, setAllowComments] = useState(true);
    const [allowNoLogin, setAllowNoLogin] = useState(true);
    const [sendOption, setSendOption] = useState<'immediately' | 'later'>('immediately');
    const [communicationMode, setCommunicationMode] = useState('none');
    const [scheduledAt, setScheduledAt] = useState<Date | undefined>();

    const isPublished = initialData?.status === 'published';

    // Fetch clients on mount
    useEffect(() => {
        async function fetchClientsData() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                router.push('/login');
                return;
            }

            try {
                const fetchedClients = await getClients(token);
                setClients(fetchedClients);
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error fetching clients',
                    description: err.message || 'An unexpected error occurred.',
                });
            } finally {
                setIsLoadingClients(false);
            }
        }
        fetchClientsData();
    }, [router, toast]);
    
    // Populate state from initial data when it's loaded
    useEffect(() => {
        if (initialData) {
            setDueDate(initialData.due_date ? parseISO(initialData.due_date) : undefined);
            setSelectedClients(initialData.client_id?.map(String) || []);
            setAllowComments(initialData.allow_comments);
            setSendOption(initialData.send_option);
            setCommunicationMode(initialData.communication_mode);
            setScheduledAt(initialData.scheduled_at ? parseISO(initialData.scheduled_at) : undefined);
            // Note: `protectWithPin` and `allowNoLogin` are not in the current Request type.
            // They are managed as UI state but not saved.
        }
    }, [initialData]);

    const canPublish = selectedClients.length > 0;
    
    const gatherSettings = () => {
        return {
            client_id: selectedClients.map(Number),
            due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
            allow_comments: allowComments,
            send_option: sendOption,
            communication_mode: communicationMode,
            scheduled_at: sendOption === 'later' && scheduledAt ? format(scheduledAt, "yyyy-MM-dd'T'HH:mm:ss") : null,
        };
    };

    const handleMainAction = () => {
        if (!canPublish && !isPublished) return;
        onPublish(gatherSettings());
    };

    const handleSaveDraft = () => {
        onSaveDraft(gatherSettings());
    };
    
    const clientOptions = clients.map(client => ({
        label: client.full_name,
        value: String(client.id)
    }));
      
    const selectedClientDetails = useMemo(() => {
        return selectedClients.map(clientId => {
            return clients.find(c => String(c.id) === clientId);
        }).filter((c): c is Client => c !== undefined);
    }, [selectedClients, clients]);

    const ClientSelector = () => {
      if (isPublished) {
        return (
          <div>
            <div className="space-y-2 mb-2">
              {selectedClientDetails.map(client => (
                <Card key={client.id} className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-green-100 text-green-800 text-sm font-bold border">
                        {getInitials(client.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{client.full_name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {client.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /><span>{client.email}</span></div>}
                      {client.phone_number && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /><span>{client.phone_number}</span></div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <MultiSelect
              options={clientOptions.filter(opt => !selectedClients.includes(opt.value))}
              selected={[]}
              onChange={(newSelection) => setSelectedClients([...selectedClients, ...newSelection])}
              placeholder="+ Add Another Client"
              className="w-full"
            />
          </div>
        )
      } else {
        return (
          <MultiSelect
            options={clientOptions}
            selected={selectedClients}
            onChange={setSelectedClients}
            placeholder={isLoadingClients ? "Loading clients..." : "Choose one or more clients..."}
            className="w-full"
          />
        )
      }
    }


    return (
        <div className="max-w-xl mx-auto animate-in fade-in-50 w-full space-y-8 py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Publish Settings</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <Label htmlFor="client-select" className="flex items-center gap-1.5 font-semibold text-gray-700 mb-2">
                        Which client(s) do you want to send this request to? <HelpCircle className="w-4 h-4 text-gray-400" />
                    </Label>
                    <ClientSelector />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enable-comments" className="flex items-center gap-2 font-medium">Enable client comments <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="enable-comments" checked={allowComments} onCheckedChange={setAllowComments} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="allow-no-login" className="flex items-center gap-2 font-medium">Allow access without logging in <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="allow-no-login" checked={allowNoLogin} onCheckedChange={setAllowNoLogin} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="protect-pin" className="flex items-center gap-2 font-medium">Protect with a pin code <HelpCircle className="w-4 h-4 text-gray-400" /></Label>
                        <Switch id="protect-pin" checked={protectWithPin} onCheckedChange={setProtectWithPin} />
                    </div>
                </div>

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

                <div>
                     <Label htmlFor="comms-schedule" className="block font-semibold text-gray-700 mb-2">
                        Select a communications schedule
                    </Label>
                    <Select value={communicationMode} onValueChange={setCommunicationMode}>
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
                
                 <div>
                     <Label htmlFor="send-time" className="block font-semibold text-gray-700 mb-2">
                        When do you want to send this request?
                    </Label>
                    <Select value={sendOption} onValueChange={(value) => setSendOption(value as 'immediately' | 'later')}>
                        <SelectTrigger id="send-time">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="later">Schedule for later</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {sendOption === 'later' && (
                    <div className="animate-in fade-in-50">
                        <Label htmlFor="schedule-date" className="block font-semibold text-gray-700 mb-2">
                            Schedule Date & Time
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="schedule-date"
                                    variant={"outline"}
                                    className={cn("w-[280px] justify-start text-left font-normal", !scheduledAt && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={scheduledAt} onSelect={setScheduledAt} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}


                <div>
                    <Label htmlFor="due-date" className="block font-semibold text-gray-700 mb-2">
                        When is the request due?
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="due-date"
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
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

                {!isPublished && !canPublish && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertDescription className="ml-2">
                            A request must be assigned to at least one client before it can be published.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
                <Button size="lg" className="w-full max-w-xs bg-purple-600 text-white hover:bg-purple-700 font-bold text-base" disabled={!canPublish || isSubmitting} onClick={handleMainAction}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {isPublished ? 'UPDATE SETTINGS' : 'PUBLISH & SEND'}
                </Button>
                {!isPublished && (
                    <Button variant="link" className="text-pink-600 font-medium" disabled={isSubmitting} onClick={handleSaveDraft}>
                        or Save settings and leave the request as draft
                    </Button>
                )}
            </div>
        </div>
    )
}
