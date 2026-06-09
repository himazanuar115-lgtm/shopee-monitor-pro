'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationDropdown from './NotificationDropdown';
import { Notification } from '@/types/notification';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n: Notification) => !n.isRead).length,
    [notifications]
  );

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    // Match existing visual sizing/placement:
    // - right aligned to bell trigger
    // - small top margin
    const width = 320; // matches w-80 (20rem = 320px)
    const left = Math.round(rect.right - width);
    const top = Math.round(rect.bottom + 8); // mt-2

    setPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;

      const inButton = !!buttonRef.current && buttonRef.current.contains(t);
      const inPanel = !!panelRef.current && panelRef.current.contains(t);

      if (!inButton && !inPanel) setIsOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen((v) => !v)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge className="surface-badge-danger absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && pos &&
        createPortal(
          <div 
            ref={panelRef} 
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
          >
            <NotificationDropdown 
              notifications={notifications} 
              onClose={() => setIsOpen(false)} 
            />
          </div>,
          document.body
        )}
    </div>
  );
}
