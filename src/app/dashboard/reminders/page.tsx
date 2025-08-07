
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getReminders, deleteReminder, type Reminder, type PaginatedReminders } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { BellRing, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.last_page) {
      return;
    }
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchReminders() {
      setIsLoading(true);
      try {
        const response = await getReminders(token, pagination.current_page);
        setReminders(response.data || []);
        if (response.meta) {
            setPagination({
                current_page: response.meta.current_page,
                last_page: response.meta.last_page,
                total: response.meta.total,
                per_page: 10, // Assuming 10 per page based on API
            });
        }
      } catch (error: any) {
        toast({
          title: 'Error fetching reminders',
          description: error.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchReminders();
  }, [pagination.current_page, router, toast]);
  
  const refetchReminders = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const response = await getReminders(token, pagination.current_page);
    setReminders(response.data || []);
     if (response.meta) {
        setPagination({
            current_page: response.meta.current_page,
            last_page: response.meta.last_page,
            total: response.meta.total,
            per_page: 10,
        });
    }
  };

  const handleDeleteReminder = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !reminderToDelete) return;
    
    try {
        await deleteReminder(token, reminderToDelete.id);
        toast({ title: "Success", description: "Reminder has been disabled." });
        refetchReminders();
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to disable reminder.", variant: "destructive" });
    } finally {
        setReminderToDelete(null);
    }
  }
  
  const canDelete = userRole === 'Administrator' || userRole === 'Editor';

  return (
    <>
        <div className="flex flex-col gap-6 p-6">
        <div>
            <h1 className="text-2xl font-bold">Reminders</h1>
            <p className="text-muted-foreground">
            View and manage all scheduled reminders for your requests.
            </p>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Scheduled Reminders</CardTitle>
            <CardDescription>
                A list of all upcoming and sent reminders for your clients.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center h-64 border-2 border-dashed rounded-lg">
                    <BellRing className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">There are no scheduled reminders.</p>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Request</TableHead>
                        <TableHead>Reminder Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.client.full_name}</TableCell>
                        <TableCell>{reminder.request.title}</TableCell>
                        <TableCell>{format(parseISO(reminder.reminder_date), 'PPP')}</TableCell>
                        <TableCell>
                        <Badge variant={reminder.sent ? 'default' : 'secondary'} className={reminder.sent ? 'bg-green-100 text-green-800' : ''}>
                            {reminder.sent ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                            {reminder.sent ? 'Sent' : 'Pending'}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        {!reminder.sent && canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setReminderToDelete(reminder)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
            </CardContent>
             {pagination.total > pagination.per_page && (
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(pagination.current_page - 1) * pagination.per_page + 1}-{(pagination.current_page - 1) * pagination.per_page + reminders.length}</strong> of <strong>{pagination.total}</strong> reminders
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
        </div>
        <AlertDialog open={!!reminderToDelete} onOpenChange={(isOpen) => !isOpen && setReminderToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to disable this reminder?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. The client will not receive this reminder.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteReminder}>Disable Reminder</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
