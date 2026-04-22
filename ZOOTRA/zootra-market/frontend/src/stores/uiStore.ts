import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isLoading: boolean;
  toasts: Toast[];
  modals: Record<string, boolean>;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toasts: [],
  modals: {},
  setLoading: (isLoading) => set({ isLoading }),
  showToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now().toString(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  openModal: (name) => set((state) => ({ modals: { ...state.modals, [name]: true } })),
  closeModal: (name) => set((state) => ({ modals: { ...state.modals, [name]: false } })),
}));
