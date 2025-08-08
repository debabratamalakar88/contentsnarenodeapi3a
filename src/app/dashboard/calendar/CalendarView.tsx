

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllRequests, getReminders, type Request, type Reminder, type Client, getClients, getProfile, type User } from '@/lib/api';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval, getDate } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronLeft, ChevronRight, Mail, FileText, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  type: 'request-due' | 'request-scheduled' | 'reminder';
  date: Date;
  title: string;
  clientName: string;
  data: Request | Reminder;
}

export default function CalendarView() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const [requestsData, remindersResponse, clientsData, profileData] = await Promise.all([
          getAllRequests(token!),
          getReminders(token!),
          getClients(token!),
          getProfile(token!),
        ]);

        setClients(clientsData || []);
        if (profileData.user) {
            setUsers([profileData.user]);
        }

        const clientMap = new Map(clientsData.map(c => [c.id, c.full_name]));
        const remindersData = remindersResponse.data || [];
        const allEvents: CalendarEvent[] = [];

        requestsData.forEach((req) => {
          const clientName = req.client_id?.[0] ? clientMap.get(req.client_id[0]) || 'Unknown Client' : 'No Client Assigned';
          if (req.status === 'published' && req.due_date) {
            allEvents.push({
              id: `req-due-${req.id}`,
              type: 'request-due',
              date: parseISO(req.due_date),
              title: req.title,
              clientName,
              data: req,
            });
          }
          if (req.status === 'scheduled' && req.scheduled_at) {
            allEvents.push({
              id: `req-sch-${req.id}`,
              type: 'request-scheduled',
              date: parseISO(req.scheduled_at),
              title: req.title,
              clientName,
              data: req,
            });
          }
        });

        remindersData.forEach((rem: Reminder) => {
          if (!rem.sent) {
            allEvents.push({
              id: `rem-${rem.id}`,
              type: 'reminder',
              date: parseISO(rem.reminder_date),
              title: `Reminder: ${rem.request.title}`,
              clientName: rem.client.full_name,
              data: rem,
            });
          }
        });

        setEvents(allEvents);
      } catch (err: any) {
        toast({
          title: 'Error fetching calendar data',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [token, router, toast]);

  const getEventStyles = (type: CalendarEvent['type']) => {
    switch (type) {
        case 'request-due':
            return 'bg-red-100 text-red-800';
        case 'request-scheduled':
            return 'bg-blue-100 text-blue-800';
        case 'reminder':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-primary/10 text-primary-foreground';
    }
  }

  const DayContent = ({ date }: { date: Date }) => {
    const dayEvents = events.filter(event => isSameDay(event.date, date));
    return (
      <div className="relative w-full h-full p-1 flex flex-col gap-1 overflow-hidden">
        <p className="absolute top-1 right-2 text-xs">{getDate(date)}</p>
        <div className="pt-5 flex flex-col gap-1">
          {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} className={cn("text-xs p-1 rounded-sm flex items-center gap-1.5 truncate", getEventStyles(event.type))}>
                {event.type === 'reminder' ? <Mail className="h-3 w-3 flex-shrink-0" /> : <FileText className="h-3 w-3 flex-shrink-0" />}
                <span className="truncate">{event.title} - {event.clientName}</span>
              </div>
          ))}
          {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground font-semibold mt-1">+ {dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  };
  
  const handleMonthChange = (month: Date) => {
    setDate(month);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 h-full">
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="flex gap-2 items-center">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-9 w-20" />
            </div>
        </div>
        <Skeleton className="h-[calc(100%-4rem)] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
       <header className="flex items-center justify-between p-4 border-b">
         <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">View: Month <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuItem>Month</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Owner <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  {users.map(user => (
                     <DropdownMenuItem key={user.id}>{user.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Client <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  {clients.map(client => (
                     <DropdownMenuItem key={client.id}>{client.full_name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft className="h-5 w-5"/></Button>
                <span className="text-lg font-semibold">{format(date, 'MMMM yyyy')}</span>
                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight className="h-5 w-5"/></Button>
            </div>
            <Button variant="outline" onClick={() => setDate(new Date())}>TODAY</Button>
         </div>
       </header>
       <div className="flex-1 border-t">
         <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => day && setDate(day)}
            month={date}
            onMonthChange={handleMonthChange}
            className="h-full w-full"
            classNames={{
                root: 'h-full flex flex-col',
                months: 'flex-1',
                month: 'h-full flex flex-col',
                table: 'w-full h-full border-collapse',
                head_row: 'flex border-b',
                head_cell: 'w-full text-muted-foreground font-normal text-xs uppercase pt-2 pb-2 text-center',
                row: 'flex w-full flex-1',
                cell: 'h-full w-full text-sm text-left p-0 relative focus-within:relative focus-within:z-20 border',
                day: 'h-full w-full p-0 text-left align-top font-medium aria-selected:opacity-100',
                day_selected: 'bg-transparent text-primary border-2 border-primary rounded-none',
                day_today: 'text-primary font-bold',
                day_outside: 'text-muted-foreground opacity-50',
            }}
            components={{ DayContent }}
        />
       </div>
    </div>
  );
}
