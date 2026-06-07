'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Chat } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NOTIFICATION_TYPES } from '@/lib/constants';

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
                className={`p-3 rounded-lg border transition-colors ${
                  chat.status === 'UNREAD'
                    ? 'bg-blue-950 border-blue-700'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">
                      {chat.buyerName}
                    </p>
                    {chat.productName && (
                      <p className="text-xs text-slate-400 mt-1">
                        Produk: {chat.productName}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {chat.message}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={chat.status === 'UNREAD' ? 'bg-blue-600 text-white border-0' : ''}
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
