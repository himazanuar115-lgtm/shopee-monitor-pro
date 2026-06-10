import React from 'react';
import { X, Bell, Package, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
}) => {
  const getStatusColor = (type: string) => {
    // Dynamic indicators based on event type
    if (type.includes('LOW_STOCK') || type.includes('DROP')) return 'bg-amber-500 shadow-amber-500/20';
    if (type === 'NEW_CHAT') return 'bg-blue-500 shadow-blue-500/20';
    if (type === 'ORDER_UPDATE') return 'bg-emerald-500 shadow-emerald-500/20';
    return 'bg-slate-500 shadow-slate-500/20';
  };

  const getIcon = (type: string) => {
    if (type.includes('LOW_STOCK')) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    if (type === 'NEW_CHAT') return <MessageSquare className="h-4 w-4 text-blue-500" />;
    if (type === 'ORDER_UPDATE') return <Package className="h-4 w-4 text-emerald-500" />;
    return <Bell className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="absolute right-0 mt-3 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-100 tracking-tight text-sm uppercase">Notifikasi</h3>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/30 font-medium">
              {notifications.filter((n) => !n.isRead).length} Baru
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-slate-800 rounded-md"
        >
          <X size={18} />
        </button>
      </div>

      {/* Notification List Area */}
      <div className="max-h-[480px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onMarkAsRead?.(item.id)}
              className={`group flex gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:bg-slate-800/60 hover:border-slate-750 ${
                !item.isRead ? 'bg-slate-800/30' : ''
              }`}
            >
              {/* Dynamic Status Indicator Wrapper */}
              <div className="relative mt-1.5 shrink-0">
                <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${getStatusColor(item.type)}`} />
                {!item.isRead && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-semibold leading-tight ${!item.isRead ? 'text-white' : 'text-slate-100'}`}>
                    {item.title}
                  </p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {getIcon(item.type)}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
                <span className="text-[10px] text-slate-500 font-medium mt-2 block uppercase tracking-wider">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: id })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 text-slate-600">
              <Bell size={24} />
            </div>
            <p className="text-sm text-slate-500">Tidak ada notifikasi baru untuk saat ini.</p>
          </div>
        )}
      </div>

      {/* Footer / Action Section */}
      <div className="p-3 bg-slate-800/30 border-t border-slate-800 text-center">
        <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors tracking-widest uppercase">
          Lihat Semua Aktivitas
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;