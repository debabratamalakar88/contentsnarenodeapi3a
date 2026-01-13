
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCommentNotifications, type Comment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CommentNotificationsProps {}

const getInitials = (name: string): string => {
    if (!name) return '';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}


export function CommentNotifications({}: CommentNotificationsProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'my-requests' | 'all-requests'>('my-requests');
    const [notifications, setNotifications] = useState<Comment[]>([]);
    const [pagination, setPagination] = useState<{ [key: string]: { currentPage: number, hasMore: boolean } }>({
        'my-requests': { currentPage: 1, hasMore: true },
        'all-requests': { currentPage: 1, hasMore: true },
    });
    const [isLoading, setIsLoading] = useState(false);
    
    const fetchNotifications = useCallback(async (tab: 'my-requests' | 'all-requests', page: number) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ title: "Authentication Error", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await getCommentNotifications(token, tab, page);
            const responseData = Array.isArray(response) ? response : (response.data || []);
            
            if (page === 1) {
                setNotifications(responseData);
            } else {
                setNotifications(prev => [...prev, ...responseData]);
            }
            
            setPagination(prev => ({
                ...prev,
                [tab]: {
                    currentPage: response.current_page || page,
                    hasMore: response.last_page ? response.current_page < response.last_page : false,
                }
            }));
            
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || "Failed to fetch notifications", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchNotifications(activeTab, 1);
    }, [activeTab, fetchNotifications]);

    const handleLoadMore = () => {
        const currentPagination = pagination[activeTab];
        if (currentPagination.hasMore && !isLoading) {
            fetchNotifications(activeTab, currentPagination.currentPage + 1);
        }
    };
    
    return (
        <div>
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Comments</h3>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted/50 p-2">
                    <TabsTrigger value="my-requests" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">My Requests</TabsTrigger>
                    <TabsTrigger value="all-requests" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">All Requests</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-80">
                    <TabsContent value={activeTab} className="mt-0">
                        {isLoading && notifications.length === 0 ? (
                            <div className="flex justify-center items-center h-full p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center p-10 text-muted-foreground">
                                <MessageSquare className="mx-auto h-10 w-10 mb-2" />
                                <p>No comments to show.</p>
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {notifications.map(notif => {
                                    if (!notif || !notif.request_id) return null;
                                    const request = 'title' in notif.request_id ? notif.request_id : notif.request;
                                    const user = 'name' in notif.user_id ? notif.user_id : notif.user;

                                    if (!request || !user) return null;
                                    
                                    const isDraft = request.status === 'draft';
                                    const linkHref = isDraft
                                        ? `/dashboard/requests/${request._id}/preview`
                                        : `/dashboard/requests/${request._id}`;

                                    return (
                                        <Link key={notif._id || notif.id} href={linkHref} className="block">
                                            <div className={cn(
                                                "flex items-start gap-3 p-3 rounded-lg hover:bg-muted",
                                                !notif.read_at && "bg-blue-50 hover:bg-blue-100"
                                            )}>
                                                <Avatar className="h-8 w-8 text-xs">
                                                    <AvatarFallback className="bg-green-100 text-green-800">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm"><span className="font-semibold">{user.name}</span> on <span className="font-semibold">{request.title}</span></p>
                                                    <p className="text-sm text-muted-foreground truncate">{notif.comment}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(parseISO(notif.createdAt || notif.created_at), { addSuffix: true })}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
             <div className="p-4 border-t flex justify-start items-center">
                 <Button variant="link" size="sm" onClick={handleLoadMore} disabled={!pagination[activeTab]?.hasMore || isLoading}>
                     {isLoading && pagination[activeTab]?.currentPage > 1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                     Load More Comments
                 </Button>
            </div>
        </div>
    );
}
