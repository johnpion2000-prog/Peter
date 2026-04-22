import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ordersCol, bookingsCol } from '../firebase/collections';

export type NotifType = 'order' | 'booking';

export interface AdminNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: Timestamp | null;
  read: boolean;
  link: string;
}

const STORAGE_KEY = 'admin_notif_read_ids';

const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};

export const useAdminNotifications = () => {
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  /* merge order + booking snapshots into a single sorted list */
  const [orderItems, setOrderItems]     = useState<AdminNotif[]>([]);
  const [bookingItems, setBookingItems] = useState<AdminNotif[]>([]);

  useEffect(() => {
    const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setOrderItems(
        snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id:        `order_${d.id}`,
            type:      'order' as NotifType,
            title:     'New Order Placed',
            body:      `${data.shippingAddress ?? 'Customer'} — ${formatCurrency(data.total ?? 0)}`,
            createdAt: data.createdAt ?? null,
            read:      false,
            link:      '/admin/orders',
          };
        })
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(bookingsCol, orderBy('createdAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setBookingItems(
        snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id:        `booking_${d.id}`,
            type:      'booking' as NotifType,
            title:     'New Booking Request',
            body:      `${data.userName || data.userEmail || 'Customer'} — ${SERVICE_LABELS[data.serviceType as string] ?? data.serviceType}`,
            createdAt: data.createdAt ?? null,
            read:      false,
            link:      '/admin/bookings',
          };
        })
      );
    });
    return unsub;
  }, []);

  /* combine and sort every time either list changes */
  useEffect(() => {
    const all = [...orderItems, ...bookingItems].sort((a, b) => {
      const ta = a.createdAt?.toMillis() ?? 0;
      const tb = b.createdAt?.toMillis() ?? 0;
      return tb - ta;
    });
    setNotifs(all);
  }, [orderItems, bookingItems]);

  const markAllRead = useCallback(() => {
    setNotifs((prev) => {
      const ids = new Set([...readIds, ...prev.map((n) => n.id)]);
      saveReadIds(ids);
      setReadIds(ids);
      return prev;
    });
  }, [readIds]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      saveReadIds(next);
      return next;
    });
  }, []);

  const enriched = notifs.map((n) => ({ ...n, read: readIds.has(n.id) }));
  const unreadCount = enriched.filter((n) => !n.read).length;

  return { notifs: enriched, unreadCount, markAllRead, markRead };
};

/* ─── tiny helpers duplicated here to avoid circular deps ─── */
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n);

const SERVICE_LABELS: Record<string, string> = {
  vet: 'Veterinary', groomer: 'Pet Grooming', trainer: 'Animal Training',
  consultant: 'Farm Consultation', transport: 'Animal Transport',
};
