
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAllRequests, getReminders, type Request, type Reminder, type PaginatedReminders } from '@/lib/api';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CalendarCheck, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  type: 'request-due' | 'request-scheduled' | 'reminder';
  date: Date;
  title: string;
  data: Request | Reminder;
}

export default function CalendarView() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
        const [requestsData, remindersResponse] = await Promise.all([
          getAllRequests(token!),
          getReminders(token!)
        ]);

        const remindersData = remindersResponse.data || [];
        
        const allEvents: CalendarEvent[] = [];

        requestsData.forEach((req) => {
          if (req.status === 'published' && req.due_date) {
            allEvents.push({
              id: `req-due-${req.id}`,
              type: 'request-due',
              date: parseISO(req.due_date),
              title: `Due: ${req.title}`,
              data: req,
            });
          }
          if (req.status === 'scheduled' && req.scheduled_at) {
            allEvents.push({
              id: `req-sch-${req.id}`,
              type: 'request-scheduled',
              date: parseISO(req.scheduled_at),
              title: `Scheduled: ${req.title}`,
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
              title: `Reminder for ${rem.request.title}`,
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

  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(event.date, date)).sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [events, date]);

  const chartData = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(day => ({
      date: format(day, 'dd'),
      count: events.filter(event => isSameDay(event.date, day)).length
    }));
  }, [events, date]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View your upcoming deadlines and schedule.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>{format(date, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '0.5rem',
                            borderColor: 'hsl(var(--border))',
                            backgroundColor: 'hsl(var(--background))',
                          }}
                          labelFormatter={(value) => format(new Date(date.getFullYear(), date.getMonth(), parseInt(value)), 'PPP')}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <div className="row-start-1 lg:row-auto">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(day) => day && setDate(day)}
                        className="w-full"
                        modifiers={{
                            hasEvent: events.map(e => e.date)
                        }}
                        modifiersClassNames={{
                            hasEvent: "bg-primary/20 text-primary-foreground rounded-full",
                        }}
                    />
                </CardContent>
            </Card>
        </div>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Events for {format(date, 'PPP')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3">
                {selectedDayEvents.map(event => (
                  <li key={event.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {event.type === 'request-due' && <Badge variant="destructive"><AlertCircle className="mr-2 h-4 w-4" />Due</Badge>}
                      {event.type === 'request-scheduled' && <Badge variant="secondary"><CalendarCheck className="mr-2 h-4 w-4" />Scheduled</Badge>}
                      {event.type === 'reminder' && <Badge><Clock className="mr-2 h-4 w-4"/>Reminder</Badge>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{event.title}</p>
                      {event.type === 'reminder' && 'client' in event.data && (
                         <p className="text-sm text-muted-foreground">For: {event.data.client.full_name}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">No events for this day.</p>
            )}
          </CardContent>
       </Card>
    </div>
  );
}
