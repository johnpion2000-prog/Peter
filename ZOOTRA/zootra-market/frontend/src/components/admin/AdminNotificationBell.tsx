import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, CalendarCheck, CheckCheck, Clock } from 'lucide-react';
import { useAdminNotifications, AdminNotif } from '../../hooks/useAdminNotifications';

/* ── relative time helper ── */
const relativeTime = (ts: AdminNotif['createdAt']): string => {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (secs < 60)  return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

const NotifRow: React.FC<{
  notif: AdminNotif;
  onClick: (n: AdminNotif) => void;
}> = ({ notif, onClick }) => {
  const Icon = notif.type === 'order' ? ShoppingBag : CalendarCheck;
  const iconBg = notif.type === 'order' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';

  return (
    <button
      onClick={() => onClick(notif)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
        !notif.read ? 'bg-white' : 'bg-gray-50/40'
      }`}
    >
      {/* icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 justify-between">
          <p className={`text-sm leading-tight ${!notif.read ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}>
            {notif.title}
          </p>
          {!notif.read && (
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{notif.body}</p>
        {notif.createdAt && (
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {relativeTime(notif.createdAt)}
          </p>
        )}
      </div>
    </button>
  );
};

const AdminNotificationBell: React.FC = () => {
  const { notifs, unreadCount, markAllRead, markRead } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /* close panel on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNotifClick = (n: AdminNotif) => {
    markRead(n.id);
    setOpen(false);
    navigate(n.link);
  };

  const handleMarkAll = () => {
    markAllRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-300 mt-0.5">New orders and bookings will appear here</p>
              </div>
            ) : (
              notifs.map((n) => (
                <NotifRow key={n.id} notif={n} onClick={handleNotifClick} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 flex gap-3 justify-end">
              <button
                onClick={() => { setOpen(false); navigate('/admin/orders'); }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View Orders
              </button>
              <button
                onClick={() => { setOpen(false); navigate('/admin/bookings'); }}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View Bookings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
