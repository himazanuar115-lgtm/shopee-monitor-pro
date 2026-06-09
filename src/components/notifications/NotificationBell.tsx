'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types/notification';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge className="surface-badge-danger absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="surface-glass absolute right-0 z-50 mt-2 w-80">
          <div className="border-b surface-divider p-4">
            <h3 className="font-semibold text-emphasis">Notifikasi</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.slice(0, 10).map((notification: Notification) => (
                <div
                  key={notification.id}
                  className="surface-hover cursor-pointer border-b surface-divider p-4 transition-colors last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-2 h-2 w-2 rounded-full ${notification.isRead ? 'surface-dot-muted' : 'surface-dot-primary'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emphasis">{notification.title}</p>
                      <p className="mt-1 text-xs text-muted">{notification.message}</p>
                      <p className="mt-2 text-xs text-muted">
                        {new Date(notification.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
