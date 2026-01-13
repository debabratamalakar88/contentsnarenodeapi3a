
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllRequests, getCalendarReminders, type Request, type Reminder, type Client, getClients, getTeamMembers, type TeamMember } from '@/lib/api';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval, getDate, startOfWeek, endOfWeek, eachDayOfInterval as eachDayOfWeek, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronLeft, ChevronRight, Mail, FileText, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface CalendarEvent {
  id: string;
  type: 'request-published' | 'request-due' | 'request-scheduled' | 'reminder';
  date: Date;
  title: string;
  clientName: string;
  clientId: number;
  ownerId: number;
  data: Request | Reminder;
}

const getEventStyles = (type: CalendarEvent['type']): string => {
    switch (type) {
        case 'request-published':
            return 'bg-purple-100 text-purple-800';
        case 'request-due':
            return 'bg-red-100 text-red-800';
        case 'request-scheduled':
            return 'bg-blue-100 text-blue-800';
        case 'reminder':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-primary/10 text-primary-foreground';
    }
};

const getEventLabel = (type: CalendarEvent['type']): string => {
    switch (type) {
        case 'request-published':
            return 'Published';
        case 'request-due':
            return 'Due Date';
        case 'request-scheduled':
            return 'Scheduled';
        case 'reminder':
            return 'Reminder';
        default:
            return 'Event';
    }
}

const DayContent = ({ date, events, setDate, setViewMode }: { date: Date, events: CalendarEvent[], setDate: (date: Date) => void, setViewMode: (view: 'month' | 'week' | 'day') => void }) => {
    const dayEvents = events.filter(event => isSameDay(event.date, date));
    
    const handleMoreClick = () => {
        setDate(date);
        setViewMode('day');
    };

    return (
      <div className="relative w-full h-full p-1 flex flex-col gap-1 overflow-hidden">
        <p className="absolute top-1 right-2 text-xs">{getDate(date)}</p>
        <div className="pt-5 flex flex-col gap-1">
          {dayEvents.slice(0, 2).map(event => (
            <TooltipProvider key={event.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("text-xs p-1 rounded-sm flex items-center gap-1.5 truncate", getEventStyles(event.type))}>
                      <span className="font-semibold truncate">{getEventLabel(event.type)}: {event.title}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-bold">{event.title}</p>
                  <p>Client: {event.clientName}</p>
                  <p>Time: {format(event.date, 'p')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {dayEvents.length > 2 && (
              <div
                role="button"
                onClick={handleMoreClick}
                className="text-xs text-primary hover:underline font-semibold mt-1 text-left cursor-pointer"
              >
                + {dayEvents.length - 2} more
              </div>
          )}
        </div>
      </div>
    );
};

const WeekView = ({ date, events }: { date: Date, events: CalendarEvent[] }) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const days = eachDayOfWeek({ start: weekStart, end: weekEnd });

    return (
        <div className="grid grid-cols-1 md:grid-cols-7 md:divide-x border-t border-b">
            {days.map(day => {
                const dayEvents = events.filter(event => isSameDay(event.date, day));
                return (
                    <div key={day.toString()} className="p-2 min-h-[60vh] md:border-b-0 border-b">
                        <div className="text-center mb-2">
                            <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                            <p className="text-2xl font-bold">{format(day, 'd')}</p>
                        </div>
                        <div className="space-y-2">
                             {dayEvents.map(event => (
                                <TooltipProvider key={event.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn("text-xs p-2 rounded-md", getEventStyles(event.type))}>
                                            <p className="font-semibold">{getEventLabel(event.type)}: {event.title}</p>
                                            <p>{event.clientName}</p>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-bold">{event.title}</p>
                                      <p>Client: {event.clientName}</p>
                                      <p>Time: {format(event.date, 'p')}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                            ))}
                            {dayEvents.length === 0 && <p className="text-xs text-muted-foreground text-center pt-4">No events</p>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const DayView = ({ date, events }: { date: Date, events: CalendarEvent[] }) => {
    const dayEvents = events.filter(event => isSameDay(event.date, date));
    return (
        <Card className="m-6">
            <CardHeader>
                <CardTitle>{format(date, 'PPPP')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {dayEvents.length > 0 ? dayEvents.map(event => (
                         <TooltipProvider key={event.id}>
                           <Tooltip>
                             <TooltipTrigger asChild>
                                <div className={cn("p-4 rounded-lg", getEventStyles(event.type))}>
                                    <p className="font-bold">{getEventLabel(event.type)}: {event.title}</p>
                                    <p className="text-sm">{event.clientName}</p>
                                </div>
                             </TooltipTrigger>
                             <TooltipContent>
                               <p className="font-bold">{event.title}</p>
                               <p>Client: {event.clientName}</p>
                               <p>Time: {format(event.date, 'p')}</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                    )) : <p className="text-muted-foreground text-center py-10">No events scheduled for this day.</p>}
                </div>
            </CardContent>
        </Card>
    )
}

export default function CalendarView() {
  const [date, setDate] = useState<Date>(new Date());
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedOwnerId, setSelectedOwnerId] = useState('all');
  const [selectedClientId, setSelectedClientId] = useState('all');
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
        const [requestsData, remindersData, clientsData, teamMembersData] = await Promise.all([
          getAllRequests(token!),
          getCalendarReminders(token!),
          getClients(token!),
          getTeamMembers(token!),
        ]);

        setClients(clientsData || []);
        setTeamMembers(teamMembersData || []);

        const clientMap = new Map(clientsData.map(c => [c.id, c.full_name]));
        const fetchedEvents: CalendarEvent[] = [];

        requestsData.forEach((req) => {
          const clientIds = Array.isArray(req.client_id) ? req.client_id : (req.client_id ? [req.client_id] : []);
          const ownerId = req.created_by;

          clientIds.forEach(clientId => {
            const clientName = clientMap.get(clientId) || 'Unknown Client';
            if (req.status === 'published' && req.updated_at) {
                fetchedEvents.push({
                  id: `req-pub-${req.id}-${clientId}`,
                  type: 'request-published',
                  date: parseISO(req.updated_at),
                  title: req.title,
                  clientName,
                  clientId,
                  ownerId,
                  data: req,
                });
            }
            if (req.status === 'published' && req.due_date) {
                fetchedEvents.push({
                  id: `req-due-${req.id}-${clientId}`,
                  type: 'request-due',
                  date: parseISO(req.due_date),
                  title: req.title,
                  clientName,
                  clientId,
                  ownerId,
                  data: req,
                });
            }
            if (req.status === 'scheduled' && req.scheduled_at) {
                fetchedEvents.push({
                  id: `req-sch-${req.id}-${clientId}`,
                  type: 'request-scheduled',
                  date: parseISO(req.scheduled_at),
                  title: req.title,
                  clientName,
                  clientId,
                  ownerId,
                  data: req,
                });
            }
          });
        });

        remindersData.forEach((rem: Reminder) => {
          if (!rem.sent) {
            fetchedEvents.push({
              id: `rem-${rem.id}`,
              type: 'reminder',
              date: parseISO(rem.reminder_date),
              title: `${rem.request.title}`,
              clientName: rem.client.full_name,
              clientId: rem.client.id,
              ownerId: rem.request.created_by,
              data: rem,
            });
          }
        });

        setAllEvents(fetchedEvents);
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

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const ownerMatch = selectedOwnerId === 'all' || event.ownerId === Number(selectedOwnerId);
      const clientMatch = selectedClientId === 'all' || event.clientId === Number(selectedClientId);
      return ownerMatch && clientMatch;
    });
  }, [allEvents, selectedOwnerId, selectedClientId]);
  
  const handleDateChange = (increment: number) => {
    if (viewMode === 'month') {
        setDate(current => new Date(current.getFullYear(), current.getMonth() + increment, 1));
    } else if (viewMode === 'week') {
        setDate(current => addWeeks(current, increment));
    } else {
        setDate(current => addDays(current, increment));
    }
  }

  const getHeaderText = () => {
    switch(viewMode) {
      case 'month': return format(date, 'MMMM yyyy');
      case 'week': 
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day': return format(date, 'PPPP');
      default: return '';
    }
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
    <div className="flex flex-col h-full overflow-hidden">
       <header className="flex items-center justify-between p-4 border-b">
         <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setViewMode('month')}>Month</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setViewMode('week')}>Week</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setViewMode('day')}>Day</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Owner <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                    <DropdownMenuRadioItem value="all">All Owners</DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {teamMembers.map(member => (
                        <DropdownMenuRadioItem key={member.id} value={String(member.id)}>{member.name}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Client <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup value={selectedClientId} onValueChange={setSelectedClientId}>
                    <DropdownMenuRadioItem value="all">All Clients</DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {clients.map(client => (
                        <DropdownMenuRadioItem key={client.id} value={String(client.id)}>{client.full_name}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}><ChevronLeft className="h-5 w-5"/></Button>
                <span className="text-lg font-semibold w-48 text-center">{getHeaderText()}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)}><ChevronRight className="h-5 w-5"/></Button>
            </div>
            <Button variant="outline" onClick={() => setDate(new Date())}>TODAY</Button>
         </div>
       </header>
       <div className="flex-1 overflow-auto">
        {viewMode === 'month' && (
             <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                month={date}
                onMonthChange={(month) => setDate(month)}
                className="h-full w-full"
                classNames={{
                    root: 'h-full flex flex-col',
                    months: 'flex-1',
                    month: 'h-full flex flex-col',
                    table: 'w-full border-collapse',
                    head_row: 'grid grid-cols-7',
                    head_cell: 'text-muted-foreground font-normal text-xs uppercase pt-2 pb-2 text-center',
                    row: 'grid grid-cols-1 sm:grid-cols-7 w-full flex-1',
                    cell: 'text-sm text-left p-0 relative focus-within:relative focus-within:z-20 border',
                    day: 'h-full w-full p-0 text-left align-top font-medium aria-selected:opacity-100',
                    day_selected: 'bg-transparent text-primary border-2 border-primary rounded-none',
                    day_today: 'text-primary font-bold',
                    day_outside: 'text-muted-foreground opacity-50',
                }}
                components={{
                    DayContent: (props) => <DayContent {...props} events={filteredEvents} setDate={setDate} setViewMode={setViewMode} />
                }}
            />
        )}
        {viewMode === 'week' && <WeekView date={date} events={filteredEvents} />}
        {viewMode === 'day' && <DayView date={date} events={filteredEvents} />}
       </div>
    </div>
  );
}

