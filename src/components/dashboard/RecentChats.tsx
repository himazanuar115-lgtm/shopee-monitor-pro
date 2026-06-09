'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Chat } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function RecentChats() {
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['recent-chats'],
    queryFn: async () => {
      const response = await axios.get('/api/chats?limit=10&sort=unread');
      return response.data;
    },
  });

  const unreadChats = chats.filter((chat: Chat) => chat.status === 'UNREAD');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Chat Terbaru</CardTitle>
        <CardDescription>
          {unreadChats.length} chat belum dibaca
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {chats.slice(0, 10).map((chat: Chat) => (
              <div
                key={chat.id}
                className={cn(
                  'p-3',
                  chat.status === 'UNREAD'
                    ? 'surface-row surface-row-active'
                    : 'surface-row'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emphasis">
                      {chat.buyerName}
                    </p>
                    {chat.productName && (
                      <p className="mt-1 text-xs text-muted">
                        Produk: {chat.productName}
                      </p>
                    )}
                    <p className="mt-1 truncate text-xs text-muted">
                      {chat.message}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={chat.status === 'UNREAD' ? 'surface-badge-primary' : ''}
                  >
                    {chat.status === 'UNREAD' ? 'Baru' : 'Baca'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
