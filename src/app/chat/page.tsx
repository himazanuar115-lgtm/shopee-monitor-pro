'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Chat } from '@/types/chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await axios.get('/api/chats?limit=100');
      return response.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      return axios.patch(`/api/chats/${id}`, { reply, status: 'REPLIED', isReplied: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setReplyText('');
      setActiveChatId(null);
    },
  });

  const filteredChats = (chats as Chat[]).filter(
    (chat) =>
      !search ||
      chat.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      chat.message.toLowerCase().includes(search.toLowerCase()) ||
      (chat.productName && chat.productName.toLowerCase().includes(search.toLowerCase()))
  );

  const unreadCount = (chats as Chat[]).filter((c) => c.status === 'UNREAD').length;
  const readCount = (chats as Chat[]).filter((c) => c.status === 'READ').length;
  const repliedCount = (chats as Chat[]).filter((c) => c.status === 'REPLIED').length;

  function handleReply(chatId: string) {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id: chatId, reply: replyText });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emphasis">Chat Monitoring</h1>
        <p className="mt-2 text-muted">Pantau dan balas chat pembeli</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Chat Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-primary">{unreadCount}</p>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Belum Dibalas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-warning">{readCount}</p>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted">Sudah Dibalas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-system-success">{repliedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari chat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Chat list */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredChats.map((chat) => (
          <Card
            key={chat.id}
            className={cn(
              'surface-glass',
              chat.status === 'UNREAD' && 'border-system-primary'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{chat.buyerName}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    chat.status === 'UNREAD'
                      ? 'surface-badge-primary'
                      : chat.status === 'REPLIED'
                      ? 'surface-badge-success'
                      : ''
                  }
                >
                  {chat.status === 'UNREAD' ? 'Baru' : chat.status === 'READ' ? 'Baca' : 'Dibalas'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {chat.productName && (
                <p className="text-sm text-muted">Produk: {chat.productName}</p>
              )}
              <p className="text-sm text-emphasis">{chat.message}</p>

              {chat.reply && (
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted">Balasan:</p>
                  <p className="text-sm text-emphasis">{chat.reply}</p>
                </div>
              )}

              {chat.status !== 'REPLIED' && (
                <div className="space-y-2">
                  {activeChatId === chat.id ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tulis balasan..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReply(chat.id);
                        }}
                      />
                      <Button
                        onClick={() => handleReply(chat.id)}
                        disabled={replyMutation.isPending}
                      >
                        Kirim
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveChatId(null);
                          setReplyText('');
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setActiveChatId(chat.id)}>
                      Balas
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredChats.length === 0 && (
          <p className="col-span-full text-center text-muted">
            Tidak ada chat ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
